import { BadRequestException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import {
  createRoomSchema,
  optionChanceSchema,
  optionSchema,
  participantSpinPermissionSchema,
  proposalUpdateSchema,
  selectionModeSchema,
  spinSchema,
} from "../src/modules/rooms/contracts/room.contracts";
import {
  assignAvailableName,
  normalizeDisplayName,
} from "../src/modules/rooms/domain/name-policy";
import {
  calculateFinalRotation,
  normalizeChanceWeights,
  redistributeChanceWeights,
  selectWeightedIndex,
} from "../src/modules/rooms/domain/wheel-engine";
import { roomCookieName } from "../src/shared/config/room.config";
import { parseRequest } from "../src/shared/http/parse-request";
import { SessionService } from "../src/shared/security/session.service";

describe("MVP room rules", () => {
  it("adds a sequential suffix to duplicate guest names", () => {
    const names = ["алекс", "алекс 2"];
    expect(assignAvailableName(" Алекс ", names)).toBe("Алекс 3");
    expect(normalizeDisplayName("  Иван   Иванов ")).toBe("иван иванов");
  });

  it("keeps a separate session cookie for each room", () => {
    expect(roomCookieName("Ab7xK2pQ")).toBe("gatherwheel_session_ab7xk2pq");
  });

  it("selects the target segment under the pointer", () => {
    const optionWeights = [1, 1, 1, 1, 1];
    const winnerIndex = 3;
    const finalRotation = calculateFinalRotation({
      optionWeights,
      winnerIndex,
      currentRotation: 725,
      durationMs: 20_000,
    });
    const target =
      (((-(winnerIndex + 0.5) * (360 / optionWeights.length)) % 360) + 360) % 360;
    expect(((finalRotation % 360) + 360) % 360).toBeCloseTo(target, 8);
    expect(finalRotation).toBeGreaterThan(725 + 5 * 360);
  });

  it("selects weighted options at exact integer boundaries", () => {
    const weights = [1, 2, 3];
    const pick = (value: number) =>
      selectWeightedIndex(weights, (total) => {
        expect(total).toBe(600);
        return value;
      });

    expect(pick(0)).toBe(0);
    expect(pick(99)).toBe(0);
    expect(pick(100)).toBe(1);
    expect(pick(299)).toBe(1);
    expect(pick(300)).toBe(2);
    expect(pick(599)).toBe(2);
  });

  it("centers the weighted winner segment under the pointer", () => {
    const finalRotation = calculateFinalRotation({
      optionWeights: [1, 2, 3],
      winnerIndex: 1,
      currentRotation: 0,
      durationMs: 5_000,
    });

    expect(((finalRotation % 360) + 360) % 360).toBeCloseTo(240, 8);
  });

  it("validates room and spin limits", () => {
    expect(
      createRoomSchema.parse({
        hostName: "Маша",
        title: "Куда идём?",
        password: "",
      }).hostName,
    ).toBe("Маша");
    expect(() =>
      spinSchema.parse({ requestId: crypto.randomUUID(), durationMs: 999 }),
    ).toThrow();
    expect(
      spinSchema.parse({ requestId: crypto.randomUUID(), durationMs: 45_000 })
        .durationMs,
    ).toBe(45_000);
    expect(() =>
      spinSchema.parse({ requestId: crypto.randomUUID(), durationMs: 120_001 }),
    ).toThrow();
    expect(() =>
      parseRequest(createRoomSchema, {
        hostName: "Маша",
        title: "x".repeat(61),
        password: "",
      }),
    ).toThrow(BadRequestException);
  });

  it("limits new and edited proposals to 80 characters", () => {
    expect(optionSchema.safeParse({ label: "x".repeat(80) }).success).toBe(true);
    expect(optionSchema.safeParse({ label: "x".repeat(81) }).success).toBe(false);
    expect(
      proposalUpdateSchema.safeParse({
        proposalId: crypto.randomUUID(),
        label: "x".repeat(81),
      }).success,
    ).toBe(false);
  });

  it("accepts slot chances in tenths of a percent", () => {
    const optionId = crypto.randomUUID();
    expect(optionChanceSchema.parse({ optionId, chance: 91.8 })).toEqual({
      optionId,
      chance: 91.8,
    });
    expect(optionChanceSchema.safeParse({ optionId, chance: 0.9 }).success).toBe(false);
    expect(optionChanceSchema.safeParse({ optionId, chance: 99.1 }).success).toBe(
      false,
    );
    expect(optionChanceSchema.safeParse({ optionId, chance: 20.01 }).success).toBe(
      false,
    );
  });

  it("redistributes chance while keeping every other slot at one percent", () => {
    const distribution = redistributeChanceWeights(
      Array.from({ length: 5 }, (_, index) => ({ id: String(index), weight: 1 })),
      "0",
      96,
    );

    expect(distribution).toEqual([
      { id: "0", weight: 96 },
      { id: "1", weight: 1 },
      { id: "2", weight: 1 },
      { id: "3", weight: 1 },
      { id: "4", weight: 1 },
    ]);
    expect(distribution.reduce((total, option) => total + option.weight, 0)).toBe(100);
    expect(() =>
      redistributeChanceWeights(
        Array.from({ length: 6 }, (_, index) => ({ id: String(index), weight: 1 })),
        "0",
        96,
      ),
    ).toThrow(RangeError);
  });

  it("takes an increase only from slots that are above the one-percent floor", () => {
    const raised = redistributeChanceWeights(
      [
        { id: "dominant", weight: 96 },
        { id: "target", weight: 1 },
        { id: "three", weight: 1 },
        { id: "four", weight: 1 },
        { id: "five", weight: 1 },
      ],
      "target",
      2,
    );

    expect(raised).toEqual([
      { id: "dominant", weight: 95 },
      { id: "target", weight: 2 },
      { id: "three", weight: 1 },
      { id: "four", weight: 1 },
      { id: "five", weight: 1 },
    ]);
    expect(redistributeChanceWeights(raised, "target", 1)).toEqual([
      { id: "dominant", weight: 96 },
      { id: "target", weight: 1 },
      { id: "three", weight: 1 },
      { id: "four", weight: 1 },
      { id: "five", weight: 1 },
    ]);
  });

  it("normalizes changed slot sets without dropping a slot below one percent", () => {
    const distribution = normalizeChanceWeights([
      { id: "dominant", weight: 96 },
      { id: "two", weight: 1 },
      { id: "three", weight: 1 },
      { id: "four", weight: 1 },
      { id: "five", weight: 1 },
      { id: "new", weight: 1 },
    ]);

    expect(distribution.reduce((total, option) => total + option.weight, 0)).toBe(100);
    expect(distribution.every((option) => option.weight >= 1)).toBe(true);
    expect(distribution.every((option) => (option.weight * 10) % 1 === 0)).toBe(true);
  });

  it("validates spin permission updates", () => {
    const participantId = crypto.randomUUID();

    expect(
      participantSpinPermissionSchema.parse({
        participantId,
        canSpin: true,
      }),
    ).toEqual({ participantId, canSpin: true });
    expect(
      participantSpinPermissionSchema.safeParse({
        participantId,
        canSpin: "yes",
      }).success,
    ).toBe(false);
  });

  it("validates the room selection mode", () => {
    expect(selectionModeSchema.parse({ selectionMode: "ELIMINATION" })).toEqual({
      selectionMode: "ELIMINATION",
    });
    expect(selectionModeSchema.safeParse({ selectionMode: "weighted" }).success).toBe(
      false,
    );
  });

  it("hashes tokens and reads only the requested room cookie", () => {
    const sessions = new SessionService();
    const created = sessions.create();
    expect(created.hash).toBe(sessions.hash(created.token));
    expect(
      sessions.readCookie(
        "gatherwheel_session_one=first; gatherwheel_session_two=second",
        "gatherwheel_session_two",
      ),
    ).toBe("second");
  });
});
