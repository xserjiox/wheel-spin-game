import { BadRequestException } from "@nestjs/common";
import { ParticipantRole, ProposalStatus } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { RoomsService } from "../src/modules/rooms/application/rooms.service";
import type { PrismaService } from "../src/shared/database/prisma.service";
import { SessionService } from "../src/shared/security/session.service";

const guest = {
  id: "guest-id",
  roomId: "room-id",
  displayName: "Guest",
  normalizedName: "guest",
  role: ParticipantRole.GUEST,
  sessionHash: "guest-session",
};

const host = {
  ...guest,
  id: "host-id",
  displayName: "Host",
  normalizedName: "host",
  role: ParticipantRole.HOST,
  sessionHash: "host-session",
};

describe("privacy data controls", () => {
  it("exports only the current participant record and their proposals", async () => {
    const prisma = {
      participant: {
        findUnique: vi.fn().mockResolvedValue({
          id: guest.id,
          displayName: guest.displayName,
          role: guest.role,
          canSpin: false,
          connectedAt: new Date("2026-07-30T08:00:00.000Z"),
          lastSeenAt: new Date("2026-07-30T09:00:00.000Z"),
          room: {
            code: "Room1234",
            title: "Lunch",
            createdAt: new Date("2026-07-30T07:00:00.000Z"),
            expiresAt: new Date("2026-08-06T09:00:00.000Z"),
          },
          proposals: [
            {
              id: "proposal-id",
              label: "Pizza",
              status: ProposalStatus.PENDING,
              createdAt: new Date("2026-07-30T08:30:00.000Z"),
              reviewedAt: null,
            },
          ],
        }),
      },
    } as unknown as PrismaService;
    const service = new RoomsService(prisma, new SessionService());

    const result = await service.exportOwnData(guest);

    expect(result.participant).toEqual({
      id: guest.id,
      displayName: guest.displayName,
      role: ParticipantRole.GUEST,
      canSpin: false,
      connectedAt: "2026-07-30T08:00:00.000Z",
      lastSeenAt: "2026-07-30T09:00:00.000Z",
    });
    expect(result.proposals).toEqual([
      expect.objectContaining({
        id: "proposal-id",
        label: "Pizza",
        status: ProposalStatus.PENDING,
      }),
    ]);
    expect(result).not.toHaveProperty("sessionHash");
  });

  it("deletes a guest and their cascaded proposals without extending room expiry", async () => {
    const participantDelete = vi.fn().mockReturnValue({ operation: "participant" });
    const roomUpdate = vi.fn().mockReturnValue({ operation: "room" });
    const transaction = vi.fn().mockResolvedValue([]);
    const prisma = {
      participant: { delete: participantDelete },
      room: { update: roomUpdate },
      $transaction: transaction,
    } as unknown as PrismaService;
    const service = new RoomsService(prisma, new SessionService());

    await service.deleteOwnData(guest);

    expect(participantDelete).toHaveBeenCalledWith({ where: { id: guest.id } });
    expect(roomUpdate).toHaveBeenCalledWith({
      where: { id: guest.roomId },
      data: { version: { increment: 1 } },
    });
    expect(transaction).toHaveBeenCalledOnce();
  });

  it("requires a host to delete the room instead of orphaning it", async () => {
    const prisma = {} as PrismaService;
    const service = new RoomsService(prisma, new SessionService());

    await expect(service.deleteOwnData(host)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("lets only the host delete the whole room", async () => {
    const roomDelete = vi.fn().mockResolvedValue({});
    const prisma = { room: { delete: roomDelete } } as unknown as PrismaService;
    const service = new RoomsService(prisma, new SessionService());

    await service.deleteRoom(host);
    expect(roomDelete).toHaveBeenCalledWith({ where: { id: host.roomId } });
    await expect(service.deleteRoom(guest)).rejects.toThrow();
  });
});
