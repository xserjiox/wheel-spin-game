// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/shared/lib/i18n";
import { SavedRoomList } from "./SavedRoomList";

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
});
