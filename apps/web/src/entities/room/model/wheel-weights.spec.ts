import { describe, expect, it } from "vitest";
import type { Option } from "./types";
import {
  getOptionIndexAtAngle,
  getOptionChanceMaximum,
  getOptionProbability,
  getWheelSegments,
} from "./wheel-weights";

const options: Option[] = [
  { id: "one", label: "One", position: 0, weight: 1 },
  { id: "two", label: "Two", position: 1, weight: 2 },
  { id: "three", label: "Three", position: 2, weight: 3 },
];

describe("wheel weights", () => {
  it("builds segment arcs proportional to their weights", () => {
    const segments = getWheelSegments(options);

    expect(segments[0].arc).toBeCloseTo(Math.PI / 3);
    expect(segments[1].arc).toBeCloseTo((Math.PI * 2) / 3);
    expect(segments[2].arc).toBeCloseTo(Math.PI);
    expect(segments[2].end).toBeCloseTo((Math.PI * 3) / 2);
  });

  it("resolves pointer angles using weighted boundaries", () => {
    const radians = (degrees: number) => (degrees * Math.PI) / 180;

    expect(getOptionIndexAtAngle(options, radians(59))).toBe(0);
    expect(getOptionIndexAtAngle(options, radians(60))).toBe(1);
    expect(getOptionIndexAtAngle(options, radians(179))).toBe(1);
    expect(getOptionIndexAtAngle(options, radians(180))).toBe(2);
  });

  it("treats legacy options without a weight as weight one", () => {
    const legacyOptions = options.map(({ weight: _weight, ...option }) => option);

    expect(getOptionProbability(legacyOptions[0], legacyOptions)).toBeCloseTo(100 / 3);
  });

  it("reserves at least one percent for every other active option", () => {
    const fiveEqualOptions: Option[] = Array.from({ length: 5 }, (_, index) => ({
      id: String(index),
      label: `Option ${index + 1}`,
      position: index,
      weight: 1,
    }));
    expect(getOptionChanceMaximum(fiveEqualOptions)).toBe(96);
    expect(
      getOptionChanceMaximum([
        ...fiveEqualOptions,
        { id: "5", label: "Option 6", position: 5, weight: 1 },
      ]),
    ).toBe(95);
  });

  it("does not reserve a percentage for excluded options", () => {
    const weightedOptions: Option[] = [
      { id: "target", label: "Target", position: 0, weight: 1 },
      { id: "two", label: "Two", position: 1, weight: 2 },
      { id: "three", label: "Three", position: 2, weight: 3 },
      { id: "excluded", label: "Excluded", position: 3, weight: 100, excluded: true },
    ];

    expect(getOptionChanceMaximum(weightedOptions)).toBe(98);
  });
});
