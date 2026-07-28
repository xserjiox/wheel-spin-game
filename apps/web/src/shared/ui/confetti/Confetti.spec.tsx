// @vitest-environment jsdom

import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Confetti } from "./Confetti";

function mockReducedMotion(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockReturnValue({
      matches,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
}

describe("Confetti", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not animate when reduced motion is requested", () => {
    mockReducedMotion(true);
    const requestFrame = vi.spyOn(window, "requestAnimationFrame");

    const { container } = render(<Confetti />);

    expect(container.querySelector("canvas")).toBeTruthy();
    expect(requestFrame).not.toHaveBeenCalled();
  });

  it("starts and cleans up its animation frame", () => {
    mockReducedMotion(false);
    const context = {
      setTransform: vi.fn(),
      clearRect: vi.fn(),
      save: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      fillRect: vi.fn(),
      restore: vi.fn(),
      globalAlpha: 1,
      fillStyle: "",
    } as unknown as CanvasRenderingContext2D;
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context);
    const requestFrame = vi.spyOn(window, "requestAnimationFrame").mockReturnValue(42);
    const cancelFrame = vi.spyOn(window, "cancelAnimationFrame");

    const view = render(<Confetti particleCount={20} />);

    expect(requestFrame).toHaveBeenCalledOnce();
    expect(context.setTransform).toHaveBeenCalled();
    view.unmount();
    expect(cancelFrame).toHaveBeenCalledWith(42);
    expect(context.clearRect).toHaveBeenCalled();
  });
});
