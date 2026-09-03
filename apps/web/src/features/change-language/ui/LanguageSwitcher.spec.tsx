// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { I18nProvider, SUPPORTED_LOCALES } from "@/shared/lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";

describe("LanguageSwitcher", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.replaceState(null, "", "/");
  });

  afterEach(() => {
    cleanup();
    window.history.replaceState(null, "", "/");
  });

  it("opens a styled language menu and updates the visible locale", () => {
    render(
      <I18nProvider>
        <LanguageSwitcher />
      </I18nProvider>,
    );
    const trigger = screen.getByRole("button", { name: "Language: English" });

    expect(trigger.textContent).toContain("EN");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(trigger);
    const menu = screen.getByRole("menu");
    expect(within(menu).getAllByRole("menuitemradio")).toHaveLength(
      SUPPORTED_LOCALES.length,
    );

    fireEvent.click(within(menu).getByRole("menuitemradio", { name: "DE Deutsch" }));
    expect(trigger.textContent).toContain("DE");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(window.location.pathname).toBe("/de/");

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("menuitemradio", { name: "ZH-T 繁體中文" }));
    expect(trigger.textContent).toContain("繁體中文");
    expect(window.location.pathname).toBe("/zh-hant/");
  });

  it("supports keyboard navigation and escape", () => {
    render(
      <I18nProvider>
        <LanguageSwitcher />
      </I18nProvider>,
    );
    const trigger = screen.getByRole("button", { name: "Language: English" });

    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    const english = screen.getByRole("menuitemradio", { name: "EN English" });
    const russian = screen.getByRole("menuitemradio", { name: "RU Русский" });
    fireEvent.keyDown(english, { key: "ArrowDown" });
    expect(document.activeElement).toBe(russian);

    fireEvent.keyDown(russian, { key: "Escape" });
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});
