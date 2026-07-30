// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { analyticsPageTitle, normalizeAnalyticsPath } from "./analytics";

type TestAnalyticsWindow = Window & {
  dataLayer?: unknown[];
  "ga-disable-G-TEST123"?: boolean;
};

function testAnalyticsWindow(): TestAnalyticsWindow {
  return window as unknown as TestAnalyticsWindow;
}

describe("analytics privacy normalization", () => {
  it("removes room identifiers and query strings from page paths", () => {
    expect(normalizeAnalyticsPath("/r/SecretRoom123")).toBe("/r/:room");
    expect(normalizeAnalyticsPath("/r/SecretRoom123/?invite=yes")).toBe("/r/:room");
    expect(normalizeAnalyticsPath("/privacy?from=footer")).toBe("/privacy");
  });

  it("uses generic titles that cannot contain room data", () => {
    expect(analyticsPageTitle("/r/SecretRoom123")).toBe("Shared room");
    expect(analyticsPageTitle("/cookies")).toBe("Cookie Policy");
    expect(analyticsPageTitle("/unknown")).toBe("Page");
  });
});

describe("analytics consent application", () => {
  afterEach(() => {
    const testWindow = testAnalyticsWindow();
    vi.unstubAllEnvs();
    document.getElementById("gatherwheel-google-analytics")?.remove();
    delete testWindow.dataLayer;
    delete testWindow["ga-disable-G-TEST123"];
  });

  it("loads the tag only after consent and disables it after withdrawal", async () => {
    vi.stubEnv("VITE_GA_MEASUREMENT_ID", "G-TEST123");
    vi.resetModules();
    const { applyAnalyticsConsent } = await import("./analytics");

    applyAnalyticsConsent(false);
    expect(document.getElementById("gatherwheel-google-analytics")).toBeNull();
    expect(testAnalyticsWindow()["ga-disable-G-TEST123"]).toBe(true);

    applyAnalyticsConsent(true);
    expect(
      document.getElementById("gatherwheel-google-analytics")?.getAttribute("src"),
    ).toBe("https://www.googletagmanager.com/gtag/js?id=G-TEST123");
    expect(testAnalyticsWindow()["ga-disable-G-TEST123"]).toBe(false);

    applyAnalyticsConsent(false);
    expect(testAnalyticsWindow()["ga-disable-G-TEST123"]).toBe(true);
  });
});
