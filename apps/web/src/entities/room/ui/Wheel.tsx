import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useI18n } from "@/shared/lib/i18n";
import { Confetti } from "@/shared/ui/confetti";
import type { ActiveSpin, Option } from "../model/types";

const COLORS = [
  "#ff7957",
  "#826ff2",
  "#f7c84b",
  "#63b9e8",
  "#68c99c",
  "#ef8eae",
  "#d7ff44",
];

type OptionTooltip = {
  label: string;
  left: number;
  top: number;
};

export function Wheel({
  options,
  activeSpin,
  canceledSpinId,
  canSpin,
  isHost,
  canControlSpin = isHost,
  connected,
  onSpin,
}: {
  options: Option[];
  activeSpin: ActiveSpin | null;
  canceledSpinId?: string | null;
  canSpin: boolean;
  canControlSpin?: boolean;
  isHost: boolean;
  connected: boolean;
  onSpin: () => void;
}) {
  const { t } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLElement | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const handledSpin = useRef<string | null>(null);
  const revealedSpin = useRef<string | null>(null);
  const currentSpin = useRef<ActiveSpin | null>(null);
  const beginTimer = useRef<number | null>(null);
  const finishTimer = useRef<number | null>(null);
  const animationFrame = useRef<number | null>(null);
  const syncCurrentSpin = useRef<() => void>(() => {});
  const [rotation, setRotation] = useState(0);
  const [transition, setTransition] = useState("none");
  const [winner, setWinner] = useState("");
  const [optionTooltip, setOptionTooltip] = useState<OptionTooltip | null>(null);
  const setCenterRef = useCallback((element: HTMLElement | null) => {
    centerRef.current = element;
  }, []);
  const visibleOptions = activeSpin?.optionsSnapshot ?? options;
  const emptyLabel = t("addOptions");
  const centerStatusLabel = !connected
    ? t("loadingCenter")
    : activeSpin
      ? t("spinningCenter")
      : canControlSpin
        ? null
        : t("hostSpins");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const draw = () =>
      drawWheel(
        canvas,
        visibleOptions,
        emptyLabel,
        canvas.clientWidth,
        centerRef.current?.offsetWidth ?? 0,
      );
    draw();
    const observer = new ResizeObserver(() => {
      draw();
    });
    observer.observe(canvas);
    if (centerRef.current) observer.observe(centerRef.current);
    document.fonts?.ready.then(() => draw());
    return () => observer.disconnect();
  }, [emptyLabel, visibleOptions]);

  const showOptionTooltip = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const stage = stageRef.current;
    if (!stage || !visibleOptions.length || activeSpin) {
      setOptionTooltip(null);
      return;
    }
    if (!Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) {
      setOptionTooltip(null);
      return;
    }

    const bounds = stage.getBoundingClientRect();
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;
    const x = event.clientX - centerX;
    const y = event.clientY - centerY;
    const radius = Math.min(bounds.width, bounds.height) / 2;
    if (Math.hypot(x, y) > radius) {
      setOptionTooltip(null);
      return;
    }

    const renderedRotation =
      (readRenderedRotation(wrapRef.current, rotation) * Math.PI) / 180;
    const unrotatedAngle = Math.atan2(y, x) - renderedRotation;
    const angleFromTop =
      (((unrotatedAngle + Math.PI / 2) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const optionIndex = Math.min(
      visibleOptions.length - 1,
      Math.floor(angleFromTop / ((Math.PI * 2) / visibleOptions.length)),
    );
    const hoveredOption = visibleOptions[optionIndex];
    if (!hoveredOption) {
      setOptionTooltip(null);
      return;
    }
    const tooltipHalfWidth = Math.min(120, bounds.width / 2 - 12);
    const localX = event.clientX - bounds.left;
    const localY = event.clientY - bounds.top;

    setOptionTooltip({
      label: hoveredOption.label,
      left: Math.max(
        tooltipHalfWidth,
        Math.min(bounds.width - tooltipHalfWidth, localX),
      ),
      top: Math.max(64, Math.min(bounds.height - 12, localY - 12)),
    });
  };

  const clearSpinSchedule = useCallback(() => {
    if (beginTimer.current !== null) clearTimeout(beginTimer.current);
    if (finishTimer.current !== null) clearTimeout(finishTimer.current);
    if (animationFrame.current !== null) {
      cancelAnimationFrame(animationFrame.current);
    }
    beginTimer.current = null;
    finishTimer.current = null;
    animationFrame.current = null;
  }, []);

  const revealSpinResult = useCallback(
    (spin: ActiveSpin) => {
      clearSpinSchedule();
      setTransition("none");
      setRotation(spin.finalRotation);
      if (revealedSpin.current === spin.id) return;
      revealedSpin.current = spin.id;
      setWinner(spin.winnerLabel);
    },
    [clearSpinSchedule],
  );

  const synchronizeSpin = useCallback(
    (spin: ActiveSpin) => {
      clearSpinSchedule();
      const startAt = new Date(spin.startedAt).getTime();
      const endAt = startAt + spin.durationMs;
      const now = Date.now();

      if (now < startAt) {
        beginTimer.current = window.setTimeout(
          () => syncCurrentSpin.current(),
          startAt - now,
        );
        return;
      }

      const remaining = endAt - now;
      if (remaining <= 0) {
        revealSpinResult(spin);
        return;
      }

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setTransition(
        reduced ? "none" : `transform ${remaining}ms cubic-bezier(0.12, 0.72, 0.08, 1)`,
      );
      animationFrame.current = window.requestAnimationFrame(() => {
        animationFrame.current = null;
        const latestSpin = currentSpin.current;
        if (!latestSpin || latestSpin.id !== spin.id) return;

        const frameRemaining = endAt - Date.now();
        if (frameRemaining <= 0) {
          revealSpinResult(latestSpin);
          return;
        }

        setTransition(
          reduced
            ? "none"
            : `transform ${frameRemaining}ms cubic-bezier(0.12, 0.72, 0.08, 1)`,
        );
        setRotation(latestSpin.finalRotation);
        finishTimer.current = window.setTimeout(() => {
          const finishedSpin = currentSpin.current;
          if (finishedSpin?.id === spin.id) revealSpinResult(finishedSpin);
        }, frameRemaining + 40);
      });
    },
    [clearSpinSchedule, revealSpinResult],
  );

  syncCurrentSpin.current = () => {
    const spin = currentSpin.current;
    if (spin) synchronizeSpin(spin);
  };

  useEffect(() => {
    if (!activeSpin) return;
    if (handledSpin.current === activeSpin.id) return;
    clearSpinSchedule();
    currentSpin.current = activeSpin;
    handledSpin.current = activeSpin.id;
    setWinner("");
    synchronizeSpin(activeSpin);
  }, [activeSpin, clearSpinSchedule, synchronizeSpin]);

  useEffect(() => {
    if (!canceledSpinId || handledSpin.current !== canceledSpinId) return;
    clearSpinSchedule();
    currentSpin.current = null;
    handledSpin.current = null;
    setWinner("");
    setRotation((current) => readRenderedRotation(wrapRef.current, current));
    setTransition("none");
  }, [canceledSpinId, clearSpinSchedule]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") syncCurrentSpin.current();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearSpinSchedule();
    };
  }, [clearSpinSchedule]);

  useEffect(() => {
    if (!winner) return;

    const modal = modalRef.current;
    const previousBodyOverflow = document.body.style.overflow;
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";

    const focusFrame = window.requestAnimationFrame(() =>
      closeButtonRef.current?.focus(),
    );
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setWinner("");
        return;
      }

      if (event.key !== "Tab" || !modal) return;

      const focusableElements = Array.from(
        modal.querySelectorAll<HTMLElement>(
          'button:not([disabled]):not([tabindex="-1"]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);
      if (!firstElement || !lastElement) return;

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === lastElement ||
          !modal.contains(document.activeElement))
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
    };
  }, [winner]);

  return (
    <>
      <div className="wheel-stage" ref={stageRef}>
        <div className="pointer" aria-hidden="true" />
        <div
          ref={wrapRef}
          className="wheel-wrap"
          style={{ transform: `rotate(${rotation}deg)`, transition }}
        >
          <canvas
            ref={canvasRef}
            aria-label={t("wheelAria")}
            onPointerMove={showOptionTooltip}
            onPointerLeave={() => setOptionTooltip(null)}
          />
        </div>
        {optionTooltip && (
          <div
            className="wheel-option-tooltip"
            role="tooltip"
            style={{ left: optionTooltip.left, top: optionTooltip.top }}
          >
            {optionTooltip.label}
          </div>
        )}
        {centerStatusLabel ? (
          <div
            ref={setCenterRef}
            className={`spin-center wheel-center-status ${activeSpin ? "spinning" : ""} ${!connected ? "reconnecting" : ""}`}
            role="status"
            aria-live="polite"
            aria-label={centerStatusLabel}
          >
            <span className="wheel-center-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M19 8a8 8 0 1 0 1 7" />
                <path d="M19 3v5h-5" />
              </svg>
            </span>
            <span>{centerStatusLabel}</span>
          </div>
        ) : (
          <button
            ref={setCenterRef}
            className="spin-center"
            type="button"
            aria-label={t("startSpin")}
            disabled={!canSpin}
            onClick={onSpin}
          >
            <span>{t("spinAction")}</span>
          </button>
        )}
      </div>
      {winner && (
        <div
          ref={modalRef}
          className="result-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="result-title"
        >
          <button
            className="modal-backdrop"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setWinner("")}
          />
          <Confetti />
          <div className="result-card">
            <button
              ref={closeButtonRef}
              className="modal-close"
              type="button"
              aria-label={t("closeResult")}
              onClick={() => setWinner("")}
            >
              ×
            </button>
            <p className="eyebrow">{t("wheelPicked")}</p>
            <div className="result-spark" aria-hidden="true">
              ✦
            </div>
            <h2 id="result-title">{t("winner")}</h2>
            <p className="result-name">{winner}</p>
            <button className="secondary-button" onClick={() => setWinner("")}>
              {t("returnRoom")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function readRenderedRotation(element: HTMLElement | null, fallback: number): number {
  if (!element) return fallback % 360;
  const transform = window.getComputedStyle(element).transform;
  const match = transform.match(/^matrix(?:3d)?\(([^)]+)\)$/);
  if (!match) return fallback % 360;
  const values = match[1].split(",").map(Number);
  const a = values[0];
  const b = values[1];
  if (!Number.isFinite(a) || !Number.isFinite(b)) return fallback % 360;
  return (Math.atan2(b, a) * 180) / Math.PI;
}

function drawWheel(
  canvas: HTMLCanvasElement,
  options: Option[],
  emptyLabel: string,
  layoutWidth: number,
  centerSize: number,
): void {
  const size = Math.max(260, Math.round(layoutWidth || canvas.clientWidth || 570));
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const pixelSize = Math.round(size * ratio);
  if (canvas.width !== pixelSize || canvas.height !== pixelSize) {
    canvas.width = pixelSize;
    canvas.height = pixelSize;
  }
  const context = canvas.getContext("2d");
  if (!context) return;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, size, size);
  const center = size / 2;
  const radius = center;

  if (!options.length) {
    context.beginPath();
    context.arc(center, center, radius, 0, Math.PI * 2);
    context.fillStyle = "#e5e1d8";
    context.fill();
    context.fillStyle = "#767970";
    context.font = `700 ${Math.max(13, size * 0.032)}px Manrope, sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(emptyLabel, center, center - radius * 0.27);
    return;
  }

  const arc = (Math.PI * 2) / options.length;
  const outerLabelRadius = radius * 0.83;
  const fallbackCenterSize = size <= 470 ? 86 : 108;
  const centerRadius = (centerSize || fallbackCenterSize) / 2;
  const centerGap = Math.max(8, Math.min(12, size * 0.02));
  const maxLabelWidth = Math.max(24, outerLabelRadius - centerRadius - centerGap);
  options.forEach((option, index) => {
    const start = -Math.PI / 2 + index * arc;
    const end = start + arc;
    context.beginPath();
    context.moveTo(center, center);
    context.arc(center, center, radius, start, end);
    context.closePath();
    context.fillStyle = COLORS[index % COLORS.length];
    context.fill();
    context.strokeStyle = "#1d211b";
    context.lineWidth = Math.max(1, size * 0.003);
    context.stroke();

    const angle = -Math.PI / 2 + (index + 0.5) * arc;
    const normalizedAngle = (angle + Math.PI * 2) % (Math.PI * 2);
    const flipLabel =
      normalizedAngle > Math.PI / 2 && normalizedAngle < (Math.PI * 3) / 2;
    const preferredFontSize = Math.max(
      8,
      Math.min(15, size * 0.035, arc * radius * 0.19),
    );
    const labelCharacters = Array.from(option.label);
    const maxLength = options.length > 12 ? 12 : 20;
    const shortenedLabel =
      labelCharacters.length > maxLength
        ? `${labelCharacters
            .slice(0, maxLength - 1)
            .join("")
            .trimEnd()}…`
        : option.label;
    context.save();
    context.translate(center, center);
    context.rotate(angle + (flipLabel ? Math.PI : 0));
    context.textAlign = flipLabel ? "left" : "right";
    context.textBaseline = "middle";
    context.fillStyle = "#1d211b";
    const fittedLabel = fitWheelLabel(
      context,
      shortenedLabel,
      preferredFontSize,
      maxLabelWidth,
    );
    context.font = wheelLabelFont(fittedLabel.fontSize);
    context.fillText(fittedLabel.text, (flipLabel ? -1 : 1) * outerLabelRadius, 0);
    context.restore();
  });
}

function fitWheelLabel(
  context: CanvasRenderingContext2D,
  label: string,
  preferredFontSize: number,
  maxWidth: number,
): { text: string; fontSize: number } {
  let fontSize = preferredFontSize;
  context.font = wheelLabelFont(fontSize);

  while (fontSize > 8 && context.measureText(label).width > maxWidth) {
    fontSize = Math.max(8, fontSize - 0.5);
    context.font = wheelLabelFont(fontSize);
  }

  if (context.measureText(label).width <= maxWidth) {
    return { text: label, fontSize };
  }

  const characters = Array.from(label);
  const ellipsis = "…";
  while (characters.length > 1) {
    characters.pop();
    const candidate = `${characters.join("").trimEnd()}${ellipsis}`;
    if (context.measureText(candidate).width <= maxWidth) {
      return { text: candidate, fontSize };
    }
  }

  return { text: ellipsis, fontSize };
}

function wheelLabelFont(size: number): string {
  return `800 ${size}px Manrope, sans-serif`;
}
