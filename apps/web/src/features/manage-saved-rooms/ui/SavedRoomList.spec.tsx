// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/shared/lib/i18n";
import { SavedRoomList } from "./SavedRoomList";

afterEach(cleanup);

describe("SavedRoomList", () => {
  it("opens room creation from the empty state arrow", () => {
    const onCreate = vi.fn();

    render(
      <I18nProvider>
        <SavedRoomList
          rooms={[]}
          openingCode={null}
          onOpen={vi.fn()}
          onRemove={vi.fn()}
          onCreate={onCreate}
        />
      </I18nProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Create room" }));

    expect(onCreate).toHaveBeenCalledOnce();
  });

  it("shows the saved role for host and guest rooms", () => {
    render(
      <I18nProvider>
        <SavedRoomList
          rooms={[
            {
              code: "Host123",
              title: "Host room",
              role: "HOST",
              createdAt: "2026-07-29T10:00:00.000Z",
              lastOpenedAt: "2026-07-29T10:00:00.000Z",
              expiresAt: "2026-08-05T10:00:00.000Z",
            },
            {
              code: "Guest123",
              title: "Guest room",
              role: "GUEST",
              createdAt: "2026-07-29T10:00:00.000Z",
              lastOpenedAt: "2026-07-29T11:00:00.000Z",
              expiresAt: "2026-08-05T10:00:00.000Z",
            },
          ]}
          openingCode={null}
          onOpen={vi.fn()}
          onRemove={vi.fn()}
          onCreate={vi.fn()}
        />
      </I18nProvider>,
    );

    expect(screen.getByText("HOST", { exact: true })).toBeTruthy();
    expect(screen.getByText("GUEST", { exact: true })).toBeTruthy();
  });
});
