import { createHash } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { RoomsService } from "../src/modules/rooms/application/rooms.service";
import { createRoomSchema } from "../src/modules/rooms/contracts/room.contracts";
import {
  assignStartingWheelExperiment,
  starterOptionsHash,
} from "../src/modules/rooms/domain/starting-wheel-experiment";
import type { PrismaService } from "../src/shared/database/prisma.service";
import { SessionService } from "../src/shared/security/session.service";

const starterWheels = {
  standard: ["Pizza", "Sushi", "Burgers", "Pasta", "Salad"],
  blank: ["Option 1", "Option 2", "Option 3", "Option 4", "Option 5"],
};

function createService() {
  const roomCreate = vi.fn().mockResolvedValue({
    participants: [
      { id: "host-id", roomId: "room-id", displayName: "Host", role: "HOST" },
    ],
  });
  const prisma = { room: { create: roomCreate } } as unknown as PrismaService;
  const service = new RoomsService(prisma, new SessionService());
  vi.spyOn(service, "getState").mockResolvedValue(
    {} as Awaited<ReturnType<RoomsService["getState"]>>,
  );
  return { service, roomCreate };
}

async function createRoom(body: Record<string, unknown>) {
  const { service, roomCreate } = createService();
  const result = await service.create(
    createRoomSchema.parse({ hostName: "Host", title: "Lunch", ...body }),
  );
  const data = roomCreate.mock.calls[0][0].data;
  return {
    experiment: result.experiment,
    storedExperiment: data.experiment,
    storedHash: data.starterOptionsHash,
    labels: data.options.create.map((option: { label: string }) => option.label),
  };
}

describe("starting wheel experiment", () => {
  it("maps the coin flip to groups A and B", () => {
    expect(assignStartingWheelExperiment(() => 0)).toBe("A");
    expect(assignStartingWheelExperiment(() => 1)).toBe("B");
  });

  it("splits rooms roughly in half", () => {
    const draws = Array.from({ length: 2_000 }, () => assignStartingWheelExperiment());
    const groupA = draws.filter((experiment) => experiment === "A").length;
    expect(groupA).toBeGreaterThan(850);
    expect(groupA).toBeLessThan(1_150);
  });

  it("starts each group with its own wheel and remembers the starting set", async () => {
    const seen = new Set<string>();
    for (let attempt = 0; attempt < 40 && seen.size < 2; attempt += 1) {
      const room = await createRoom({ starterWheels });
      seen.add(room.experiment ?? "none");
      expect(room.storedExperiment).toBe(room.experiment);
      expect(room.labels).toEqual(
        room.experiment === "A" ? starterWheels.standard : starterWheels.blank,
      );
      expect(room.storedHash).toBe(starterOptionsHash(room.labels));
    }
    expect(seen).toEqual(new Set(["A", "B"]));
  });

  it("keeps rooms created from a template out of the test", async () => {
    const room = await createRoom({ options: ["Tea", "Coffee"], starterWheels });
    expect(room).toEqual({
      experiment: null,
      storedExperiment: null,
      storedHash: null,
      labels: ["Tea", "Coffee"],
    });
  });

  it("keeps rooms from older clients out of the test", async () => {
    const room = await createRoom({ options: starterWheels.standard });
    expect(room.experiment).toBeNull();
    expect(room.storedHash).toBeNull();
  });

  it("needs at least two slots in both starting wheels", () => {
    expect(
      createRoomSchema.safeParse({
        hostName: "Host",
        starterWheels: { standard: ["Pizza", "Sushi"], blank: ["Option 1"] },
      }).success,
    ).toBe(false);
  });

  // The weekly stats compare this hash with md5(string_agg(label, chr(10) ORDER BY position)).
  it("fingerprints labels the same way as the SQL in room-stats", () => {
    expect(starterOptionsHash(["Пицца", "Суши"])).toBe(
      createHash("md5").update("Пицца\nСуши", "utf8").digest("hex"),
    );
    expect(starterOptionsHash(["Пицца", "Суши"])).not.toBe(
      starterOptionsHash(["Суши", "Пицца"]),
    );
  });
});
