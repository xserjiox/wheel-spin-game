// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/shared/lib/i18n";
import { roomPath } from "@/shared/lib/router";
import { qrCodePath } from "@/shared/ui/qr-code";
import { InviteRoomDialog } from "./InviteRoomDialog";

function renderDialog(guestCount = 0, variant: "created" | "share" = "created") {
  const handlers = { onClose: vi.fn(), onShared: vi.fn(), onShareFailed: vi.fn() };
  render(
    <I18nProvider>
      <InviteRoomDialog
        code="ABCD1234"
        variant={variant}
        guestCount={guestCount}
        {...handlers}
      />
    </I18nProvider>,
  );
  return handlers;
}

describe("InviteRoomDialog", () => {
  afterEach(cleanup);

  it("shows a QR code and copies the room link", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    const { onShared } = renderDialog();

    expect(
      screen.getByRole("img", { name: "Point a phone camera here to join" }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Copy link" }));

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(
        new URL(roomPath("ABCD1234"), window.location.origin).toString(),
      ),
    );
    expect(onShared).toHaveBeenCalledWith("copy_link");
    expect(screen.getByRole("button", { name: "Link copied" })).toBeTruthy();
  });

  it("offers a solo spin until guests join, then leads to the wheel", () => {
    const { onClose } = renderDialog(0);
    expect(screen.getByText("Joined: 0")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Spin by myself/ }));
    expect(onClose).toHaveBeenCalledOnce();

    cleanup();
    renderDialog(3);
    expect(screen.getByText("Joined: 3")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Go to the wheel/ })).toBeTruthy();
  });

  it("names the room instead of announcing it when opened from Share", () => {
    renderDialog(0, "share");
    expect(screen.queryByText("Room is ready")).toBeNull();
    expect(screen.getByText("ROOM ABCD1234")).toBeTruthy();
  });

  it("shows the customize step first and the invitation after it", () => {
    render(
      <I18nProvider>
        <InviteRoomDialog
          code="ABCD1234"
          variant="created"
          guestCount={0}
          onClose={vi.fn()}
          onShared={vi.fn()}
          onShareFailed={vi.fn()}
          customizeStep={({ next, titleId }) => (
            <button id={titleId} type="button" onClick={next}>
              Custom step
            </button>
          )}
        />
      </I18nProvider>,
    );

    expect(screen.getByText("Room is ready · Step 1 of 2")).toBeTruthy();
    expect(
      screen.queryByRole("img", { name: "Point a phone camera here to join" }),
    ).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Custom step" }));
    expect(screen.getByText("Step 2 of 2")).toBeTruthy();
    expect(
      screen.getByRole("img", { name: "Point a phone camera here to join" }),
    ).toBeTruthy();
  });

  it("closes on Escape", () => {
    const { onClose } = renderDialog();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });
});

describe("qrCodePath", () => {
  it("draws a square code with a quiet zone", () => {
    const { path, size } = qrCodePath("https://gatherwheel.com/r/ABCD1234?via=qr");
    expect(size).toBeGreaterThanOrEqual(25);
    expect(path.startsWith("M2 2h")).toBe(true);
  });
});
