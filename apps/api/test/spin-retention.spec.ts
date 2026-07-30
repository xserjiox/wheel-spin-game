import { describe, expect, it, vi } from "vitest";
import { RoomsService } from "../src/modules/rooms/application/rooms.service";
import type { PrismaService } from "../src/shared/database/prisma.service";
import { SessionService } from "../src/shared/security/session.service";

describe("spin retention", () => {
  it("keeps only the configured history after finishing a spin", async () => {
    const retained = Array.from({ length: 10 }, (_, index) => ({
      id: `spin-${index}`,
    }));
    const transaction = {
      room: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      spin: {
        findMany: vi.fn().mockResolvedValue(retained),
        deleteMany: vi.fn().mockResolvedValue({ count: 3 }),
      },
    };
    const prisma = {
      $transaction: vi.fn((action: (client: typeof transaction) => Promise<boolean>) =>
        action(transaction),
      ),
    } as unknown as PrismaService;
    const service = new RoomsService(prisma, new SessionService());

    await expect(service.finishSpin("room-id", "active-spin")).resolves.toBe(true);
    expect(transaction.spin.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 10 }),
    );
    expect(transaction.spin.deleteMany).toHaveBeenCalledWith({
      where: {
        roomId: "room-id",
        id: { notIn: retained.map(({ id }) => id) },
      },
    });
  });
});
