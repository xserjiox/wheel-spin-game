import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ParticipantRole, Prisma, ProposalStatus, RoomStatus } from "@prisma/client";
import { hash as hashPassword, verify as verifyPassword } from "@node-rs/argon2";
import { randomInt } from "node:crypto";
import {
  DEFAULT_OPTIONS,
  HISTORY_LIMIT,
  MAX_OPTIONS,
  MAX_PARTICIPANTS,
  MAX_PENDING_PROPOSALS,
  ROOM_TTL_MS,
} from "../../../shared/config/room.config";
import { PrismaService } from "../../../shared/database/prisma.service";
import { SessionService } from "../../../shared/security/session.service";
import type {
  CreateRoomInput,
  JoinRoomInput,
  PublicRoomState,
} from "../contracts/room.contracts";
import { assignAvailableName, normalizeDisplayName } from "../domain/name-policy";
import { calculateFinalRotation } from "../domain/wheel-engine";

const participantSelect = {
  id: true,
  roomId: true,
  displayName: true,
  normalizedName: true,
  role: true,
  sessionHash: true,
} satisfies Prisma.ParticipantSelect;

type SessionParticipant = Prisma.ParticipantGetPayload<{
  select: typeof participantSelect;
}>;

@Injectable()
export class RoomsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessions: SessionService,
  ) {}

  async create(input: CreateRoomInput): Promise<{
    code: string;
    token: string;
    state: PublicRoomState;
  }> {
    const session = this.sessions.create();
    const passwordHash = input.password ? await hashPassword(input.password) : null;
    const options = input.options ?? DEFAULT_OPTIONS;
    const expiresAt = new Date(Date.now() + ROOM_TTL_MS);

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const code = this.generateCode();
      try {
        const room = await this.prisma.room.create({
          data: {
            code,
            title: input.title,
            passwordHash,
            expiresAt,
            participants: {
              create: {
                displayName: input.hostName,
                normalizedName: normalizeDisplayName(input.hostName),
                role: ParticipantRole.HOST,
                sessionHash: session.hash,
              },
            },
            options: {
              create: options.map((label, position) => ({ label, position })),
            },
          },
          include: { participants: { select: participantSelect } },
        });
        const host = room.participants[0];
        return {
          code,
          token: session.token,
          state: await this.getState(code, host),
        };
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          continue;
        }
        throw error;
      }
    }
    throw new BadRequestException("Не удалось создать код комнаты");
  }

  async meta(code: string): Promise<{
    code: string;
    title: string;
    requiresPassword: boolean;
  }> {
    const room = await this.prisma.room.findUnique({
      where: { code },
      select: {
        code: true,
        title: true,
        passwordHash: true,
        expiresAt: true,
        status: true,
      },
    });
    if (!room || room.status === RoomStatus.CLOSED || room.expiresAt <= new Date()) {
      throw new NotFoundException("Комната не найдена или уже закрыта");
    }
    return {
      code: room.code,
      title: room.title,
      requiresPassword: Boolean(room.passwordHash),
    };
  }

  async join(
    code: string,
    input: JoinRoomInput,
  ): Promise<{ token: string; state: PublicRoomState }> {
    const room = await this.prisma.room.findUnique({
      where: { code },
      include: { participants: { select: participantSelect } },
    });
    if (!room || room.status === RoomStatus.CLOSED || room.expiresAt <= new Date()) {
      throw new NotFoundException("Комната не найдена или уже закрыта");
    }
    if (
      room.passwordHash &&
      !(await verifyPassword(room.passwordHash, input.password))
    ) {
      throw new ForbiddenException("Неверный пароль");
    }
    if (room.participants.length >= MAX_PARTICIPANTS) {
      throw new BadRequestException("В комнате уже максимальное число участников");
    }

    const displayName = assignAvailableName(
      input.name,
      room.participants.map((participant) => participant.normalizedName),
    );
    const session = this.sessions.create();
    const participant = await this.prisma.participant.create({
      data: {
        roomId: room.id,
        displayName,
        normalizedName: normalizeDisplayName(displayName),
        role: ParticipantRole.GUEST,
        sessionHash: session.hash,
      },
      select: participantSelect,
    });
    await this.touch(room.id);
    return { token: session.token, state: await this.getState(code, participant) };
  }

  async authenticate(code: string, token: string | null): Promise<SessionParticipant> {
    if (!token) throw new ForbiddenException("Сначала войдите в комнату");
    const participant = await this.prisma.participant.findFirst({
      where: {
        sessionHash: this.sessions.hash(token),
        room: { code, expiresAt: { gt: new Date() }, status: { not: "CLOSED" } },
      },
      select: participantSelect,
    });
    if (!participant) throw new ForbiddenException("Сессия комнаты недействительна");
    await this.prisma.participant.update({
      where: { id: participant.id },
      data: { lastSeenAt: new Date() },
    });
    return participant;
  }

  async getState(
    code: string,
    participant: SessionParticipant,
  ): Promise<PublicRoomState> {
    await this.finalizeSpinIfNeeded(code);
    const room = await this.prisma.room.findUnique({
      where: { code },
      include: {
        options: { orderBy: { position: "asc" } },
        proposals: {
          where: { status: ProposalStatus.PENDING },
          orderBy: { createdAt: "asc" },
          select: { id: true, label: true, createdAt: true },
        },
        spins: {
          orderBy: { createdAt: "desc" },
          take: HISTORY_LIMIT + 1,
          select: {
            id: true,
            winnerLabel: true,
            createdAt: true,
            optionsSnapshot: true,
            winnerIndex: true,
            startedAt: true,
            durationMs: true,
            finalRotation: true,
          },
        },
        _count: { select: { participants: true } },
      },
    });
    if (!room) throw new NotFoundException("Комната не найдена");

    const activeRecord =
      room.status === RoomStatus.SPINNING && room.activeSpinId
        ? (room.spins.find((spin) => spin.id === room.activeSpinId) ??
          (await this.prisma.spin.findUnique({ where: { id: room.activeSpinId } })))
        : null;

    return {
      code: room.code,
      title: room.title,
      status: room.status,
      version: room.version,
      role: participant.role,
      displayName: participant.displayName,
      participantCount: room._count.participants,
      options: room.options.map(({ id, label, position }) => ({
        id,
        label,
        position,
      })),
      proposals:
        participant.role === ParticipantRole.HOST
          ? room.proposals.map((proposal) => ({
              ...proposal,
              createdAt: proposal.createdAt.toISOString(),
            }))
          : [],
      history: room.spins
        .filter((spin) => spin.id !== room.activeSpinId)
        .slice(0, HISTORY_LIMIT)
        .map((spin) => ({
          id: spin.id,
          winnerLabel: spin.winnerLabel,
          createdAt: spin.createdAt.toISOString(),
        })),
      activeSpin: activeRecord
        ? {
            id: activeRecord.id,
            optionsSnapshot: activeRecord.optionsSnapshot as PublicRoomState["options"],
            winnerIndex: activeRecord.winnerIndex,
            winnerLabel: activeRecord.winnerLabel,
            startedAt: activeRecord.startedAt.toISOString(),
            durationMs: activeRecord.durationMs,
            finalRotation: activeRecord.finalRotation,
          }
        : null,
      hasPassword: Boolean(room.passwordHash),
      expiresAt: room.expiresAt.toISOString(),
    };
  }

  async updateTitle(
    code: string,
    participant: SessionParticipant,
    title: string,
  ): Promise<void> {
    this.assertHost(participant);
    await this.assertEditable(participant.roomId);
    await this.prisma.room.update({
      where: { id: participant.roomId },
      data: { title, version: { increment: 1 }, ...this.activityData() },
    });
  }

  async updatePassword(
    participant: SessionParticipant,
    password: string,
  ): Promise<void> {
    this.assertHost(participant);
    await this.assertEditable(participant.roomId);
    await this.prisma.room.update({
      where: { id: participant.roomId },
      data: {
        passwordHash: password ? await hashPassword(password) : null,
        version: { increment: 1 },
        ...this.activityData(),
      },
    });
  }

  async addOption(participant: SessionParticipant, label: string): Promise<void> {
    this.assertHost(participant);
    await this.assertEditable(participant.roomId);
    await this.prisma.$transaction(async (tx) => {
      const count = await tx.option.count({ where: { roomId: participant.roomId } });
      if (count >= MAX_OPTIONS) throw new BadRequestException("Достигнут лимит слотов");
      await tx.option.create({
        data: { roomId: participant.roomId, label, position: count },
      });
      await tx.room.update({
        where: { id: participant.roomId },
        data: { version: { increment: 1 }, ...this.activityData() },
      });
    });
  }

  async removeOption(participant: SessionParticipant, optionId: string): Promise<void> {
    this.assertHost(participant);
    await this.assertEditable(participant.roomId);
    await this.prisma.$transaction(async (tx) => {
      const option = await tx.option.findFirst({
        where: { id: optionId, roomId: participant.roomId },
      });
      if (!option) throw new NotFoundException("Слот не найден");
      await tx.option.delete({ where: { id: optionId } });
      const following = await tx.option.findMany({
        where: { roomId: participant.roomId, position: { gt: option.position } },
        orderBy: { position: "asc" },
      });
      for (const current of following) {
        await tx.option.update({
          where: { id: current.id },
          data: { position: current.position - 1 },
        });
      }
      await tx.room.update({
        where: { id: participant.roomId },
        data: { version: { increment: 1 }, ...this.activityData() },
      });
    });
  }

  async createProposal(participant: SessionParticipant, label: string): Promise<void> {
    if (participant.role === ParticipantRole.HOST) {
      throw new BadRequestException("Host может добавить слот напрямую");
    }
    await this.assertEditable(participant.roomId);
    const pending = await this.prisma.proposal.count({
      where: {
        participantId: participant.id,
        status: ProposalStatus.PENDING,
      },
    });
    if (pending >= MAX_PENDING_PROPOSALS) {
      throw new BadRequestException("У вас уже 10 предложений на рассмотрении");
    }
    await this.prisma.$transaction([
      this.prisma.proposal.create({
        data: { roomId: participant.roomId, participantId: participant.id, label },
      }),
      this.prisma.room.update({
        where: { id: participant.roomId },
        data: { version: { increment: 1 }, ...this.activityData() },
      }),
    ]);
  }

  async reviewProposal(
    participant: SessionParticipant,
    proposalId: string,
    decision: "accept" | "reject",
  ): Promise<void> {
    this.assertHost(participant);
    await this.assertEditable(participant.roomId);
    await this.prisma.$transaction(async (tx) => {
      const proposal = await tx.proposal.findFirst({
        where: {
          id: proposalId,
          roomId: participant.roomId,
          status: ProposalStatus.PENDING,
        },
      });
      if (!proposal) throw new NotFoundException("Предложение уже обработано");
      if (decision === "accept") {
        const count = await tx.option.count({ where: { roomId: participant.roomId } });
        if (count >= MAX_OPTIONS)
          throw new BadRequestException("Достигнут лимит слотов");
        await tx.option.create({
          data: {
            roomId: participant.roomId,
            label: proposal.label,
            position: count,
          },
        });
      }
      await tx.proposal.update({
        where: { id: proposal.id },
        data: {
          status:
            decision === "accept" ? ProposalStatus.ACCEPTED : ProposalStatus.REJECTED,
          reviewedAt: new Date(),
        },
      });
      await tx.room.update({
        where: { id: participant.roomId },
        data: { version: { increment: 1 }, ...this.activityData() },
      });
    });
  }

  async spin(
    participant: SessionParticipant,
    requestId: string,
    durationMs: number,
  ): Promise<PublicRoomState["activeSpin"]> {
    this.assertHost(participant);
    const existing = await this.prisma.spin.findUnique({
      where: { roomId_requestId: { roomId: participant.roomId, requestId } },
    });
    if (existing) {
      return {
        id: existing.id,
        optionsSnapshot: existing.optionsSnapshot as PublicRoomState["options"],
        winnerIndex: existing.winnerIndex,
        winnerLabel: existing.winnerLabel,
        startedAt: existing.startedAt.toISOString(),
        durationMs: existing.durationMs,
        finalRotation: existing.finalRotation,
      };
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const claim = await tx.room.updateMany({
        where: { id: participant.roomId, status: RoomStatus.LOBBY },
        data: { status: RoomStatus.SPINNING },
      });
      if (claim.count !== 1) throw new BadRequestException("Колесо уже вращается");

      const room = await tx.room.findUniqueOrThrow({
        where: { id: participant.roomId },
        include: { options: { orderBy: { position: "asc" } } },
      });
      if (room.options.length < 2) {
        throw new BadRequestException("Добавьте хотя бы два слота");
      }
      const winnerIndex = randomInt(room.options.length);
      const winner = room.options[winnerIndex];
      const finalRotation = calculateFinalRotation({
        optionCount: room.options.length,
        winnerIndex,
        currentRotation: room.currentRotation,
        durationMs,
      });
      const startedAt = new Date(Date.now() + 350);
      const snapshot = room.options.map(({ id, label, position }) => ({
        id,
        label,
        position,
      }));
      const spin = await tx.spin.create({
        data: {
          roomId: room.id,
          requestId,
          optionsSnapshot: snapshot,
          winnerOptionId: winner.id,
          winnerIndex,
          winnerLabel: winner.label,
          startedAt,
          durationMs,
          finalRotation,
        },
      });
      await tx.room.update({
        where: { id: room.id },
        data: {
          activeSpinId: spin.id,
          currentRotation: finalRotation,
          version: { increment: 1 },
          ...this.activityData(),
        },
      });
      return spin;
    });

    return {
      id: result.id,
      optionsSnapshot: result.optionsSnapshot as PublicRoomState["options"],
      winnerIndex: result.winnerIndex,
      winnerLabel: result.winnerLabel,
      startedAt: result.startedAt.toISOString(),
      durationMs: result.durationMs,
      finalRotation: result.finalRotation,
    };
  }

  async finishSpin(roomId: string, spinId: string): Promise<boolean> {
    const result = await this.prisma.room.updateMany({
      where: { id: roomId, status: RoomStatus.SPINNING, activeSpinId: spinId },
      data: {
        status: RoomStatus.LOBBY,
        activeSpinId: null,
        version: { increment: 1 },
        ...this.activityData(),
      },
    });
    return result.count === 1;
  }

  async cancelSpin(participant: SessionParticipant): Promise<string> {
    this.assertHost(participant);
    return this.prisma.$transaction(async (tx) => {
      const room = await tx.room.findUnique({
        where: { id: participant.roomId },
        select: { status: true, activeSpinId: true },
      });
      if (room?.status !== RoomStatus.SPINNING || !room.activeSpinId) {
        throw new BadRequestException("Нет активного вращения");
      }

      const canceled = await tx.room.updateMany({
        where: {
          id: participant.roomId,
          status: RoomStatus.SPINNING,
          activeSpinId: room.activeSpinId,
        },
        data: {
          status: RoomStatus.LOBBY,
          activeSpinId: null,
          version: { increment: 1 },
          ...this.activityData(),
        },
      });
      if (canceled.count !== 1) {
        throw new BadRequestException("Вращение уже завершилось");
      }
      await tx.spin.deleteMany({ where: { id: room.activeSpinId } });
      return room.activeSpinId;
    });
  }

  private async finalizeSpinIfNeeded(code: string): Promise<void> {
    const room = await this.prisma.room.findUnique({
      where: { code },
      select: { id: true, status: true, activeSpinId: true },
    });
    if (room?.status !== RoomStatus.SPINNING || !room.activeSpinId) return;
    const spin = await this.prisma.spin.findUnique({
      where: { id: room.activeSpinId },
      select: { startedAt: true, durationMs: true },
    });
    if (spin && spin.startedAt.getTime() + spin.durationMs <= Date.now()) {
      await this.finishSpin(room.id, room.activeSpinId);
    }
  }

  private assertHost(participant: SessionParticipant): void {
    if (participant.role !== ParticipantRole.HOST) {
      throw new ForbiddenException("Это действие доступно только host");
    }
  }

  private async assertEditable(roomId: string): Promise<void> {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      select: { status: true },
    });
    if (!room || room.status !== RoomStatus.LOBBY) {
      throw new BadRequestException("Дождитесь окончания вращения");
    }
  }

  private async touch(roomId: string): Promise<void> {
    await this.prisma.room.update({
      where: { id: roomId },
      data: this.activityData(),
    });
  }

  private activityData(): { lastActivityAt: Date; expiresAt: Date } {
    const now = new Date();
    return { lastActivityAt: now, expiresAt: new Date(now.getTime() + ROOM_TTL_MS) };
  }

  private generateCode(): string {
    const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    return Array.from({ length: 8 }, () => alphabet[randomInt(alphabet.length)]).join(
      "",
    );
  }
}
