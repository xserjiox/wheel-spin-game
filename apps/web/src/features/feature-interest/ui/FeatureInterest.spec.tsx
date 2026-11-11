// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { trackAnalyticsEvent } from "@/shared/lib/analytics";
import { I18nProvider } from "@/shared/lib/i18n";
import { FeatureInterestButton } from "./FeatureInterestButton";
import { MissingFeatureSurvey } from "./MissingFeatureSurvey";

vi.mock("@/shared/lib/analytics", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/shared/lib/analytics")>()),
  trackAnalyticsEvent: vi.fn(),
}));

describe("feature interest", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.mocked(trackAnalyticsEvent).mockClear();
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("thanks the host and counts the tap once", () => {
    render(
      <I18nProvider>
        <FeatureInterestButton feature="split_teams" source="after_spin" />
      </I18nProvider>,
    );
    const button = screen.getByRole("button", { name: /Split into teams/ });
    expect(button.textContent).toContain("Soon");

    fireEvent.click(button);
    fireEvent.click(button);

    expect(button.textContent).toBe("Coming soon! Thanks — noted.");
    expect(trackAnalyticsEvent).toHaveBeenCalledOnce();
    expect(trackAnalyticsEvent).toHaveBeenCalledWith("feature_interest", {
      feature: "split_teams",
      source: "after_spin",
    });
  });

  it("does not count the same feature again on a later visit", () => {
    const view = () =>
      render(
        <I18nProvider>
          <FeatureInterestButton feature="pro" source="settings" />
        </I18nProvider>,
      );
    view();
    fireEvent.click(screen.getByRole("button", { name: /Pro features/ }));
    cleanup();
    view();
    fireEvent.click(screen.getByRole("button", { name: /Pro features/ }));
    expect(trackAnalyticsEvent).toHaveBeenCalledOnce();
  });

  it("asks what is missing with fixed answers only", () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(
      <I18nProvider>
        <MissingFeatureSurvey onClose={onClose} />
      </I18nProvider>,
    );

    expect(screen.getByText("What's missing?")).toBeTruthy();
    expect(screen.queryByRole("textbox")).toBeNull();
    const answers = screen
      .getAllByRole("button")
      .filter((button) => button.textContent !== "×");
    expect(answers).toHaveLength(5);

    fireEvent.click(screen.getByRole("button", { name: "Projector mode" }));
    expect(trackAnalyticsEvent).toHaveBeenCalledWith("feature_interest", {
      feature: "projector_mode",
      source: "survey",
    });
    expect(screen.getByText("Coming soon! Thanks — noted.")).toBeTruthy();

    act(() => vi.advanceTimersByTime(2_500));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("can be dismissed without answering", () => {
    const onClose = vi.fn();
    render(
      <I18nProvider>
        <MissingFeatureSurvey onClose={onClose} />
      </I18nProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Not now" }));
    expect(onClose).toHaveBeenCalled();
    expect(trackAnalyticsEvent).not.toHaveBeenCalled();
  });
});
