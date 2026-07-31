// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { analyticsPageTitle, normalizeAnalyticsPath } from "./analytics";

type TestAnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
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
    delete testWindow.gtag;
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
    expect(testAnalyticsWindow()["ga-disable-G-TEST123"]).toBeUndefined();
    expect(testAnalyticsWindow().gtag).toBeTypeOf("function");

    applyAnalyticsConsent(false);
    expect(testAnalyticsWindow()["ga-disable-G-TEST123"]).toBe(true);
  });

  it("queues Google tag commands in the official arguments format", async () => {
    vi.stubEnv("VITE_GA_MEASUREMENT_ID", "G-TEST123");
    vi.resetModules();
    const { applyAnalyticsConsent, trackAnalyticsEvent, trackAnalyticsPageView } =
      await import("./analytics");

    applyAnalyticsConsent(true);
    trackAnalyticsPageView("/privacy");
    trackAnalyticsEvent("share_room");
    trackAnalyticsEvent("template_save");

    const commands = (testAnalyticsWindow().dataLayer ?? []).map((command) =>
      Array.from(command as ArrayLike<unknown>),
    );

    expect(commands).toContainEqual([
      "config",
      "G-TEST123",
      expect.not.objectContaining({ cookie_domain: expect.anything() }),
    ]);
    expect(commands).toContainEqual([
      "event",
      "page_view",
      expect.objectContaining({
        page_path: "/privacy",
        send_to: "G-TEST123",
      }),
    ]);
    expect(commands).toContainEqual(["event", "share_room", { send_to: "G-TEST123" }]);
    expect(commands).toContainEqual([
      "event",
      "template_save",
      { send_to: "G-TEST123" },
    ]);
  });
});
