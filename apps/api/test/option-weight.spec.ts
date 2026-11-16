import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { ParticipantRole, RoomStatus } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { RoomsService } from "../src/modules/rooms/application/rooms.service";
import { addOptionWithEqualChance } from "../src/modules/rooms/domain/wheel-engine";
import type { PrismaService } from "../src/shared/database/prisma.service";
import { SessionService } from "../src/shared/security/session.service";

const host = {
  id: "host-id",
  roomId: "room-id",
  displayName: "Host",
  normalizedName: "host",
  role: ParticipantRole.HOST,
  sessionHash: "host-session",
};

const activeOptions = Array.from({ length: 5 }, (_, index) => ({
  id: `option-${index + 1}`,
  weight: 1,
}));

function createPrisma(options = activeOptions) {
  const optionUpdate = vi.fn().mockResolvedValue({});
  const roomUpdate = vi.fn().mockResolvedValue({});
  const transaction = {
    $queryRaw: vi
      .fn()
      .mockResolvedValue([
        { status: RoomStatus.LOBBY, expiresAt: new Date("2099-01-01") },
      ]),
    option: {
      count: vi.fn().mockResolvedValue(options.length - 1),
      create: vi.fn().mockResolvedValue({ id: options.at(-1)?.id }),
      findMany: vi.fn().mockResolvedValue(options),
      update: optionUpdate,
      updateMany: vi.fn().mockResolvedValue({ count: options.length }),
    },
    room: { update: roomUpdate },
  };
  const prisma = {
    room: {
      findUnique: vi.fn().mockResolvedValue({
        status: RoomStatus.LOBBY,
        expiresAt: new Date("2099-01-01"),
      }),
    },
    $transaction: vi.fn((action: (client: typeof transaction) => Promise<void>) =>
      action(transaction),
    ),
  } as unknown as PrismaService;

  return { prisma, transaction, optionUpdate, roomUpdate };
}

describe("option chances", () => {
  it("lets the host set 96 percent while keeping the other four slots at 1 percent", async () => {
    const { prisma, optionUpdate, roomUpdate } = createPrisma();

    await new RoomsService(prisma, new SessionService()).updateOptionChance(
      host,
      "option-1",
      96,
    );

    expect(optionUpdate.mock.calls.map(([input]) => input)).toEqual([
      { where: { id: "option-1" }, data: { weight: 96 } },
      { where: { id: "option-2" }, data: { weight: 1 } },
      { where: { id: "option-3" }, data: { weight: 1 } },
      { where: { id: "option-4" }, data: { weight: 1 } },
      { where: { id: "option-5" }, data: { weight: 1 } },
    ]);
    expect(roomUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: host.roomId },
        data: expect.objectContaining({ version: { increment: 1 } }),
      }),
    );
  });

  it("rejects guests, unknown options, and chances above the dynamic maximum", async () => {
    const service = new RoomsService({} as PrismaService, new SessionService());
    await expect(
      service.updateOptionChance(
        { ...host, role: ParticipantRole.GUEST },
        "option-1",
        20,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    const missing = createPrisma([]);
    await expect(
      new RoomsService(missing.prisma, new SessionService()).updateOptionChance(
        host,
        "missing-id",
        20,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);

    const sixOptions = [...activeOptions, { id: "option-6", weight: 1 }];
    const aboveMaximum = createPrisma(sixOptions);
    await expect(
      new RoomsService(aboveMaximum.prisma, new SessionService()).updateOptionChance(
        host,
        "option-1",
        96,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe("equal chances for new and existing slots", () => {
  it("keeps an even wheel even when a slot is added", () => {
    // Weights left behind by an earlier normalization, plus the fresh slot.
    const distribution = addOptionWithEqualChance(
      [
        { id: "a", weight: 24.8 },
        { id: "b", weight: 24.8 },
        { id: "c", weight: 24.7 },
        { id: "d", weight: 24.7 },
        { id: "new", weight: 1 },
      ],
      "new",
    );

    expect(distribution.map((option) => option.weight)).toEqual([1, 1, 1, 1, 1]);
  });

  it("gives a new slot an average share and keeps tuned proportions", () => {
    const distribution = addOptionWithEqualChance(
      [
        { id: "a", weight: 50 },
        { id: "b", weight: 25 },
        { id: "c", weight: 25 },
        { id: "new", weight: 1 },
      ],
      "new",
    );

    const byId = new Map(distribution.map((option) => [option.id, option.weight]));
    expect(byId.get("new")).toBe(25);
    expect(byId.get("a")).toBe(37.5);
    expect(byId.get("b")).toBe(18.8);
    expect(byId.get("c")).toBe(18.7);
  });

  it("stores the new slot with an equal share when the host adds it", async () => {
    const options = [
      { id: "option-1", weight: 25 },
      { id: "option-2", weight: 25 },
      { id: "option-3", weight: 25 },
      { id: "option-4", weight: 25 },
      { id: "option-5", weight: 1 },
    ];
    const { prisma, transaction, optionUpdate } = createPrisma(options);

    await new RoomsService(prisma, new SessionService()).addOption(host, "Fifth");

    expect(transaction.option.create).toHaveBeenCalledWith({
      data: { roomId: host.roomId, label: "Fifth", position: 4 },
      select: { id: true },
    });
    expect(optionUpdate.mock.calls.map(([input]) => input.data.weight)).toEqual([
      1, 1, 1, 1, 1,
    ]);
  });

  it("lets only the host make every chance equal", async () => {
    const { prisma, transaction, roomUpdate } = createPrisma();
    const service = new RoomsService(prisma, new SessionService());

    await expect(
      service.equalizeOptionChances({ ...host, role: ParticipantRole.GUEST }),
    ).rejects.toBeInstanceOf(ForbiddenException);

    await service.equalizeOptionChances(host);

    expect(transaction.option.updateMany).toHaveBeenCalledWith({
      where: { roomId: host.roomId },
      data: { weight: 1 },
    });
    expect(roomUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ version: { increment: 1 } }),
      }),
    );
  });
});
