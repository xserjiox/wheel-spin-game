import { ForbiddenException } from "@nestjs/common";
import { ParticipantRole } from "@prisma/client";
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

const guest = {
  ...host,
  id: "guest-id",
  displayName: "Guest",
  normalizedName: "guest",
  role: ParticipantRole.GUEST,
  sessionHash: "guest-session",
};

describe("spin permission", () => {
  it("lets the host independently grant and revoke permission", async () => {
    const participantUpdate = vi.fn().mockReturnValue({ operation: "participant" });
    const roomUpdate = vi.fn().mockReturnValue({ operation: "room" });
    const prisma = {
      participant: {
        findFirst: vi.fn().mockResolvedValue({
          id: guest.id,
          role: ParticipantRole.GUEST,
        }),
        update: participantUpdate,
      },
      room: { update: roomUpdate },
      $transaction: vi.fn().mockResolvedValue([]),
    } as unknown as PrismaService;
    const service = new RoomsService(prisma, new SessionService());

    await service.setSpinPermission(host, guest.id, true);
    await service.setSpinPermission(host, guest.id, false);

    expect(participantUpdate).toHaveBeenNthCalledWith(1, {
      where: { id: guest.id },
      data: { canSpin: true },
    });
    expect(participantUpdate).toHaveBeenNthCalledWith(2, {
      where: { id: guest.id },
      data: { canSpin: false },
    });
  });

  it("does not let guests change spin permissions", async () => {
    const service = new RoomsService({} as PrismaService, new SessionService());

    await expect(
      service.setSpinPermission(guest, "another-guest-id", true),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("lets a permitted guest start a spin", async () => {
    const startedAt = new Date("2026-07-29T10:00:00.000Z");
    const prisma = {
      participant: {
        findFirst: vi.fn().mockResolvedValue({ canSpin: true }),
      },
      spin: {
        findUnique: vi.fn().mockResolvedValue({
          id: "spin-id",
          optionsSnapshot: [
            { id: "pizza", label: "Pizza", position: 0 },
            { id: "sushi", label: "Sushi", position: 1 },
          ],
          winnerIndex: 1,
          winnerLabel: "Sushi",
          startedAt,
          durationMs: 20_000,
          finalRotation: 1800,
        }),
      },
    } as unknown as PrismaService;
    const service = new RoomsService(prisma, new SessionService());

    await expect(service.spin(guest, crypto.randomUUID(), 20_000)).resolves.toEqual(
      expect.objectContaining({
        id: "spin-id",
        winnerLabel: "Sushi",
        startedAt: startedAt.toISOString(),
      }),
    );
  });

  it("rejects a guest immediately after permission is revoked", async () => {
    const spinFindUnique = vi.fn();
    const prisma = {
      participant: {
        findFirst: vi.fn().mockResolvedValue({ canSpin: false }),
      },
      spin: { findUnique: spinFindUnique },
    } as unknown as PrismaService;
    const service = new RoomsService(prisma, new SessionService());

    await expect(
      service.spin(guest, crypto.randomUUID(), 20_000),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(spinFindUnique).not.toHaveBeenCalled();
  });
});
