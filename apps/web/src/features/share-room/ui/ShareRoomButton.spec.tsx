// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/shared/lib/i18n";
import { roomPath } from "@/shared/lib/router";
import { ShareRoomButton } from "./ShareRoomButton";

describe("ShareRoomButton", () => {
  afterEach(cleanup);

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

  it("reports a failed copy without reporting success", async () => {
    const onCopied = vi.fn();
    const onCopyError = vi.fn();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
    });

    render(
      <I18nProvider>
        <ShareRoomButton code="Room" onCopied={onCopied} onCopyError={onCopyError} />
      </I18nProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Share" }));

    await waitFor(() => expect(onCopyError).toHaveBeenCalledOnce());
    expect(onCopied).not.toHaveBeenCalled();
  });
});
