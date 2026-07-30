import { BadRequestException, ForbiddenException } from "@nestjs/common";
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

describe("participant kick", () => {
  it("removes a guest membership and keeps the room active", async () => {
    const participantDelete = vi.fn().mockReturnValue({ operation: "delete" });
    const roomUpdate = vi.fn().mockReturnValue({ operation: "update" });
    const transaction = {
      $queryRaw: vi.fn().mockResolvedValue([
        {
          status: "LOBBY",
          expiresAt: new Date("2099-01-01T00:00:00.000Z"),
        },
      ]),
      participant: {
        findFirst: vi.fn().mockResolvedValue({
          id: "guest-id",
          role: ParticipantRole.GUEST,
        }),
        delete: participantDelete,
      },
      room: { update: roomUpdate },
    };
    const prisma = {
      room: {
        findUnique: vi.fn().mockResolvedValue({
          status: "LOBBY",
          expiresAt: new Date("2099-01-01T00:00:00.000Z"),
        }),
      },
      $transaction: vi.fn((operation: (client: typeof transaction) => Promise<void>) =>
        operation(transaction),
      ),
    } as unknown as PrismaService;
    const service = new RoomsService(prisma, new SessionService());

    await expect(service.kickParticipant(host, "guest-id")).resolves.toBeUndefined();
    expect(participantDelete).toHaveBeenCalledWith({
      where: { id: "guest-id" },
    });
    expect(roomUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: host.roomId },
        data: expect.objectContaining({ version: { increment: 1 } }),
      }),
    );
  });

  it("does not allow a guest to kick participants", async () => {
    const service = new RoomsService({} as PrismaService, new SessionService());

    await expect(
      service.kickParticipant(
        { ...host, role: ParticipantRole.GUEST },
        "another-guest-id",
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("does not allow removing the host", async () => {
    const transaction = {
      $queryRaw: vi.fn().mockResolvedValue([
        {
          status: "LOBBY",
          expiresAt: new Date("2099-01-01T00:00:00.000Z"),
        },
      ]),
      participant: {
        findFirst: vi.fn().mockResolvedValue({
          id: host.id,
          role: ParticipantRole.HOST,
        }),
      },
    };
    const prisma = {
      room: {
        findUnique: vi.fn().mockResolvedValue({
          status: "LOBBY",
          expiresAt: new Date("2099-01-01T00:00:00.000Z"),
        }),
      },
      $transaction: vi.fn((operation: (client: typeof transaction) => Promise<void>) =>
        operation(transaction),
      ),
    } as unknown as PrismaService;
    const service = new RoomsService(prisma, new SessionService());

    await expect(service.kickParticipant(host, host.id)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
