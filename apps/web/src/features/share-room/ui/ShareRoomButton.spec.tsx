// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/shared/lib/i18n";
import { roomPath } from "@/shared/lib/router";
import { ShareRoomButton } from "./ShareRoomButton";

describe("ShareRoomButton", () => {
  it("copies the canonical room URL on click", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const onCopied = vi.fn();

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(
      <I18nProvider>
        <ShareRoomButton
          code="Room with spaces"
          onCopied={onCopied}
          onCopyError={vi.fn()}
        />
      </I18nProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Share" }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(
        new URL(roomPath("Room with spaces"), window.location.origin).toString(),
      );
    });
    expect(onCopied).toHaveBeenCalledOnce();
  });
});
