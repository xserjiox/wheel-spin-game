import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { ParticipantRole, RoomStatus } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { RoomsService } from "../src/modules/rooms/application/rooms.service";
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
      findMany: vi.fn().mockResolvedValue(options),
      update: optionUpdate,
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

  return { prisma, optionUpdate, roomUpdate };
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
