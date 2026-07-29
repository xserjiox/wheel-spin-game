// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
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
    vi.stubGlobal("PointerEvent", MouseEvent);
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
        <Wheel
          options={options}
          activeSpin={null}
          canSpin
          isHost
          connected
          onSpin={() => {}}
        />
      </I18nProvider>,
    );

    const canvas = container.querySelector("canvas");
    expect(canvas?.width).toBe(347);
    expect(canvas?.height).toBe(347);
  });

  it("shows guests a non-interactive center status", () => {
    const view = render(
      <I18nProvider>
        <Wheel
          options={options}
          activeSpin={null}
          canSpin={false}
          isHost={false}
          connected
          onSpin={() => {}}
        />
      </I18nProvider>,
    );

    expect(screen.getByRole("status", { name: "LEADER SPINS" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Start spin" })).toBeNull();

    view.rerender(
      <I18nProvider>
        <Wheel
          options={options}
          activeSpin={{
            id: "guest-spin",
            optionsSnapshot: options,
            winnerIndex: 0,
            winnerLabel: "Pizza",
            startedAt: new Date(Date.now() + 10_000).toISOString(),
            durationMs: 100,
            finalRotation: 1080,
          }}
          canSpin={false}
          isHost={false}
          connected
          onSpin={() => {}}
        />
      </I18nProvider>,
    );

    expect(screen.getByRole("status", { name: "SPINNING" })).toBeTruthy();

    view.rerender(
      <I18nProvider>
        <Wheel
          options={options}
          activeSpin={null}
          canSpin={false}
          isHost={false}
          connected={false}
          onSpin={() => {}}
        />
      </I18nProvider>,
    );

    expect(screen.getByRole("status", { name: "LOADING" })).toBeTruthy();
  });

  it("lets an authorized guest start the wheel", () => {
    const onSpin = vi.fn();

    render(
      <I18nProvider>
        <Wheel
          options={options}
          activeSpin={null}
          canSpin
          canControlSpin
          isHost={false}
          connected
          onSpin={onSpin}
        />
      </I18nProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Start spin" }));

    expect(onSpin).toHaveBeenCalledOnce();
  });

  it("shows the complete option label when a wheel segment is hovered", () => {
    const longLabel =
      "A complete option name that is intentionally longer than its wheel label";
    const { container } = render(
      <I18nProvider>
        <Wheel
          options={[{ ...options[0], label: longLabel }, options[1]]}
          activeSpin={null}
          canSpin
          isHost
          connected
          onSpin={() => {}}
        />
      </I18nProvider>,
    );
    const stage = container.querySelector(".wheel-stage");
    const canvas = container.querySelector("canvas");
    vi.spyOn(stage as HTMLElement, "getBoundingClientRect").mockReturnValue({
      left: 0,
      top: 0,
      right: 347,
      bottom: 347,
      width: 347,
      height: 347,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    fireEvent.pointerMove(canvas as HTMLCanvasElement, {
      clientX: 327,
      clientY: 173.5,
    });

    expect(screen.getByRole("tooltip").textContent).toBe(longLabel);
  });

  it("replaces the host button with an opaque status while unavailable", () => {
    const activeSpin: ActiveSpin = {
      id: "host-spin",
      optionsSnapshot: options,
      winnerIndex: 0,
      winnerLabel: "Pizza",
      startedAt: new Date(Date.now() + 10_000).toISOString(),
      durationMs: 100,
      finalRotation: 1080,
    };
    const view = render(
      <I18nProvider>
        <Wheel
          options={options}
          activeSpin={activeSpin}
          canSpin={false}
          isHost
          connected
          onSpin={() => {}}
        />
      </I18nProvider>,
    );

    expect(screen.getByRole("status", { name: "SPINNING" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Start spin" })).toBeNull();

    view.rerender(
      <I18nProvider>
        <Wheel
          options={options}
          activeSpin={null}
          canSpin={false}
          isHost
          connected
          onSpin={() => {}}
        />
      </I18nProvider>,
    );

    expect(
      (screen.getByRole("button", { name: "Start spin" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
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
          canceledSpinId={null}
          canSpin={false}
          isHost
          connected
          onSpin={() => {}}
        />
      </I18nProvider>,
    );

    view.rerender(
      <I18nProvider>
        <Wheel
          options={options}
          activeSpin={null}
          canSpin
          isHost
          connected
          onSpin={() => {}}
        />
      </I18nProvider>,
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });

    expect(screen.getByRole("dialog", { name: "Winner" })).toBeTruthy();
    expect(screen.getByText("Sushi", { exact: true })).toBeTruthy();
  });

  it("skips a stale animation when a hidden tab returns after the spin", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-29T00:00:00.000Z"));
    let delayedFrame: FrameRequestCallback | null = null;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      delayedFrame = callback;
      return 17;
    });
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden",
    });

    const { container } = render(
      <I18nProvider>
        <Wheel
          options={options}
          activeSpin={{
            id: "background-spin",
            optionsSnapshot: options,
            winnerIndex: 1,
            winnerLabel: "Sushi",
            startedAt: "2026-07-29T00:00:00.000Z",
            durationMs: 1_000,
            finalRotation: 1440,
          }}
          canSpin={false}
          isHost={false}
          connected
          onSpin={() => {}}
        />
      </I18nProvider>,
    );

    expect(delayedFrame).not.toBeNull();
    await act(async () => {
      vi.setSystemTime(new Date("2026-07-29T00:00:02.000Z"));
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        value: "visible",
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });

    const wheel = container.querySelector(".wheel-wrap") as HTMLElement;
    expect(wheel.style.transition).toBe("none");
    expect(wheel.style.transform).toBe("rotate(1440deg)");
    expect(screen.getByRole("dialog", { name: "Winner" })).toBeTruthy();
    expect(screen.getByText("Sushi", { exact: true })).toBeTruthy();
  });

  it("does not replay a completed spin after its result was dismissed", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-29T00:00:02.000Z"));
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });

    render(
      <I18nProvider>
        <Wheel
          options={options}
          activeSpin={{
            id: "already-finished-spin",
            optionsSnapshot: options,
            winnerIndex: 0,
            winnerLabel: "Pizza",
            startedAt: "2026-07-29T00:00:00.000Z",
            durationMs: 1_000,
            finalRotation: 1080,
          }}
          canSpin={false}
          isHost={false}
          connected
          onSpin={() => {}}
        />
      </I18nProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Close result" }));
    expect(screen.queryByRole("dialog", { name: "Winner" })).toBeNull();

    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(screen.queryByRole("dialog", { name: "Winner" })).toBeNull();
  });

  it("moves focus into the result dialog and closes it with Escape", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-29T00:00:00.000Z"));
    const activeSpin: ActiveSpin = {
      id: "spin-2",
      optionsSnapshot: options,
      winnerIndex: 0,
      winnerLabel: "Pizza",
      startedAt: "2026-07-29T00:00:00.000Z",
      durationMs: 100,
      finalRotation: 1080,
    };

    render(
      <I18nProvider>
        <Wheel
          options={options}
          activeSpin={activeSpin}
          canSpin={false}
          isHost
          connected
          onSpin={() => {}}
        />
      </I18nProvider>,
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });

    const closeButton = screen.getByRole("button", { name: "Close result" });
    expect(document.activeElement).toBe(closeButton);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("dialog", { name: "Winner" })).toBeNull();
    expect(document.body.style.overflow).toBe("");
  });

  it("does not show a winner after an active spin is canceled", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-29T00:00:00.000Z"));
    const activeSpin: ActiveSpin = {
      id: "spin-canceled",
      optionsSnapshot: options,
      winnerIndex: 0,
      winnerLabel: "Pizza",
      startedAt: "2026-07-29T00:00:00.000Z",
      durationMs: 10_000,
      finalRotation: 2160,
    };

    const view = render(
      <I18nProvider>
        <Wheel
          options={options}
          activeSpin={activeSpin}
          canSpin={false}
          isHost
          connected
          onSpin={() => {}}
        />
      </I18nProvider>,
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1_000);
    });
    view.rerender(
      <I18nProvider>
        <Wheel
          options={options}
          activeSpin={null}
          canceledSpinId="spin-canceled"
          canSpin
          isHost
          connected
          onSpin={() => {}}
        />
      </I18nProvider>,
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(12_000);
    });

    expect(screen.queryByRole("dialog", { name: "Winner" })).toBeNull();
  });
});
