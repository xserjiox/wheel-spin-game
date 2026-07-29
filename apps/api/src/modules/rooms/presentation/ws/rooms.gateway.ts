import { Logger } from "@nestjs/common";
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
  passwordSchema,
  proposalReviewSchema,
  roomCodeSchema,
  spinSchema,
  titleSchema,
} from "../../contracts/room.contracts";
import { roomCookieName } from "../../../../shared/config/room.config";
import { SessionService } from "../../../../shared/security/session.service";
import { RoomsService } from "../../application/rooms.service";

type ClientData = {
  code?: string;
  participant?: Pick<
    Participant,
    "id" | "roomId" | "displayName" | "normalizedName" | "role" | "sessionHash"
  >;
};

// Socket.IO event names are validated by the gateway handlers and Zod schemas.
// Keeping the transport generic avoids duplicating every callback signature here.
type RoomSocket = Socket<any, any, any, ClientData>;

@WebSocketGateway({
  path: "/socket.io",
  transports: ["websocket"],
  cors: { origin: false },
})
export class RoomsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;

  private readonly logger = new Logger(RoomsGateway.name);

  constructor(
    private readonly rooms: RoomsService,
    private readonly sessions: SessionService,
  ) {}

  handleConnection(client: RoomSocket): void {
    client.emit("connection.ready", { connected: true });
  }

  handleDisconnect(client: RoomSocket): void {
    const code = client.data.code;
    if (!code) return;

    setTimeout(() => {
      void this.broadcastState(code).catch((error) => {
        this.logger.error("Не удалось обновить статусы участников", error);
      });
    }, 5_000);
  }

  @SubscribeMessage("room.join")
  async join(@ConnectedSocket() client: RoomSocket, @MessageBody() body: unknown) {
    return this.safe(async () => {
      const code = roomCodeSchema.parse((body as { code?: unknown })?.code);
      const token = this.sessions.readCookie(
        client.handshake.headers.cookie,
        roomCookieName(code),
      );
      const participant = await this.rooms.authenticate(code, token);
      client.data.code = code;
      client.data.participant = participant;
      await client.join(this.channel(code));
      const onlineParticipantIds = await this.getOnlineParticipantIds(code);
      const state = await this.rooms.getState(code, participant, onlineParticipantIds);
      await this.broadcastState(code);
      return { state };
    });
  }

  @SubscribeMessage("room.updateTitle")
  async updateTitle(
    @ConnectedSocket() client: RoomSocket,
    @MessageBody() body: unknown,
  ) {
    return this.mutate(client, async (participant) => {
      const { title } = titleSchema.parse(body);
      await this.rooms.updateTitle(client.data.code!, participant, title);
    });
  }

  @SubscribeMessage("room.updatePassword")
  async updatePassword(
    @ConnectedSocket() client: RoomSocket,
    @MessageBody() body: unknown,
  ) {
    return this.mutate(client, async (participant) => {
      const { password } = passwordSchema.parse(body);
      await this.rooms.updatePassword(participant, password);
    });
  }

  @SubscribeMessage("option.add")
  async addOption(@ConnectedSocket() client: RoomSocket, @MessageBody() body: unknown) {
    return this.mutate(client, async (participant) => {
      const { label } = optionSchema.parse(body);
      await this.rooms.addOption(participant, label);
    });
  }

  @SubscribeMessage("option.remove")
  async removeOption(
    @ConnectedSocket() client: RoomSocket,
    @MessageBody() body: unknown,
  ) {
    return this.mutate(client, async (participant) => {
      const { optionId } = optionRemoveSchema.parse(body);
      await this.rooms.removeOption(participant, optionId);
    });
  }

  @SubscribeMessage("proposal.create")
  async createProposal(
    @ConnectedSocket() client: RoomSocket,
    @MessageBody() body: unknown,
  ) {
    return this.mutate(client, async (participant) => {
      const { label } = optionSchema.parse(body);
      await this.rooms.createProposal(participant, label);
    });
  }

  @SubscribeMessage("proposal.review")
  async reviewProposal(
    @ConnectedSocket() client: RoomSocket,
    @MessageBody() body: unknown,
  ) {
    return this.mutate(client, async (participant) => {
      const { proposalId, decision } = proposalReviewSchema.parse(body);
      await this.rooms.reviewProposal(participant, proposalId, decision);
    });
  }

  @SubscribeMessage("participant.kick")
  async kickParticipant(
    @ConnectedSocket() client: RoomSocket,
    @MessageBody() body: unknown,
  ) {
    return this.safe(async () => {
      const participant = this.requireParticipant(client);
      const { participantId } = participantKickSchema.parse(body);
      await this.rooms.kickParticipant(participant, participantId);

      const sockets = await this.server
        .in(this.channel(client.data.code!))
        .fetchSockets();
      sockets
        .filter(
          (socket) =>
            (socket.data.participant as ClientData["participant"])?.id ===
            participantId,
        )
        .forEach((socket) => {
          socket.emit("participant.kicked");
          socket.disconnect(true);
        });

      await this.broadcastState(client.data.code!);
      return {};
    });
  }

  @SubscribeMessage("spin.start")
  async spin(@ConnectedSocket() client: RoomSocket, @MessageBody() body: unknown) {
    return this.safe(async () => {
      const participant = this.requireParticipant(client);
      const { requestId, durationMs } = spinSchema.parse(body);
      const spin = await this.rooms.spin(participant, requestId, durationMs);
      await this.broadcastState(client.data.code!);
      const finishIn = Math.max(
        0,
        new Date(spin!.startedAt).getTime() + spin!.durationMs - Date.now(),
      );
      setTimeout(async () => {
        try {
          if (await this.rooms.finishSpin(participant.roomId, spin!.id)) {
            await this.broadcastState(client.data.code!);
          }
        } catch (error) {
          this.logger.error("Не удалось завершить вращение", error);
        }
      }, finishIn + 80);
      return { spin };
    });
  }

  @SubscribeMessage("spin.cancel")
  async cancelSpin(@ConnectedSocket() client: RoomSocket) {
    return this.safe(async () => {
      const participant = this.requireParticipant(client);
      const spinId = await this.rooms.cancelSpin(participant);
      this.server.to(this.channel(client.data.code!)).emit("spin.canceled", { spinId });
      await this.broadcastState(client.data.code!);
      return {};
    });
  }

  private async mutate(
    client: RoomSocket,
    action: (participant: NonNullable<ClientData["participant"]>) => Promise<void>,
  ) {
    return this.safe(async () => {
      const participant = this.requireParticipant(client);
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

  private async broadcastState(code: string): Promise<void> {
    const sockets = await this.server.in(this.channel(code)).fetchSockets();
    const onlineParticipantIds = new Set(
      sockets
        .map((socket) => (socket.data.participant as ClientData["participant"])?.id)
        .filter((participantId): participantId is string => Boolean(participantId)),
    );
    await Promise.all(
      sockets.map(async (socket) => {
        const participant = socket.data.participant as ClientData["participant"];
        if (!participant) return;
        const state = await this.rooms.getState(
          code,
          participant,
          onlineParticipantIds,
        );
        socket.emit("room.state", state);
      }),
    );
  }

  private async getOnlineParticipantIds(code: string): Promise<Set<string>> {
    const sockets = await this.server.in(this.channel(code)).fetchSockets();
    return new Set(
      sockets
        .map((socket) => (socket.data.participant as ClientData["participant"])?.id)
        .filter((participantId): participantId is string => Boolean(participantId)),
    );
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
