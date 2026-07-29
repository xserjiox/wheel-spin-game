import { ParticipantRole, RoomStatus } from "@prisma/client";
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
  sessionHash: "session-hash",
};

describe("proposals during a spin", () => {
  it("lets a guest queue a proposal without changing the active spin", async () => {
    const proposalCreate = vi.fn().mockReturnValue({ operation: "create" });
    const roomUpdate = vi.fn().mockReturnValue({ operation: "update" });
    const prisma = {
      room: {
        findUnique: vi.fn().mockResolvedValue({ status: RoomStatus.SPINNING }),
        update: roomUpdate,
      },
      proposal: {
        count: vi.fn().mockResolvedValue(0),
        create: proposalCreate,
      },
      $transaction: vi.fn().mockResolvedValue([]),
    } as unknown as PrismaService;
    const service = new RoomsService(prisma, new SessionService());

    await expect(service.createProposal(guest, "Order pizza")).resolves.toBeUndefined();
    expect(proposalCreate).toHaveBeenCalledWith({
      data: {
        roomId: guest.roomId,
        participantId: guest.id,
        label: "Order pizza",
      },
    });
    expect(roomUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: guest.roomId },
        data: expect.objectContaining({ version: { increment: 1 } }),
      }),
    );
  });
});
