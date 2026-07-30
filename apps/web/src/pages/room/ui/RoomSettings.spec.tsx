// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { deleteOwnData, deleteRoomData } from "@/entities/room";
import { removeSavedRoom } from "@/entities/saved-room";
import { I18nProvider } from "@/shared/lib/i18n";
import { RoomSettings } from "./RoomSettings";

vi.mock("@/entities/room", () => ({
  deleteOwnData: vi.fn(),
  deleteRoomData: vi.fn(),
  exportOwnData: vi.fn(),
}));

vi.mock("@/entities/saved-room", () => ({
  removeSavedRoom: vi.fn(),
}));

describe("RoomSettings data deletion", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.mocked(deleteRoomData).mockReset().mockResolvedValue({ ok: true });
    vi.mocked(deleteOwnData).mockReset().mockResolvedValue({ ok: true });
    vi.mocked(removeSavedRoom).mockReset();
  });

  afterEach(cleanup);

  it("uses an in-app confirmation modal before deleting a room", async () => {
    const onExit = vi.fn();
    const nativeConfirm = vi.spyOn(window, "confirm");

    render(
      <I18nProvider initialLocale="en">
        <RoomSettings
          code="TestRoom"
          isHost
          hasPassword={false}
          disabled={false}
          update={vi.fn()}
          onExit={onExit}
        />
      </I18nProvider>,
    );

    const deleteTrigger = screen.getByRole("button", {
      name: "Delete room and all its data",
    });
    fireEvent.click(deleteTrigger);

    const dialog = screen.getByRole("dialog", {
      name: "Delete room and all its data",
    });
    expect(deleteRoomData).not.toHaveBeenCalled();
    expect(
      within(dialog).getByText(
        "Permanently delete this room, all participants, choices, suggestions, and spin history? This cannot be undone.",
      ),
    ).toBeTruthy();
    expect(nativeConfirm).not.toHaveBeenCalled();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();

    fireEvent.click(deleteTrigger);
    const reopenedDialog = screen.getByRole("dialog", {
      name: "Delete room and all its data",
    });
    fireEvent.click(
      within(reopenedDialog).getByRole("button", {
        name: "Delete room and all its data",
      }),
    );

    await waitFor(() => {
      expect(deleteRoomData).toHaveBeenCalledWith("TestRoom");
      expect(removeSavedRoom).toHaveBeenCalledWith(window.localStorage, "TestRoom");
      expect(onExit).toHaveBeenCalledOnce();
    });
  });

  it("uses the same modal flow for deleting guest data", async () => {
    render(
      <I18nProvider initialLocale="en">
        <RoomSettings
          code="GuestRoom"
          isHost={false}
          hasPassword={false}
          disabled={false}
          update={vi.fn()}
          onExit={vi.fn()}
        />
      </I18nProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete my room data" }));
    const dialog = screen.getByRole("dialog", { name: "Delete my room data" });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Delete my room data" }),
    );

    await waitFor(() => {
      expect(deleteOwnData).toHaveBeenCalledWith("GuestRoom");
      expect(deleteRoomData).not.toHaveBeenCalled();
    });
  });
});
