// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/shared/lib/i18n";
import { ParticipantsPanel } from "./ParticipantsPanel";

const participants = [
  {
    id: "host-id",
    displayName: "Maya",
    role: "HOST" as const,
    canSpin: true,
    online: true,
  },
  {
    id: "guest-id",
    displayName: "Alex",
    role: "GUEST" as const,
    canSpin: false,
    online: false,
  },
];

describe("ParticipantsPanel", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(cleanup);

  it("shows presence and confirms before removing a guest", async () => {
    const onKick = vi.fn().mockResolvedValue({ ok: true });

    render(
      <I18nProvider>
        <ParticipantsPanel
          participants={participants}
          isHost
          connected
          onKick={onKick}
          onSetSpinPermission={vi.fn()}
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

  it("lets the host grant and revoke spin permission independently", async () => {
    const onSetSpinPermission = vi.fn().mockResolvedValue({ ok: true });

    render(
      <I18nProvider>
        <ParticipantsPanel
          participants={[
            ...participants,
            {
              id: "leader-id",
              displayName: "Sam",
              role: "GUEST",
              canSpin: true,
              online: true,
            },
          ]}
          isHost
          connected
          onKick={vi.fn()}
          onSetSpinPermission={onSetSpinPermission}
        />
      </I18nProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Allow Alex to spin" }));
    await waitFor(() =>
      expect(onSetSpinPermission).toHaveBeenCalledWith("guest-id", true),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Remove spin permission from Sam",
      }),
    );
    await waitFor(() =>
      expect(onSetSpinPermission).toHaveBeenCalledWith("leader-id", false),
    );
    expect(screen.getByText("LEADER")).toBeTruthy();
  });
});
