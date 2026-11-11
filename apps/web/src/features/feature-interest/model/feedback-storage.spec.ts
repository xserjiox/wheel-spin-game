// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import {
  claimSurvey,
  FEEDBACK_STORAGE_KEY,
  noteInterest,
  SURVEY_AFTER_SPINS,
} from "./feedback-storage";

describe("feedback storage", () => {
  beforeEach(() => window.localStorage.clear());

  it("offers the survey once, and only after a few spins", () => {
    expect(claimSurvey(window.localStorage, SURVEY_AFTER_SPINS - 1)).toBe(false);
    expect(claimSurvey(window.localStorage, SURVEY_AFTER_SPINS)).toBe(true);
    expect(claimSurvey(window.localStorage, SURVEY_AFTER_SPINS + 5)).toBe(false);
  });

  it("counts each feature once per device", () => {
    expect(noteInterest(window.localStorage, "split_teams")).toBe(true);
    expect(noteInterest(window.localStorage, "split_teams")).toBe(false);
    expect(noteInterest(window.localStorage, "pro")).toBe(true);
    expect(JSON.parse(window.localStorage.getItem(FEEDBACK_STORAGE_KEY) ?? "")).toEqual(
      {
        surveyShown: false,
        features: ["split_teams", "pro"],
      },
    );
  });

  it("ignores damaged or unknown stored values", () => {
    window.localStorage.setItem(FEEDBACK_STORAGE_KEY, "{not json");
    expect(noteInterest(window.localStorage, "pro")).toBe(true);

    window.localStorage.setItem(
      FEEDBACK_STORAGE_KEY,
      JSON.stringify({ surveyShown: "yes", features: ["pro", "my own idea"] }),
    );
    expect(noteInterest(window.localStorage, "pro")).toBe(false);
    expect(claimSurvey(window.localStorage, SURVEY_AFTER_SPINS)).toBe(true);
  });
});
