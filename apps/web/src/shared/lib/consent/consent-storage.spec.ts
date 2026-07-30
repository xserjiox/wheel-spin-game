// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import {
  CONSENT_LIFETIME_DAYS,
  CONSENT_STORAGE_KEY,
  readConsentChoice,
  writeConsentChoice,
} from "./consent-storage";

describe("analytics consent storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("stores a versioned choice for 180 days", () => {
    const now = new Date("2026-07-30T12:00:00.000Z");
    writeConsentChoice(window.localStorage, "granted", now);

    const stored = JSON.parse(
      window.localStorage.getItem(CONSENT_STORAGE_KEY) ?? "",
    ) as Record<string, unknown>;

    expect(stored).toMatchObject({
      version: 1,
      analytics: true,
      decidedAt: now.toISOString(),
    });
    expect(stored.expiresAt).toBe("2027-01-26T12:00:00.000Z");
    expect(CONSENT_LIFETIME_DAYS).toBe(180);
    expect(readConsentChoice(window.localStorage, now.getTime())).toBe("granted");
  });

  it("removes expired and malformed choices", () => {
    writeConsentChoice(
      window.localStorage,
      "denied",
      new Date("2026-01-01T00:00:00.000Z"),
    );

    expect(
      readConsentChoice(window.localStorage, Date.parse("2027-01-01T00:00:00Z")),
    ).toBeNull();
    expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toBeNull();

    window.localStorage.setItem(CONSENT_STORAGE_KEY, "{broken");
    expect(readConsentChoice(window.localStorage)).toBeNull();
    expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toBeNull();
  });
});
