// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/shared/lib/i18n";
import { ParticipantsPanel } from "./ParticipantsPanel";

const participants = [
  {
    id: "host-id",
    displayName: "Maya",
    role: "HOST" as const,
    online: true,
  },
  {
    id: "guest-id",
    displayName: "Alex",
    role: "GUEST" as const,
    online: false,
  },
];

describe("ParticipantsPanel", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shows presence and confirms before removing a guest", async () => {
    const onKick = vi.fn().mockResolvedValue({ ok: true });

    render(
      <I18nProvider>
        <ParticipantsPanel
          participants={participants}
          isHost
          connected
          onKick={onKick}
        />
      </I18nProvider>,
    );

    expect(screen.getByText("1 online · 2 total")).toBeTruthy();
    expect(screen.getByText("Offline")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Remove Alex" }));

    expect(onKick).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: "Remove Alex?" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Remove user" }));

    await waitFor(() => expect(onKick).toHaveBeenCalledWith("guest-id"));
  });
});
