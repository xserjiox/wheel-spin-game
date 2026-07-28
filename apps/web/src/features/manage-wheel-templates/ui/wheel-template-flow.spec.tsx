// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/shared/lib/i18n";
import { SaveWheelTemplate } from "./SaveWheelTemplate";
import { WheelTemplatePicker } from "./WheelTemplatePicker";

describe("wheel template flow", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

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

    const picker = screen.getByRole("combobox", { name: /Saved slots/ });
    const savedOption = screen.getByRole("option", {
      name: "Friday lunch · 2 slots",
    }) as HTMLOptionElement;
    fireEvent.change(picker, { target: { value: savedOption.value } });
    expect(onTemplateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        name: "Friday lunch",
        options: ["Pizza", "Sushi"],
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Rename" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Template name" }), {
      target: { value: "Dinner" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save name" }));
    expect(screen.getByRole("option", { name: "Dinner · 2 slots" })).toBeTruthy();

    vi.spyOn(window, "confirm").mockReturnValue(true);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.queryByRole("option", { name: "Dinner · 2 slots" })).toBeNull();
  });
});
