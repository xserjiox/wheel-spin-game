// @vitest-environment jsdom

import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/shared/lib/i18n";
import { SpinControls } from "./SpinControls";

function Harness({
  isSpinning = false,
  onSpin = () => {},
  onCancel = () => {},
}: {
  isSpinning?: boolean;
  onSpin?: () => void;
  onCancel?: () => void;
}) {
  const [duration, setDuration] = useState("20");
  return (
    <I18nProvider>
      <SpinControls
        duration={duration}
        isSpinning={isSpinning}
        connected
        hasEnoughOptions
        setDuration={setDuration}
        onSpin={onSpin}
        onCancel={onCancel}
      />
    </I18nProvider>
  );
}

describe("SpinControls", () => {
  afterEach(cleanup);

  it("accepts a custom duration within the supported range", () => {
    render(<Harness />);

    const input = screen.getByRole("spinbutton", { name: "Custom time" });
    fireEvent.change(input, { target: { value: "45" } });

    expect((input as HTMLInputElement).value).toBe("45");
    expect(input.getAttribute("aria-invalid")).toBe("false");
    expect(
      (screen.getByRole("button", { name: "Start wheel" }) as HTMLButtonElement)
        .disabled,
    ).toBe(false);
  });

  it("shows a host cancellation action while the wheel is spinning", () => {
    const onCancel = vi.fn();
    render(<Harness isSpinning onCancel={onCancel} />);

    fireEvent.click(screen.getByRole("button", { name: "Stop & cancel" }));

    expect(onCancel).toHaveBeenCalledOnce();
    expect(screen.queryByRole("button", { name: "Start wheel" })).toBeNull();
  });
});
