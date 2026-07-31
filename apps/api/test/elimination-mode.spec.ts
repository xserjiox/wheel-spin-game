import { ParticipantRole, RoomStatus, SelectionMode } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { RoomsService } from "../src/modules/rooms/application/rooms.service";
import type { PrismaService } from "../src/shared/database/prisma.service";
import { SessionService } from "../src/shared/security/session.service";

const host = {
  id: "host-id",
  roomId: "room-id",
  displayName: "Host",
  role: ParticipantRole.HOST,
};

describe("elimination mode", () => {
  it("spins only among choices that are still available", async () => {
    const options = [
      { id: "one", label: "One", position: 0, excludedAt: null },
      { id: "used", label: "Used", position: 1, excludedAt: new Date() },
      { id: "two", label: "Two", position: 2, excludedAt: null },
    ];
    const transaction = {
      room: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        findUniqueOrThrow: vi.fn().mockResolvedValue({
          id: "room-id",
          selectionMode: SelectionMode.ELIMINATION,
          currentRotation: 0,
          options,
        }),
        update: vi.fn().mockResolvedValue({}),
      },
      spin: {
        create: vi.fn().mockImplementation(({ data }) =>
          Promise.resolve({
            id: "spin-id",
            ...data,
          }),
        ),
      },
    };
    const prisma = {
      room: {
        findUnique: vi.fn().mockResolvedValue({
          status: RoomStatus.LOBBY,
          expiresAt: new Date(Date.now() + 60_000),
        }),
      },
      spin: { findUnique: vi.fn().mockResolvedValue(null) },
      $transaction: vi.fn((action: (client: typeof transaction) => Promise<unknown>) =>
        action(transaction),
      ),
    } as unknown as PrismaService;
    const service = new RoomsService(prisma, new SessionService());

    const spin = await service.spin(host, crypto.randomUUID(), 5_000);

    expect(spin?.optionsSnapshot).toEqual([
      { id: "one", label: "One", position: 0, excluded: false },
      { id: "two", label: "Two", position: 2, excluded: false },
    ]);
    expect(spin?.winnerLabel).not.toBe("Used");
  });

  it("excludes the winner only after a completed elimination spin", async () => {
    const transaction = {
      room: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        findUnique: vi.fn().mockResolvedValue({
          selectionMode: SelectionMode.ELIMINATION,
        }),
      },
      option: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      spin: {
        findUnique: vi.fn().mockResolvedValue({ winnerOptionId: "winner-id" }),
        findMany: vi.fn().mockResolvedValue([{ id: "spin-id" }]),
        deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      },
    };
    const prisma = {
      $transaction: vi.fn((action: (client: typeof transaction) => Promise<boolean>) =>
        action(transaction),
      ),
    } as unknown as PrismaService;
    const service = new RoomsService(prisma, new SessionService());

    await expect(service.finishSpin("room-id", "spin-id")).resolves.toBe(true);
    expect(transaction.option.updateMany).toHaveBeenCalledWith({
      where: {
        id: "winner-id",
        roomId: "room-id",
        excludedAt: null,
      },
      data: { excludedAt: expect.any(Date) },
    });
  });
});
