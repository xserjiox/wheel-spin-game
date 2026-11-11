import { describe, expect, it } from "vitest";
import {
  cleanOption,
  MAX_OPTION_LENGTH,
  reviewOptions,
  splitPastedList,
} from "./parse-option-list";

describe("cleanOption", () => {
  it("trims, collapses spaces and caps the length", () => {
    expect(cleanOption("  Vika   Li ")).toBe("Vika Li");
    expect(cleanOption("x".repeat(120))).toHaveLength(MAX_OPTION_LENGTH);
  });
});

describe("splitPastedList", () => {
  it("splits lines and spreadsheet cells and drops blanks", () => {
    expect(splitPastedList("  Anna \n\nBoris\r\n  \nVika\tGleb")).toEqual([
      "Anna",
      "Boris",
      "Vika",
      "Gleb",
    ]);
  });

  it("removes bullets and numbering copied from notes", () => {
    expect(splitPastedList("- Anna\n• Boris\n1. Vika\n2) Gleb\n2024\n-")).toEqual([
      "Anna",
      "Boris",
      "Vika",
      "Gleb",
      "2024",
      "-",
    ]);
  });
});

describe("reviewOptions", () => {
  it("counts each option once and flags later repeats", () => {
    expect(reviewOptions(["Pizza", "", "pizza ", "Sushi", "  "])).toEqual({
      options: ["Pizza", "Sushi"],
      duplicates: [false, false, true, false, false],
      wheelPositions: [0, null, null, 1, null],
    });
  });
});
