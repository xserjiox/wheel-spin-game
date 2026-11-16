// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useEffect, useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { useModalLayer } from "./modal-layer";

function Dialog({ name, onClose }: { name: string; onClose: () => void }) {
  const isTopLayer = useModalLayer();
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTopLayer() && event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isTopLayer, onClose]);
  return <div role="dialog" aria-label={name} />;
}

function StackedDialogs() {
  const [inviteOpen, setInviteOpen] = useState(true);
  const [resultOpen, setResultOpen] = useState(false);
  return (
    <>
      {inviteOpen && <Dialog name="Invite" onClose={() => setInviteOpen(false)} />}
      {resultOpen && <Dialog name="Result" onClose={() => setResultOpen(false)} />}
      <button onClick={() => setResultOpen(true)}>Show result</button>
    </>
  );
}

describe("useModalLayer", () => {
  afterEach(() => {
    cleanup();
    document.body.style.overflow = "";
  });

  it("closes stacked dialogs one at a time and unlocks scrolling after the last one", () => {
    render(<StackedDialogs />);
    // A spin started by someone else ends while the invite is still open.
    act(() => screen.getByRole("button", { name: "Show result" }).click());
    expect(screen.getAllByRole("dialog")).toHaveLength(2);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Result" })).toBeNull();
    expect(screen.getByRole("dialog", { name: "Invite" })).toBeTruthy();
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryAllByRole("dialog")).toHaveLength(0);
    expect(document.body.style.overflow).toBe("");
  });
});
