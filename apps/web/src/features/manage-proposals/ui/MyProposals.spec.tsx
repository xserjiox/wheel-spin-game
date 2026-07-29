// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/shared/lib/i18n";
import { MyProposals } from "./MyProposals";

const proposal = {
  id: "proposal-id",
  label: "Order pizza",
  createdAt: "2026-07-29T10:00:00.000Z",
};

describe("MyProposals", () => {
  afterEach(cleanup);

  beforeEach(() => {
    window.localStorage.clear();
  });

  it("lets a guest edit and remove a pending proposal", async () => {
    const onUpdate = vi.fn().mockResolvedValue({ ok: true });
    const onRemove = vi.fn().mockResolvedValue({ ok: true });

    render(
      <I18nProvider>
        <MyProposals
          proposals={[proposal]}
          connected
          onUpdate={onUpdate}
          onRemove={onRemove}
        />
      </I18nProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    const input = screen.getByRole("textbox", { name: "Edit Order pizza" });
    expect(input.getAttribute("maxlength")).toBe("80");
    fireEvent.change(input, { target: { value: "Order sushi" } });
    fireEvent.click(screen.getByRole("button", { name: "Save idea" }));

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith("proposal-id", "Order sushi"),
    );
    fireEvent.click(screen.getByRole("button", { name: "Delete Order pizza" }));
    await waitFor(() => expect(onRemove).toHaveBeenCalledWith("proposal-id"));
  });

  it("removes an idea from the view once the host handles it", () => {
    const props = {
      connected: true,
      onUpdate: vi.fn().mockResolvedValue({ ok: true }),
      onRemove: vi.fn().mockResolvedValue({ ok: true }),
    };
    const view = render(
      <I18nProvider>
        <MyProposals proposals={[proposal]} {...props} />
      </I18nProvider>,
    );

    expect(screen.getByText("Order pizza")).toBeTruthy();
    view.rerender(
      <I18nProvider>
        <MyProposals proposals={[]} {...props} />
      </I18nProvider>,
    );

    expect(screen.queryByText("Order pizza")).toBeNull();
    expect(screen.getByText("Your pending ideas will appear here.")).toBeTruthy();
  });
});
