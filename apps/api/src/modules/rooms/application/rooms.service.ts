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

const sessionParticipantSelect = {
  id: true,
  roomId: true,
  displayName: true,
  role: true,
} satisfies Prisma.ParticipantSelect;

type SessionParticipant = Prisma.ParticipantGetPayload<{
  select: typeof sessionParticipantSelect;
}>;

const roomStateSelect = {
  code: true,
  title: true,
  status: true,
  version: true,
  activeSpinId: true,
  passwordHash: true,
  expiresAt: true,
  options: { orderBy: { position: "asc" as const } },
  proposals: {
    where: { status: ProposalStatus.PENDING },
    orderBy: { createdAt: "asc" as const },
    select: {
      id: true,
      participantId: true,
      label: true,
      createdAt: true,
    },
  },
  spins: {
    orderBy: [{ createdAt: "desc" as const }, { id: "desc" as const }],
    take: HISTORY_LIMIT + 1,
    select: {
      id: true,
      winnerLabel: true,
      createdAt: true,
    },
  },
  participants: {
    orderBy: { connectedAt: "asc" as const },
    select: { id: true, displayName: true, role: true, canSpin: true },
  },
} satisfies Prisma.RoomSelect;

const activeSpinSelect = {
  id: true,
  optionsSnapshot: true,
  winnerIndex: true,
  winnerLabel: true,
  startedAt: true,
  durationMs: true,
  finalRotation: true,
} satisfies Prisma.SpinSelect;

