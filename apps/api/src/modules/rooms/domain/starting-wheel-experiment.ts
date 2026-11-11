import { createHash, randomInt } from "node:crypto";

// A: the usual sample options for the host's language. B: neutral "Option 1…" placeholders.
export type StartingWheelExperiment = "A" | "B";

export type StartingWheels = { standard: string[]; blank: string[] };

export function assignStartingWheelExperiment(
  draw: () => number = () => randomInt(2),
): StartingWheelExperiment {
  return draw() === 0 ? "A" : "B";
}

export function startingWheelFor(
  experiment: StartingWheelExperiment,
  wheels: StartingWheels,
): string[] {
  return experiment === "A" ? wheels.standard : wheels.blank;
}

// Must stay identical to the SQL in room-stats.ts:
// md5(string_agg(option.label, chr(10) ORDER BY option.position)).
export function starterOptionsHash(labels: string[]): string {
  return createHash("md5").update(labels.join("\n"), "utf8").digest("hex");
}
