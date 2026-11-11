// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/shared/lib/i18n";
import { CustomizeWheelStep } from "./CustomizeWheelStep";

function renderStep(onApply = vi.fn().mockResolvedValue({ ok: true })) {
  const onSkip = vi.fn();
  render(
    <I18nProvider>
      <CustomizeWheelStep titleId="title" onApply={onApply} onSkip={onSkip} />
    </I18nProvider>,
  );
  return { onApply, onSkip };
}

const field = (number: number) =>
  screen.getByRole("textbox", { name: `Option ${number}` }) as HTMLInputElement;
const fieldValues = () =>
  screen.getAllByRole("textbox").map((input) => (input as HTMLInputElement).value);

function type(number: number, value: string) {
  fireEvent.change(field(number), { target: { value } });
}

function paste(number: number, text: string) {
  fireEvent.paste(field(number), { clipboardData: { getData: () => text } });
}

describe("CustomizeWheelStep", () => {
  afterEach(cleanup);

  it("starts with empty fields that show sample names", () => {
    renderStep();
    expect(fieldValues()).toEqual(["", "", "", ""]);
    expect(field(1).placeholder).toBe("Anna");
    expect(field(4).placeholder).toBe("David");
  });

  it("needs at least two options before Done", () => {
    renderStep();
    const done = screen.getByRole("button", { name: /Done/ });
    expect(done).toHaveProperty("disabled", true);

    type(1, "Pizza");
    type(2, "Sushi");
    expect(done).toHaveProperty("disabled", false);
    expect(screen.getByText("Options: 2")).toBeTruthy();
  });

  it("adds a field on Enter and removes an empty one on Backspace", () => {
    renderStep();
    type(1, "Pizza");
    fireEvent.keyDown(field(1), { key: "Enter" });
    expect(document.activeElement).toBe(field(2));

    type(4, "Tacos");
    fireEvent.keyDown(field(4), { key: "Enter" });
    expect(fieldValues()).toEqual(["Pizza", "", "", "Tacos", ""]);
    expect(document.activeElement).toBe(field(5));

    fireEvent.keyDown(field(5), { key: "Backspace" });
    expect(fieldValues()).toEqual(["Pizza", "", "", "Tacos"]);
    expect(document.activeElement).toBe(field(4));
  });

  it("splits a pasted list into separate fields", () => {
    renderStep();
    type(1, "Anna");
    paste(2, "- Boris\n\nanna\n2. Vika\n");

    expect(fieldValues()).toEqual(["Anna", "Boris", "Vika"]);
    expect(document.activeElement).toBe(field(3));
  });

  it("marks repeats and leaves them out of the count", () => {
    renderStep();
    type(1, "Pizza");
    type(2, "pizza");

    expect(screen.getByText("Repeat")).toBeTruthy();
    expect(field(2).getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByText("Options: 1")).toBeTruthy();
  });

  it("removes a field with its × button", () => {
    renderStep();
    type(1, "Pizza");
    type(2, "Sushi");
    fireEvent.click(screen.getByRole("button", { name: "Remove Pizza" }));
    expect(fieldValues()).toEqual(["Sushi", "", ""]);
  });

  it("fills a quick set and resets to name placeholders", () => {
    renderStep();
    fireEvent.click(screen.getByRole("button", { name: "Yes / No" }));
    expect(fieldValues()).toEqual(["Yes", "No"]);

    fireEvent.click(screen.getByRole("button", { name: "Names" }));
    expect(fieldValues()).toEqual(["", "", "", ""]);
    expect(field(1).placeholder).toBe("Anna");
  });

  it("suggests no repeats for long lists and passes the choice on", async () => {
    const { onApply } = renderStep();
    paste(1, "A\nB\nC\nD\nE\nF\nG");
    expect(screen.queryByLabelText("No repeats — everyone once")).toBeNull();

    paste(7, "\nH");
    const toggle = screen.getByLabelText("No repeats — everyone once");
    expect(toggle).toHaveProperty("checked", true);

    fireEvent.click(screen.getByRole("button", { name: /Done/ }));
    await waitFor(() =>
      expect(onApply).toHaveBeenCalledWith(
        ["A", "B", "C", "D", "E", "F", "G", "H"],
        true,
      ),
    );
  });

  it("shows a server error and lets the host retry", async () => {
    renderStep(
      vi.fn().mockResolvedValue({ ok: false, error: "Достигнут лимит слотов" }),
    );
    type(1, "One");
    type(2, "Two");
    fireEvent.click(screen.getByRole("button", { name: /Done/ }));

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Done/ })).toHaveProperty(
      "disabled",
      false,
    );
  });

  it("skips straight to the invitation", () => {
    const { onSkip, onApply } = renderStep();
    fireEvent.click(screen.getByRole("button", { name: "Skip" }));
    expect(onSkip).toHaveBeenCalledOnce();
    expect(onApply).not.toHaveBeenCalled();
  });
});
