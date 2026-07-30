// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/shared/lib/i18n";
import { SaveRoomPrompt } from "./SaveRoomPrompt";

afterEach(cleanup);

describe("SaveRoomPrompt", () => {
  it("makes saving the room an explicit choice", () => {
    const onSave = vi.fn();
    const onDismiss = vi.fn();

    render(
      <I18nProvider>
        <SaveRoomPrompt onSave={onSave} onDismiss={onDismiss} />
      </I18nProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Save room" }));
    fireEvent.click(screen.getByRole("button", { name: "Not now" }));

    expect(onSave).toHaveBeenCalledOnce();
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
