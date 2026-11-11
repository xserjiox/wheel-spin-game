import { ParticipantRole, RoomStatus } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { RoomsService } from "../src/modules/rooms/application/rooms.service";
import { optionsReplaceSchema } from "../src/modules/rooms/contracts/room.contracts";
import { uniqueOptionLabels } from "../src/modules/rooms/domain/option-labels";
import type { PrismaService } from "../src/shared/database/prisma.service";
import { SessionService } from "../src/shared/security/session.service";

const host = {
  id: "host-id",
  roomId: "room-id",
  displayName: "Host",
  role: ParticipantRole.HOST,
};

function createService() {
  const transaction = {
    $queryRaw: vi
      .fn()
      .mockResolvedValue([
        { status: RoomStatus.LOBBY, expiresAt: new Date(Date.now() + 60_000) },
      ]),
    option: {
      deleteMany: vi.fn().mockResolvedValue({ count: 5 }),
      createMany: vi.fn().mockResolvedValue({ count: 3 }),
    },
    room: { update: vi.fn().mockResolvedValue({}) },
  };
  const prisma = {
    room: {
      findUnique: vi.fn().mockResolvedValue({
        status: RoomStatus.LOBBY,
        expiresAt: new Date(Date.now() + 60_000),
      }),
    },
    $transaction: vi.fn((action: (client: typeof transaction) => Promise<unknown>) =>
      action(transaction),
    ),
  } as unknown as PrismaService;
  return { service: new RoomsService(prisma, new SessionService()), transaction };
}

describe("options.replace", () => {
  it("replaces every option in one transaction with fresh positions", async () => {
    const { service, transaction } = createService();

    await service.replaceOptions(host, ["Anna", " Boris ", "anna", "Vika"]);

    expect(transaction.option.deleteMany).toHaveBeenCalledWith({
      where: { roomId: "room-id" },
    });
    expect(transaction.option.createMany).toHaveBeenCalledWith({
      data: [
        { roomId: "room-id", label: "Anna", position: 0 },
        { roomId: "room-id", label: "Boris", position: 1 },
        { roomId: "room-id", label: "Vika", position: 2 },
      ],
    });
    expect(transaction.room.update).toHaveBeenCalledOnce();
  });

  it("refuses guests", async () => {
    const { service, transaction } = createService();

    await expect(
      service.replaceOptions({ ...host, role: ParticipantRole.GUEST }, ["One", "Two"]),
    ).rejects.toThrow("Это действие доступно только host");
    expect(transaction.option.deleteMany).not.toHaveBeenCalled();
  });

  it("needs at least two distinct options", async () => {
    const { service, transaction } = createService();

    await expect(service.replaceOptions(host, ["Same", "same "])).rejects.toThrow(
      "Добавьте хотя бы два слота",
    );
    expect(transaction.option.deleteMany).not.toHaveBeenCalled();
  });

  it("validates labels and the slot limit in the payload", () => {
    expect(optionsReplaceSchema.safeParse({ labels: ["One", "Two"] }).success).toBe(
      true,
    );
    expect(optionsReplaceSchema.safeParse({ labels: ["One"] }).success).toBe(false);
    expect(
      optionsReplaceSchema.safeParse({ labels: ["One", "x".repeat(81)] }).success,
    ).toBe(false);
    expect(
      optionsReplaceSchema.safeParse({
        labels: Array.from({ length: 101 }, (_, index) => `Option ${index}`),
      }).success,
    ).toBe(false);
  });

  it("drops repeats that differ only in case or spacing", () => {
    expect(
      uniqueOptionLabels(["Pizza ", "pizza", "Sushi  bar", "sushi bar", ""]),
    ).toEqual(["Pizza", "Sushi bar"]);
  });
});
