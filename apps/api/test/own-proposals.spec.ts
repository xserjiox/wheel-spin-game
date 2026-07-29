import { BadRequestException } from "@nestjs/common";
import { ParticipantRole, ProposalStatus, RoomStatus } from "@prisma/client";
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

describe("own proposals", () => {
  it("updates only a pending proposal owned by the current guest", async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const roomUpdate = vi.fn().mockResolvedValue({});
    const tx = {
      proposal: { updateMany },
      room: { update: roomUpdate },
    };
    const prisma = {
      room: {
        findUnique: vi.fn().mockResolvedValue({ status: RoomStatus.SPINNING }),
      },
      $transaction: vi.fn(async (operation) => operation(tx)),
    } as unknown as PrismaService;
    const service = new RoomsService(prisma, new SessionService());

    await expect(
      service.updateOwnProposal(guest, "proposal-id", "Edited idea"),
    ).resolves.toBeUndefined();
    expect(updateMany).toHaveBeenCalledWith({
      where: {
        id: "proposal-id",
        roomId: guest.roomId,
        participantId: guest.id,
        status: ProposalStatus.PENDING,
      },
      data: { label: "Edited idea" },
    });
    expect(roomUpdate).toHaveBeenCalledOnce();
  });

  it("does not delete another guest's or an already handled proposal", async () => {
    const roomUpdate = vi.fn();
    const tx = {
      proposal: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
      room: { update: roomUpdate },
    };
    const prisma = {
      room: {
        findUnique: vi.fn().mockResolvedValue({ status: RoomStatus.LOBBY }),
      },
      $transaction: vi.fn(async (operation) => operation(tx)),
    } as unknown as PrismaService;
    const service = new RoomsService(prisma, new SessionService());

    await expect(
      service.removeOwnProposal(guest, "unavailable-proposal"),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(roomUpdate).not.toHaveBeenCalled();
  });

  it("accepts the latest proposal label after atomically claiming it", async () => {
    const optionCreate = vi.fn().mockResolvedValue({});
    const tx = {
      proposal: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        findUniqueOrThrow: vi.fn().mockResolvedValue({ label: "Latest label" }),
      },
      option: {
        count: vi.fn().mockResolvedValue(2),
        create: optionCreate,
      },
      room: { update: vi.fn().mockResolvedValue({}) },
    };
    const prisma = {
      room: {
        findUnique: vi.fn().mockResolvedValue({ status: RoomStatus.LOBBY }),
      },
      $transaction: vi.fn(async (operation) => operation(tx)),
    } as unknown as PrismaService;
    const service = new RoomsService(prisma, new SessionService());

    await service.reviewProposal(host, "proposal-id", "accept");

    expect(tx.proposal.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: ProposalStatus.PENDING }),
      }),
    );
    expect(optionCreate).toHaveBeenCalledWith({
      data: {
        roomId: host.roomId,
        label: "Latest label",
        position: 2,
      },
    });
  });
});
