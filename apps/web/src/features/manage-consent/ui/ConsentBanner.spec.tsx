// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { ConsentProvider } from "@/features/manage-consent";
import { CONSENT_STORAGE_KEY } from "@/shared/lib/consent";
import { I18nProvider } from "@/shared/lib/i18n";
import { ConsentBanner } from "./ConsentBanner";

describe("ConsentBanner", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("offers rejection without a cookie wall and lets the user change the choice", () => {
    render(
      <I18nProvider initialLocale="en">
        <MemoryRouter>
          <ConsentProvider>
            <main>Service remains available</main>
            <ConsentBanner />
          </ConsentProvider>
        </MemoryRouter>
      </I18nProvider>,
    );

    expect(screen.getByText("Service remains available")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Allow analytics" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Reject" }));
    expect(
      JSON.parse(window.localStorage.getItem(CONSENT_STORAGE_KEY) ?? "").analytics,
    ).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: "Cookie settings" }));
    const analyticsToggle = screen.getByRole("checkbox") as HTMLInputElement;
    expect(analyticsToggle.checked).toBe(false);

    fireEvent.click(analyticsToggle);
    fireEvent.click(screen.getByRole("button", { name: "Save choices" }));

    expect(
      JSON.parse(window.localStorage.getItem(CONSENT_STORAGE_KEY) ?? "").analytics,
    ).toBe(true);
  });
});
