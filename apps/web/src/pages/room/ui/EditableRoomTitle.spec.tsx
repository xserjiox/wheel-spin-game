// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EditableRoomTitle } from "./EditableRoomTitle";

const longTitle = "Who gets lucky with this extremely long room title tonight?";

afterEach(cleanup);

describe("EditableRoomTitle", () => {
  it("renders the complete title as a wrapping heading until editing starts", () => {
    render(
      <EditableRoomTitle
        value={longTitle}
        label="Wheel title"
        editLabel="Edit wheel title"
        onSave={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: longTitle })).toBeTruthy();
    expect(screen.queryByRole("textbox", { name: "Wheel title" })).toBeNull();
  });

  it("edits the complete title and saves it with Enter", async () => {
    const onSave = vi.fn().mockResolvedValue({ ok: true });
    render(
      <EditableRoomTitle
        value={longTitle}
        label="Wheel title"
        editLabel="Edit wheel title"
        onSave={onSave}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit wheel title" }));
    const editor = screen.getByRole("textbox", { name: "Wheel title" });
    expect((editor as HTMLTextAreaElement).value).toBe(longTitle);

    fireEvent.change(editor, { target: { value: "Updated long wheel title" } });
    fireEvent.keyDown(editor, { key: "Enter" });

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith("Updated long wheel title");
    });
    expect(
      screen.getByRole("heading", { name: "Updated long wheel title" }),
    ).toBeTruthy();
  });

  it("cancels editing with Escape", () => {
    const onSave = vi.fn();
    render(
      <EditableRoomTitle
        value={longTitle}
        label="Wheel title"
        editLabel="Edit wheel title"
        onSave={onSave}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit wheel title" }));
    const editor = screen.getByRole("textbox", { name: "Wheel title" });
    fireEvent.change(editor, { target: { value: "Discard this title" } });
    fireEvent.keyDown(editor, { key: "Escape" });

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: longTitle })).toBeTruthy();
  });
});