type RoomStateRecord = Prisma.RoomGetPayload<{ select: typeof roomStateSelect }>;
type ActiveSpinRecord = Prisma.SpinGetPayload<{ select: typeof activeSpinSelect }>;

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
          include: { participants: { select: sessionParticipantSelect } },
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
      select: {
        id: true,
        passwordHash: true,
        status: true,
        expiresAt: true,
      },
    });
    if (!this.isRoomActive(room)) {
      throw new NotFoundException("Комната не найдена или уже закрыта");
    }
    if (
      room.passwordHash &&
      !(await verifyPassword(room.passwordHash, input.password))
    ) {
      throw new ForbiddenException("Неверный пароль");
    }

    const session = this.sessions.create();
    const participant = await this.prisma.$transaction(async (tx) => {
      await this.lockRoom(tx, room.id);
      const currentRoom = await tx.room.findUnique({
        where: { id: room.id },
        select: { status: true, expiresAt: true },
      });
      if (!this.isRoomActive(currentRoom)) {
        throw new NotFoundException("Комната не найдена или уже закрыта");
      }

      const participants = await tx.participant.findMany({
        where: { roomId: room.id },
        select: { normalizedName: true },
      });
      if (participants.length >= MAX_PARTICIPANTS) {
        throw new BadRequestException("В комнате уже максимальное число участников");
      }
      const displayName = assignAvailableName(
        input.name,
        participants.map((current) => current.normalizedName),
      );
      const created = await tx.participant.create({
        data: {
          roomId: room.id,
          displayName,
          normalizedName: normalizeDisplayName(displayName),
          role: ParticipantRole.GUEST,
          sessionHash: session.hash,
        },
        select: sessionParticipantSelect,
      });
      await tx.room.update({
        where: { id: room.id },
        data: this.activityData(),
      });
      return created;
    });
    return { token: session.token, state: await this.getState(code, participant) };
  }

  async authenticate(code: string, token: string | null): Promise<SessionParticipant> {
    if (!token) throw new ForbiddenException("Сначала войдите в комнату");
    const participant = await this.prisma.participant.findFirst({
      where: {
        sessionHash: this.sessions.hash(token),
        room: { code, expiresAt: { gt: new Date() }, status: { not: "CLOSED" } },
      },
      select: sessionParticipantSelect,
    });
    if (!participant) throw new ForbiddenException("Сессия комнаты недействительна");
    await this.prisma.participant.update({
      where: { id: participant.id },
      data: { lastSeenAt: new Date() },
    });
    return participant;
  }

  async exportOwnData(participant: SessionParticipant) {
    const record = await this.prisma.participant.findUnique({
      where: { id: participant.id },
      select: {
        id: true,
        displayName: true,
        role: true,
        canSpin: true,
        connectedAt: true,
        lastSeenAt: true,
        room: {
          select: {
            code: true,
            title: true,
            createdAt: true,
            expiresAt: true,
          },
        },
        proposals: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            label: true,
            status: true,
            createdAt: true,
            reviewedAt: true,
          },
        },
      },
    });
    if (!record) {
      throw new NotFoundException("PARTICIPANT_NOT_FOUND");
    }

    return {
      exportedAt: new Date().toISOString(),
      room: {
        code: record.room.code,
        title: record.room.title,
        createdAt: record.room.createdAt.toISOString(),
        expiresAt: record.room.expiresAt.toISOString(),
      },
      participant: {
        id: record.id,
        displayName: record.displayName,
        role: record.role,
        canSpin: record.canSpin,
        connectedAt: record.connectedAt.toISOString(),
        lastSeenAt: record.lastSeenAt.toISOString(),
      },
      proposals: record.proposals.map((proposal) => ({
        id: proposal.id,
        label: proposal.label,
        status: proposal.status,
        createdAt: proposal.createdAt.toISOString(),
        reviewedAt: proposal.reviewedAt?.toISOString() ?? null,
      })),
    };
  }

  async deleteOwnData(participant: SessionParticipant): Promise<void> {
    if (participant.role === ParticipantRole.HOST) {
      throw new BadRequestException("HOST_MUST_DELETE_ROOM");
    }

    await this.prisma.$transaction([
      this.prisma.participant.delete({ where: { id: participant.id } }),
      this.prisma.room.update({
        where: { id: participant.roomId },
        data: { version: { increment: 1 } },
      }),
    ]);
  }

  async deleteRoom(participant: SessionParticipant): Promise<void> {
    this.assertHost(participant);
    await this.prisma.room.delete({ where: { id: participant.roomId } });
  }

  async getState(
    code: string,
    participant: SessionParticipant,
    onlineParticipantIds: ReadonlySet<string> = new Set(),
  ): Promise<PublicRoomState> {
    const states = await this.getStates(code, [participant], onlineParticipantIds);
    const state = states.get(participant.id);
    if (!state) throw new ForbiddenException("Сессия комнаты недействительна");
    return state;
  }

  async getStates(
    code: string,
    participants: readonly SessionParticipant[],
    onlineParticipantIds: ReadonlySet<string> = new Set(),
  ): Promise<Map<string, PublicRoomState>> {
    await this.finalizeSpinIfNeeded(code);
    const room = await this.prisma.room.findUnique({
      where: { code },
      select: roomStateSelect,
    });
    if (!this.isRoomActive(room)) {
      throw new NotFoundException("Комната не найдена или уже закрыта");
    }

    const activeRecord =
      room.status === RoomStatus.SPINNING && room.activeSpinId
        ? await this.prisma.spin.findUnique({
            where: { id: room.activeSpinId },
            select: activeSpinSelect,
          })
        : null;

    const states = new Map<string, PublicRoomState>();
    participants.forEach((participant) => {
      const currentParticipant = room.participants.find(
        (roomParticipant) => roomParticipant.id === participant.id,
      );
      if (!currentParticipant) return;
      states.set(
        participant.id,
        this.buildState(room, activeRecord, participant, onlineParticipantIds),
      );
    });
    return states;
  }

  private buildState(
    room: RoomStateRecord,
    activeRecord: ActiveSpinRecord | null,
    participant: SessionParticipant,
    onlineParticipantIds: ReadonlySet<string>,
  ): PublicRoomState {
    const currentParticipant = room.participants.find(
      (roomParticipant) => roomParticipant.id === participant.id,
    );
    return {
      code: room.code,
      title: room.title,
      status: room.status,
      version: room.version,
      role: participant.role,
      canSpin:
        participant.role === ParticipantRole.HOST ||
        Boolean(currentParticipant?.canSpin),
      displayName: participant.displayName,
      participantCount: room.participants.length,
      participants: room.participants.map((roomParticipant) => ({
        ...roomParticipant,
        canSpin:
          roomParticipant.role === ParticipantRole.HOST || roomParticipant.canSpin,
        online: onlineParticipantIds.has(roomParticipant.id),
      })),
      options: room.options.map(({ id, label, position }) => ({
        id,
        label,
        position,
      })),
      proposals:
        participant.role === ParticipantRole.HOST
          ? room.proposals.map(({ id, label, createdAt }) => ({
              id,
              label,
              createdAt: createdAt.toISOString(),
            }))
          : [],
      myProposals:
        participant.role === ParticipantRole.GUEST
          ? room.proposals
              .filter((proposal) => proposal.participantId === participant.id)
              .map(({ id, label, createdAt }) => ({
                id,
                label,
                createdAt: createdAt.toISOString(),
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
    await this.prisma.$transaction(async (tx) => {
      await this.lockRoom(tx, participant.roomId, RoomStatus.LOBBY);
      await tx.room.update({
        where: { id: participant.roomId },
        data: { title, version: { increment: 1 }, ...this.activityData() },
      });
    });
  }

  async updatePassword(
    participant: SessionParticipant,
    password: string,
  ): Promise<void> {
    this.assertHost(participant);
    await this.assertEditable(participant.roomId);
    const passwordHash = password ? await hashPassword(password) : null;
    await this.prisma.$transaction(async (tx) => {
      await this.lockRoom(tx, participant.roomId, RoomStatus.LOBBY);
      await tx.room.update({
        where: { id: participant.roomId },
        data: {
          passwordHash,
          version: { increment: 1 },
          ...this.activityData(),
        },
      });
    });
  }

  async addOption(participant: SessionParticipant, label: string): Promise<void> {
    this.assertHost(participant);
    await this.assertEditable(participant.roomId);
    await this.prisma.$transaction(async (tx) => {
      await this.lockRoom(tx, participant.roomId, RoomStatus.LOBBY);
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
      await this.lockRoom(tx, participant.roomId, RoomStatus.LOBBY);
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
    await this.assertAcceptingProposals(participant.roomId);
    await this.prisma.$transaction(async (tx) => {
      await this.lockRoom(tx, participant.roomId);
      await this.lockParticipant(tx, participant.id);
      const pending = await tx.proposal.count({
        where: {
          participantId: participant.id,
          status: ProposalStatus.PENDING,
        },
      });
      if (pending >= MAX_PENDING_PROPOSALS) {
        throw new BadRequestException("У вас уже 10 предложений на рассмотрении");
      }
      await tx.proposal.create({
        data: { roomId: participant.roomId, participantId: participant.id, label },
      });
      await tx.room.update({
        where: { id: participant.roomId },
        data: { version: { increment: 1 }, ...this.activityData() },
      });
    });
  }

  async updateOwnProposal(
    participant: SessionParticipant,
    proposalId: string,
    label: string,
  ): Promise<void> {
    await this.assertAcceptingProposals(participant.roomId);
    await this.prisma.$transaction(async (tx) => {
      await this.lockRoom(tx, participant.roomId);
      const result = await tx.proposal.updateMany({
        where: {
          id: proposalId,
          roomId: participant.roomId,
          participantId: participant.id,
          status: ProposalStatus.PENDING,
        },
        data: { label },
      });
      if (result.count !== 1) {
        throw new BadRequestException("PROPOSAL_NOT_PENDING");
      }
      await tx.room.update({
        where: { id: participant.roomId },
        data: { version: { increment: 1 }, ...this.activityData() },
      });
    });
  }

  async removeOwnProposal(
    participant: SessionParticipant,
    proposalId: string,
  ): Promise<void> {
    await this.assertAcceptingProposals(participant.roomId);
    await this.prisma.$transaction(async (tx) => {
      await this.lockRoom(tx, participant.roomId);
      const result = await tx.proposal.deleteMany({
        where: {
          id: proposalId,
          roomId: participant.roomId,
          participantId: participant.id,
          status: ProposalStatus.PENDING,
        },
      });
      if (result.count !== 1) {
        throw new BadRequestException("PROPOSAL_NOT_PENDING");
      }
      await tx.room.update({
        where: { id: participant.roomId },
        data: { version: { increment: 1 }, ...this.activityData() },
      });
    });
  }

  async reviewProposal(
    participant: SessionParticipant,
    proposalId: string,
    decision: "accept" | "reject",
  ): Promise<void> {
    this.assertHost(participant);
    await this.assertEditable(participant.roomId);
    await this.prisma.$transaction(async (tx) => {
      await this.lockRoom(tx, participant.roomId, RoomStatus.LOBBY);
      const claimed = await tx.proposal.updateMany({
        where: {
          id: proposalId,
          roomId: participant.roomId,
          status: ProposalStatus.PENDING,
        },
        data: {
          status:
            decision === "accept" ? ProposalStatus.ACCEPTED : ProposalStatus.REJECTED,
          reviewedAt: new Date(),
        },
      });
      if (claimed.count !== 1) {
        throw new NotFoundException("PROPOSAL_NOT_PENDING");
      }
      const proposal = await tx.proposal.findUniqueOrThrow({
        where: { id: proposalId },
        select: { label: true },
      });
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
      await tx.room.update({
        where: { id: participant.roomId },
        data: { version: { increment: 1 }, ...this.activityData() },
      });
      await tx.proposal.delete({ where: { id: proposalId } });
    });
  }

  async kickParticipant(
    participant: SessionParticipant,
    targetParticipantId: string,
  ): Promise<void> {
    this.assertHost(participant);
    await this.assertRoomActive(participant.roomId);
    await this.prisma.$transaction(async (tx) => {
      await this.lockRoom(tx, participant.roomId);
      const target = await tx.participant.findFirst({
        where: { id: targetParticipantId, roomId: participant.roomId },
        select: { id: true, role: true },
      });
      if (!target) {
        throw new NotFoundException("PARTICIPANT_NOT_FOUND");
      }
      if (target.role === ParticipantRole.HOST) {
        throw new BadRequestException("CANNOT_REMOVE_HOST");
      }
      await tx.participant.delete({ where: { id: target.id } });
      await tx.room.update({
        where: { id: participant.roomId },
        data: { version: { increment: 1 }, ...this.activityData() },
      });
    });
  }

  async setSpinPermission(
    participant: SessionParticipant,
    targetParticipantId: string,
    canSpin: boolean,
  ): Promise<void> {
    this.assertHost(participant);
    await this.assertRoomActive(participant.roomId);
    await this.prisma.$transaction(async (tx) => {
      await this.lockRoom(tx, participant.roomId);
      const target = await tx.participant.findFirst({
        where: { id: targetParticipantId, roomId: participant.roomId },
        select: { id: true, role: true },
      });
      if (!target) {
        throw new NotFoundException("PARTICIPANT_NOT_FOUND");
      }
      if (target.role === ParticipantRole.HOST) {
        throw new BadRequestException("CANNOT_CHANGE_HOST_SPIN_PERMISSION");
      }
      await tx.participant.update({
        where: { id: target.id },
        data: { canSpin },
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
    await this.assertRoomActive(participant.roomId);
    await this.assertCanSpin(participant);
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
        where: {
          id: participant.roomId,
          status: RoomStatus.LOBBY,
          expiresAt: { gt: new Date() },
        },
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
    return this.prisma.$transaction(async (tx) => {
      const result = await tx.room.updateMany({
        where: { id: roomId, status: RoomStatus.SPINNING, activeSpinId: spinId },
        data: {
          status: RoomStatus.LOBBY,
          activeSpinId: null,
          version: { increment: 1 },
          ...this.activityData(),
        },
      });
      if (result.count !== 1) return false;

      const retained = await tx.spin.findMany({
        where: { roomId },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: HISTORY_LIMIT,
        select: { id: true },
      });
      await tx.spin.deleteMany({
        where: {
          roomId,
          id: { notIn: retained.map(({ id }) => id) },
        },
      });
      return true;
    });
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
    if (!spin || spin.startedAt.getTime() + spin.durationMs <= Date.now()) {
      await this.finishSpin(room.id, room.activeSpinId);
    }
  }

  private assertHost(participant: SessionParticipant): void {
    if (participant.role !== ParticipantRole.HOST) {
      throw new ForbiddenException("Это действие доступно только host");
    }
  }

  private async assertCanSpin(participant: SessionParticipant): Promise<void> {
    if (participant.role === ParticipantRole.HOST) return;
    const currentParticipant = await this.prisma.participant.findFirst({
      where: { id: participant.id, roomId: participant.roomId },
      select: { canSpin: true },
    });
    if (!currentParticipant?.canSpin) {
      throw new ForbiddenException("SPIN_PERMISSION_REQUIRED");
    }
  }

  private async assertEditable(roomId: string): Promise<void> {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      select: { status: true, expiresAt: true },
    });
    if (!this.isRoomActive(room) || room.status !== RoomStatus.LOBBY) {
      throw new BadRequestException("Дождитесь окончания вращения");
    }
  }

  private async assertAcceptingProposals(roomId: string): Promise<void> {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      select: { status: true, expiresAt: true },
    });
    if (!this.isRoomActive(room)) {
      throw new BadRequestException("Комната не найдена или уже закрыта");
    }
  }

  private async assertRoomActive(roomId: string): Promise<void> {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      select: { status: true, expiresAt: true },
    });
    if (!this.isRoomActive(room)) {
      throw new BadRequestException("Комната не найдена или уже закрыта");
    }
  }

  private isRoomActive(
    room: { status: RoomStatus; expiresAt: Date } | null,
  ): room is { status: RoomStatus; expiresAt: Date } {
    return Boolean(
      room && room.status !== RoomStatus.CLOSED && room.expiresAt > new Date(),
    );
  }

  private async lockRoom(
    tx: Prisma.TransactionClient,
    roomId: string,
    requiredStatus?: RoomStatus,
  ): Promise<void> {
    const rooms = await tx.$queryRaw<Array<{ status: RoomStatus; expiresAt: Date }>>`
      SELECT status, "expiresAt"
      FROM "Room"
      WHERE id = ${roomId}
      FOR UPDATE
    `;
    const room = rooms[0] ?? null;
    if (!this.isRoomActive(room)) {
      throw new BadRequestException("Комната не найдена или уже закрыта");
    }
    if (requiredStatus && room.status !== requiredStatus) {
      throw new BadRequestException("Дождитесь окончания вращения");
    }
  }

  private async lockParticipant(
    tx: Prisma.TransactionClient,
    participantId: string,
  ): Promise<void> {
    await tx.$queryRaw`
      SELECT id
      FROM "Participant"
      WHERE id = ${participantId}
      FOR UPDATE
    `;
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
