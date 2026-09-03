// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/shared/lib/i18n";
import { OptionChanceControl } from "./RoomPage";

describe("OptionChanceControl", () => {
  it("accepts a localized decimal chance", async () => {
    const updateChance = vi.fn().mockResolvedValue({ ok: true });
    render(
      <I18nProvider initialLocale="ru">
        <OptionChanceControl
          option={{ id: "pizza", label: "Пицца", position: 0, weight: 1 }}
          chance={20}
          maxChance={96}
          equalChance={20}
          disabled={false}
          updateChance={updateChance}
        />
      </I18nProvider>,
    );

    const toggle = screen.getByRole("button", {
      name: "Настроить шанс слота «Пицца»",
    });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(
      screen.queryByRole("textbox", { name: "Шанс слота «Пицца»: 20%" }),
    ).toBeNull();
    fireEvent.click(toggle);
    const collapse = screen.getByRole("button", {
      name: "Скрыть настройку шанса слота «Пицца»",
    });
    expect(collapse.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("Мин. 1%")).toBeTruthy();
    expect(screen.getByText("Макс. 96%")).toBeTruthy();

    const input = screen.getByRole("textbox", { name: "Шанс слота «Пицца»: 20%" });
    fireEvent.change(input, { target: { value: "27,5" } });
    fireEvent.blur(input);

    await waitFor(() => expect(updateChance).toHaveBeenCalledWith("pizza", 27.5));
    expect((input as HTMLInputElement).value).toBe("27,5");

    fireEvent.click(collapse);
    expect(
      screen
        .getByRole("button", { name: "Настроить шанс слота «Пицца»" })
        .getAttribute("aria-expanded"),
    ).toBe("false");
    expect(
      screen.queryByRole("textbox", { name: "Шанс слота «Пицца»: 20%" }),
    ).toBeNull();
  });

  it("resets an invalid value without sending it", () => {
    const updateChance = vi.fn();
    render(
      <I18nProvider>
        <OptionChanceControl
          option={{ id: "pizza", label: "Pizza", position: 0, weight: 1.5 }}
          chance={15.5}
          maxChance={96}
          equalChance={20}
          disabled={false}
          updateChance={updateChance}
        />
      </I18nProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Adjust chance for Pizza" }));
    const input = screen.getByRole("textbox", { name: "Chance for Pizza: 15.5%" });
    fireEvent.change(input, { target: { value: "96.1" } });
    fireEvent.blur(input);

    expect(updateChance).not.toHaveBeenCalled();
    expect((input as HTMLInputElement).value).toBe("15.5");
  });

  it("updates and commits the chance with the slider", async () => {
    const updateChance = vi.fn().mockResolvedValue({ ok: true });
    render(
      <I18nProvider>
        <OptionChanceControl
          option={{ id: "sushi", label: "Sushi", position: 1, weight: 1 }}
          chance={20}
          maxChance={96}
          equalChance={20}
          disabled={false}
          updateChance={updateChance}
        />
      </I18nProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Adjust chance for Sushi" }));
    const slider = screen.getByRole("slider", { name: "Chance for Sushi: 20%" });
    fireEvent.change(slider, { target: { value: "96" } });
    fireEvent.pointerUp(slider);

    await waitFor(() => expect(updateChance).toHaveBeenCalledWith("sushi", 96));
    expect(
      (
        screen.getByRole("textbox", {
          name: "Chance for Sushi: 20%",
        }) as HTMLInputElement
      ).value,
    ).toBe("96");
  });

  it("disables and collapses the chance editor for an excluded option", async () => {
    const updateChance = vi.fn();
    const renderControl = (excluded: boolean) => (
      <I18nProvider>
        <OptionChanceControl
          option={{ id: "quiz", label: "Quick quiz", position: 2, weight: 1, excluded }}
          chance={excluded ? 0 : 20}
          maxChance={96}
          equalChance={20}
          disabled={false}
          updateChance={updateChance}
        />
      </I18nProvider>
    );
    const { rerender } = render(renderControl(false));
    const toggle = screen.getByRole("button", { name: "Adjust chance for Quick quiz" });

    fireEvent.click(toggle);
    expect(
      screen
        .getByRole("button", { name: "Hide chance controls for Quick quiz" })
        .getAttribute("aria-expanded"),
    ).toBe("true");

    rerender(renderControl(true));

    const collapsedToggle = await screen.findByRole("button", {
      name: "Adjust chance for Quick quiz",
    });
    expect(collapsedToggle.getAttribute("aria-expanded")).toBe("false");
    expect((collapsedToggle as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(collapsedToggle);
    expect(collapsedToggle.getAttribute("aria-expanded")).toBe("false");
    expect(updateChance).not.toHaveBeenCalled();
  });
});
