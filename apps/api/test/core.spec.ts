import { BadRequestException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import {
  createRoomSchema,
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
import { calculateFinalRotation } from "../src/modules/rooms/domain/wheel-engine";
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
    const optionCount = 5;
    const winnerIndex = 3;
    const finalRotation = calculateFinalRotation({
      optionCount,
      winnerIndex,
      currentRotation: 725,
      durationMs: 20_000,
    });
    const target = (((-(winnerIndex + 0.5) * (360 / optionCount)) % 360) + 360) % 360;
    expect(((finalRotation % 360) + 360) % 360).toBeCloseTo(target, 8);
    expect(finalRotation).toBeGreaterThan(725 + 5 * 360);
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
