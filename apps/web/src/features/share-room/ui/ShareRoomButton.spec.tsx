// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/shared/lib/i18n";
import { ShareRoomButton } from "./ShareRoomButton";

describe("ShareRoomButton", () => {
  afterEach(cleanup);

  it("opens the invitation instead of copying right away", () => {
    const onOpen = vi.fn();

    render(
      <I18nProvider>
        <ShareRoomButton onOpen={onOpen} />
      </I18nProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Share" }));

    expect(onOpen).toHaveBeenCalledOnce();
  });
});
