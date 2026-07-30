import { Logger, OnModuleDestroy } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import type { Participant } from "@prisma/client";
import type { Server, Socket } from "socket.io";
import {
  optionRemoveSchema,
  optionSchema,
  participantKickSchema,
  participantSpinPermissionSchema,
  passwordSchema,
  proposalRemoveSchema,
  proposalReviewSchema,
  proposalUpdateSchema,
  type PublicRoomState,
  roomCodeSchema,
  spinSchema,
  titleSchema,
} from "../../contracts/room.contracts";
import { roomCookieName } from "../../../../shared/config/room.config";
import { SessionService } from "../../../../shared/security/session.service";
import { RoomsService } from "../../application/rooms.service";
import { JoinLimiterService } from "../../infrastructure/join-limiter.service";

type ClientData = {
  code?: string;
  participant?: Pick<Participant, "id" | "roomId" | "displayName" | "role">;
};

// Socket.IO event names are validated by the gateway handlers and Zod schemas.
// Keeping the transport generic avoids duplicating every callback signature here.
type RoomSocket = Socket<any, any, any, ClientData>;

@WebSocketGateway({
  path: "/socket.io",
  transports: ["websocket"],
  cors: { origin: false },
})
export class RoomsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleDestroy
{
  @WebSocketServer()
  private server: Server;

