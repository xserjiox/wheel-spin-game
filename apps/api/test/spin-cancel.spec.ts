import { ForbiddenException } from "@nestjs/common";
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
  sessionHash: "session-hash",
};

describe("spin cancellation", () => {
  it("returns the room to the lobby and removes the unfinished spin", async () => {
    const transaction = {
      room: {
        findUnique: vi.fn().mockResolvedValue({
          status: RoomStatus.SPINNING,
          activeSpinId: "spin-id",
        }),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      spin: {
        deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
    };
    const prisma = {
      $transaction: vi.fn((action: (client: typeof transaction) => Promise<string>) =>
        action(transaction),
      ),
    } as unknown as PrismaService;
    const service = new RoomsService(prisma, new SessionService());

    await expect(service.cancelSpin(host)).resolves.toBe("spin-id");
    expect(transaction.room.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ activeSpinId: "spin-id" }),
        data: expect.objectContaining({
          status: RoomStatus.LOBBY,
          activeSpinId: null,
        }),
      }),
    );
    expect(transaction.spin.deleteMany).toHaveBeenCalledWith({
      where: { id: "spin-id" },
    });
  });

  it("rejects cancellation from a guest", async () => {
    const service = new RoomsService({} as PrismaService, new SessionService());

    await expect(
      service.cancelSpin({ ...host, role: ParticipantRole.GUEST }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
