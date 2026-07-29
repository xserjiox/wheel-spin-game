// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { I18nProvider } from "@/shared/lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";

describe("LanguageSwitcher", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(cleanup);

  it("keeps the native selector accessible and updates the visible locale", () => {
    const { container } = render(
      <I18nProvider>
        <LanguageSwitcher />
      </I18nProvider>,
    );
    const select = screen.getByRole("combobox", { name: "Language" });
    const visibleLocale = container.querySelector(".language-switcher-control > span");

    expect(visibleLocale?.textContent).toBe("EN");
    fireEvent.change(select, { target: { value: "de" } });
    expect(visibleLocale?.textContent).toBe("DE");
  });
});
