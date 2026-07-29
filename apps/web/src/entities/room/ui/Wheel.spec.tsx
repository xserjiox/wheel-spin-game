// @vitest-environment jsdom

import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/shared/lib/i18n";
import type { ActiveSpin, Option } from "../model/types";
import { Wheel } from "./Wheel";

const options: Option[] = [
  { id: "pizza", label: "Pizza", position: 0 },
  { id: "sushi", label: "Sushi", position: 1 },
];

function mockCanvas(): void {
  const context = {
    arc: vi.fn(),
    beginPath: vi.fn(),
    clearRect: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    fillText: vi.fn(),
    moveTo: vi.fn(),
    restore: vi.fn(),
    rotate: vi.fn(),
    save: vi.fn(),
    setTransform: vi.fn(),
    stroke: vi.fn(),
    translate: vi.fn(),
    fillStyle: "",
    font: "",
    lineWidth: 1,
    strokeStyle: "",
    textAlign: "start",
    textBaseline: "alphabetic",
  } as unknown as CanvasRenderingContext2D;

  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context);
  vi.spyOn(HTMLCanvasElement.prototype, "clientWidth", "get").mockReturnValue(347);
}

describe("Wheel", () => {
  beforeEach(() => {
    mockCanvas();
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    });
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 1;
    });
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(private readonly callback: ResizeObserverCallback) {}

        observe(): void {
          this.callback(
            [{ contentRect: { width: 347 } } as ResizeObserverEntry],
            this as unknown as ResizeObserver,
          );
        }

        disconnect(): void {}
        unobserve(): void {}
      },
    );
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("uses the layout width instead of the transformed bounding box", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getBoundingClientRect").mockReturnValue({
      width: 473,
      height: 473,
    } as DOMRect);

    const { container } = render(
      <I18nProvider>
        <Wheel options={options} activeSpin={null} canSpin onSpin={() => {}} />
      </I18nProvider>,
    );

    const canvas = container.querySelector("canvas");
    expect(canvas?.width).toBe(347);
    expect(canvas?.height).toBe(347);
  });

  it("shows the result after the server clears the active spin", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-29T00:00:00.000Z"));
    const activeSpin: ActiveSpin = {
      id: "spin-1",
      optionsSnapshot: options,
      winnerIndex: 1,
      winnerLabel: "Sushi",
      startedAt: "2026-07-29T00:00:00.000Z",
      durationMs: 100,
      finalRotation: 1080,
    };

    const view = render(
      <I18nProvider>
        <Wheel
          options={options}
          activeSpin={activeSpin}
          canSpin={false}
          onSpin={() => {}}
        />
      </I18nProvider>,
    );

    view.rerender(
      <I18nProvider>
        <Wheel options={options} activeSpin={null} canSpin onSpin={() => {}} />
      </I18nProvider>,
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });

    expect(screen.getByRole("dialog", { name: "Winner" })).toBeTruthy();
    expect(screen.getByText("Sushi", { exact: true })).toBeTruthy();
  });
});