  private readonly logger = new Logger(RoomsGateway.name);
  private readonly disconnectTimers = new Map<string, NodeJS.Timeout>();
  private readonly spinTimers = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly rooms: RoomsService,
    private readonly sessions: SessionService,
    private readonly limiter: JoinLimiterService,
  ) {}

  handleConnection(client: RoomSocket): void {
    client.emit("connection.ready", { connected: true });
  }

  handleDisconnect(client: RoomSocket): void {
    const code = client.data.code;
    if (!code) return;

    const existing = this.disconnectTimers.get(code);
    if (existing) clearTimeout(existing);
    const timer = setTimeout(() => {
      this.disconnectTimers.delete(code);
      void this.broadcastState(code).catch((error) => {
        this.logger.error("Не удалось обновить статусы участников", error);
      });
    }, 5_000);
    timer.unref();
    this.disconnectTimers.set(code, timer);
  }

  onModuleDestroy(): void {
    this.disconnectTimers.forEach((timer) => clearTimeout(timer));
    this.spinTimers.forEach((timer) => clearTimeout(timer));
    this.disconnectTimers.clear();
    this.spinTimers.clear();
  }

  @SubscribeMessage("room.join")
  async join(@ConnectedSocket() client: RoomSocket, @MessageBody() body: unknown) {
    return this.safe(async () => {
      const code = roomCodeSchema.parse((body as { code?: unknown })?.code);
      await this.limiter.assertSocketJoinAllowed(client.handshake.address, code);
      const token = this.sessions.readCookie(
        client.handshake.headers.cookie,
        roomCookieName(code),
      );
      const participant = await this.rooms.authenticate(code, token);
      client.data.code = code;
      client.data.participant = participant;
      await client.join(this.channel(code));
      const states = await this.broadcastState(code);
      const state = states.get(participant.id);
      if (!state) throw new Error("Сессия комнаты недействительна");
      return { state };
    });
  }

  @SubscribeMessage("room.updateTitle")
  async updateTitle(
    @ConnectedSocket() client: RoomSocket,
    @MessageBody() body: unknown,
  ) {
    return this.mutate(client, "room.updateTitle", async (participant) => {
      const { title } = titleSchema.parse(body);
      await this.rooms.updateTitle(client.data.code!, participant, title);
    });
  }

  @SubscribeMessage("room.updatePassword")
  async updatePassword(
    @ConnectedSocket() client: RoomSocket,
    @MessageBody() body: unknown,
  ) {
    return this.mutate(client, "room.updatePassword", async (participant) => {
      const { password } = passwordSchema.parse(body);
      await this.rooms.updatePassword(participant, password);
    });
  }

  @SubscribeMessage("option.add")
  async addOption(@ConnectedSocket() client: RoomSocket, @MessageBody() body: unknown) {
    return this.mutate(client, "option.add", async (participant) => {
      const { label } = optionSchema.parse(body);
      await this.rooms.addOption(participant, label);
    });
  }

  @SubscribeMessage("option.remove")
  async removeOption(
    @ConnectedSocket() client: RoomSocket,
    @MessageBody() body: unknown,
  ) {
    return this.mutate(client, "option.remove", async (participant) => {
      const { optionId } = optionRemoveSchema.parse(body);
      await this.rooms.removeOption(participant, optionId);
    });
  }

  @SubscribeMessage("proposal.create")
  async createProposal(
    @ConnectedSocket() client: RoomSocket,
    @MessageBody() body: unknown,
  ) {
    return this.mutate(client, "proposal.create", async (participant) => {
      const { label } = optionSchema.parse(body);
      await this.rooms.createProposal(participant, label);
    });
  }

  @SubscribeMessage("proposal.review")
  async reviewProposal(
    @ConnectedSocket() client: RoomSocket,
    @MessageBody() body: unknown,
  ) {
    return this.mutate(client, "proposal.review", async (participant) => {
      const { proposalId, decision } = proposalReviewSchema.parse(body);
      await this.rooms.reviewProposal(participant, proposalId, decision);
    });
  }

  @SubscribeMessage("proposal.update")
  async updateProposal(
    @ConnectedSocket() client: RoomSocket,
    @MessageBody() body: unknown,
  ) {
    return this.mutate(client, "proposal.update", async (participant) => {
      const { proposalId, label } = proposalUpdateSchema.parse(body);
      await this.rooms.updateOwnProposal(participant, proposalId, label);
    });
  }

  @SubscribeMessage("proposal.remove")
  async removeProposal(
    @ConnectedSocket() client: RoomSocket,
    @MessageBody() body: unknown,
  ) {
    return this.mutate(client, "proposal.remove", async (participant) => {
      const { proposalId } = proposalRemoveSchema.parse(body);
      await this.rooms.removeOwnProposal(participant, proposalId);
    });
  }

  @SubscribeMessage("participant.kick")
  async kickParticipant(
    @ConnectedSocket() client: RoomSocket,
    @MessageBody() body: unknown,
  ) {
    return this.safe(async () => {
      const participant = this.requireParticipant(client);
      await this.limiter.assertMutationAllowed(participant.id, "participant.kick");
      const { participantId } = participantKickSchema.parse(body);
      await this.rooms.kickParticipant(participant, participantId);
      await this.disconnectParticipant(
        client.data.code!,
        participantId,
        "participant.kicked",
      );
      return {};
    });
  }

  @SubscribeMessage("participant.spinPermission")
  async setSpinPermission(
    @ConnectedSocket() client: RoomSocket,
    @MessageBody() body: unknown,
  ) {
    return this.mutate(client, "participant.spinPermission", async (participant) => {
      const { participantId, canSpin } = participantSpinPermissionSchema.parse(body);
      await this.rooms.setSpinPermission(participant, participantId, canSpin);
    });
  }

  @SubscribeMessage("spin.start")
  async spin(@ConnectedSocket() client: RoomSocket, @MessageBody() body: unknown) {
    return this.safe(async () => {
      const participant = this.requireParticipant(client);
      await this.limiter.assertMutationAllowed(participant.id, "spin.start");
      const { requestId, durationMs } = spinSchema.parse(body);
      const spin = await this.rooms.spin(participant, requestId, durationMs);
      await this.broadcastState(client.data.code!);
      const finishIn = Math.max(
        0,
        new Date(spin!.startedAt).getTime() + spin!.durationMs - Date.now(),
      );
      const timer = setTimeout(async () => {
        this.spinTimers.delete(spin!.id);
        try {
          if (await this.rooms.finishSpin(participant.roomId, spin!.id)) {
            await this.broadcastState(client.data.code!);
          }
        } catch (error) {
          this.logger.error("Не удалось завершить вращение", error);
        }
      }, finishIn + 80);
      timer.unref();
      const previousTimer = this.spinTimers.get(spin!.id);
      if (previousTimer) clearTimeout(previousTimer);
      this.spinTimers.set(spin!.id, timer);
      return { spin };
    });
  }

  @SubscribeMessage("spin.cancel")
  async cancelSpin(@ConnectedSocket() client: RoomSocket) {
    return this.safe(async () => {
      const participant = this.requireParticipant(client);
      await this.limiter.assertMutationAllowed(participant.id, "spin.cancel");
      const spinId = await this.rooms.cancelSpin(participant);
      const timer = this.spinTimers.get(spinId);
      if (timer) {
        clearTimeout(timer);
        this.spinTimers.delete(spinId);
      }
      this.server.to(this.channel(client.data.code!)).emit("spin.canceled", { spinId });
      await this.broadcastState(client.data.code!);
      return {};
    });
  }

  async disconnectParticipant(
    code: string,
    participantId: string,
    event: "participant.kicked" | "participant.deleted",
  ): Promise<void> {
    const sockets = await this.server.in(this.channel(code)).fetchSockets();
    sockets
      .filter(
        (socket) =>
          (socket.data.participant as ClientData["participant"])?.id === participantId,
      )
      .forEach((socket) => {
        socket.data.code = undefined;
        socket.emit(event);
        socket.disconnect(true);
      });
    await this.broadcastState(code);
  }

  async disconnectRoom(code: string): Promise<void> {
    const sockets = await this.server.in(this.channel(code)).fetchSockets();
    sockets.forEach((socket) => {
      socket.data.code = undefined;
      socket.emit("room.deleted");
      socket.disconnect(true);
    });
  }

  private async mutate(
    client: RoomSocket,
    actionName: string,
    action: (participant: NonNullable<ClientData["participant"]>) => Promise<void>,
  ) {
    return this.safe(async () => {
      const participant = this.requireParticipant(client);
      await this.limiter.assertMutationAllowed(participant.id, actionName);
      await action(participant);
      await this.broadcastState(client.data.code!);
      return {};
    });
  }

  private requireParticipant(
    client: RoomSocket,
  ): NonNullable<ClientData["participant"]> {
    if (!client.data.participant || !client.data.code) {
      throw new Error("Сначала войдите в комнату");
    }
    return client.data.participant;
  }

  private async broadcastState(code: string): Promise<Map<string, PublicRoomState>> {
    const sockets = await this.server.in(this.channel(code)).fetchSockets();
    if (sockets.length === 0) return new Map<string, PublicRoomState>();
    const onlineParticipantIds = new Set(
      sockets
        .map((socket) => (socket.data.participant as ClientData["participant"])?.id)
        .filter((participantId): participantId is string => Boolean(participantId)),
    );
    const participants = [
      ...new Map(
        sockets
          .map((socket) => socket.data.participant as ClientData["participant"])
          .filter(
            (participant): participant is NonNullable<ClientData["participant"]> =>
              Boolean(participant),
          )
          .map((participant) => [participant.id, participant]),
      ).values(),
    ];
    const states = await this.rooms.getStates(code, participants, onlineParticipantIds);
    sockets.forEach((socket) => {
      const participant = socket.data.participant as ClientData["participant"];
      const state = participant ? states.get(participant.id) : undefined;
      if (state) socket.emit("room.state", state);
    });
    return states;
  }

  private channel(code: string): string {
    return `room:${code}`;
  }

  private async safe<T extends Record<string, unknown>>(
    action: () => Promise<T>,
  ): Promise<({ ok: true } & T) | { ok: false; error: string }> {
    try {
      return { ok: true, ...(await action()) };
    } catch (error) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string"
          ? error.message
          : "Что-то пошло не так";
      return { ok: false, error: message.replace(/^.*?: /, "") };
    }
  }
}
