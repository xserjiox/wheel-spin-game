// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/shared/lib/i18n";
import { SaveWheelTemplate } from "./SaveWheelTemplate";
import { WheelTemplatePicker } from "./WheelTemplatePicker";

describe("wheel template flow", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => cleanup());

  it("saves, selects, renames, and deletes a local template", () => {
    const onStatus = vi.fn();
    const saveView = render(
      <I18nProvider>
        <SaveWheelTemplate
          title="Friday lunch"
          options={["Pizza", "Sushi"]}
          onStatus={onStatus}
        />
      </I18nProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Save slots" }));
    fireEvent.click(screen.getByRole("button", { name: "Save template" }));
    expect(onStatus).toHaveBeenCalledWith("Template “Friday lunch” saved");
    saveView.unmount();

    const onTemplateChange = vi.fn();
    render(
      <I18nProvider>
        <WheelTemplatePicker onTemplateChange={onTemplateChange} />
      </I18nProvider>,
    );

    fireEvent.click(screen.getByRole("tab", { name: /My templates/ }));
    const savedOption = screen.getByRole("button", {
      name: /Friday lunch 2 choices/,
    });
    fireEvent.click(savedOption);
    expect(onTemplateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        name: "Friday lunch",
        options: ["Pizza", "Sushi"],
        selectionMode: "REPEAT",
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Rename" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Template name" }), {
      target: { value: "Dinner" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save name" }));
    expect(screen.getByRole("button", { name: /Dinner 2 choices/ })).toBeTruthy();

    vi.spyOn(window, "confirm").mockReturnValue(true);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.queryByRole("button", { name: /Dinner 2 choices/ })).toBeNull();
  });

  it("applies a localized ready scenario with its recommended mode", () => {
    const onTemplateChange = vi.fn();
    render(
      <I18nProvider>
        <WheelTemplatePicker onTemplateChange={onTemplateChange} />
      </I18nProvider>,
    );

    fireEvent.click(screen.getByRole("tab", { name: "Scenarios" }));
    fireEvent.click(screen.getByRole("button", { name: /Icebreaker questions/ }));

    expect(onTemplateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        source: "preset",
        roomTitle: "Icebreaker questions",
        selectionMode: "ELIMINATION",
      }),
    );
  });
});
