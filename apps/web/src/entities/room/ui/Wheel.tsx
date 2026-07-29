import { useEffect, useRef, useState } from "react";
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

export function Wheel({
  options,
  activeSpin,
  canceledSpinId,
  canSpin,
  onSpin,
}: {
  options: Option[];
  activeSpin: ActiveSpin | null;
  canceledSpinId?: string | null;
  canSpin: boolean;
  onSpin: () => void;
}) {
  const { t } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const handledSpin = useRef<string | null>(null);
  const beginTimer = useRef<number | null>(null);
  const finishTimer = useRef<number | null>(null);
  const [rotation, setRotation] = useState(0);
  const [transition, setTransition] = useState("none");
  const [winner, setWinner] = useState("");
  const visibleOptions = activeSpin?.optionsSnapshot ?? options;
  const emptyLabel = t("addOptions");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const draw = (layoutWidth = canvas.clientWidth) =>
      drawWheel(canvas, visibleOptions, emptyLabel, layoutWidth);
    draw();
    const observer = new ResizeObserver(([entry]) => {
      draw(entry?.contentRect.width);
    });
    observer.observe(canvas);
    document.fonts?.ready.then(() => draw());
    return () => observer.disconnect();
  }, [emptyLabel, visibleOptions]);

  useEffect(() => {
    if (!activeSpin) return;
    if (handledSpin.current === activeSpin.id) return;
    if (beginTimer.current !== null) clearTimeout(beginTimer.current);
    if (finishTimer.current !== null) clearTimeout(finishTimer.current);
    handledSpin.current = activeSpin.id;
    setWinner("");
    const startAt = new Date(activeSpin.startedAt).getTime();
    const endAt = startAt + activeSpin.durationMs;
    const beginIn = Math.max(0, startAt - Date.now());
    const remaining = Math.max(0, endAt - Math.max(Date.now(), startAt));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    beginTimer.current = window.setTimeout(() => {
      setTransition(
        reduced ? "none" : `transform ${remaining}ms cubic-bezier(0.12, 0.72, 0.08, 1)`,
      );
      requestAnimationFrame(() => setRotation(activeSpin.finalRotation));
      finishTimer.current = window.setTimeout(() => {
        setWinner(activeSpin.winnerLabel);
        finishTimer.current = null;
      }, remaining + 40);
      beginTimer.current = null;
    }, beginIn);
  }, [activeSpin?.id]);

  useEffect(() => {
    if (!canceledSpinId || handledSpin.current !== canceledSpinId) return;
    if (beginTimer.current !== null) clearTimeout(beginTimer.current);
    if (finishTimer.current !== null) clearTimeout(finishTimer.current);
    beginTimer.current = null;
    finishTimer.current = null;
    handledSpin.current = null;
    setWinner("");
    setRotation((current) => readRenderedRotation(wrapRef.current, current));
    setTransition("none");
  }, [canceledSpinId]);

  useEffect(
    () => () => {
      if (beginTimer.current !== null) clearTimeout(beginTimer.current);
      if (finishTimer.current !== null) clearTimeout(finishTimer.current);
    },
    [],
  );

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
      <div className="wheel-stage">
        <div className="pointer" aria-hidden="true" />
        <div
          ref={wrapRef}
          className="wheel-wrap"
          style={{ transform: `rotate(${rotation}deg)`, transition }}
        >
          <canvas ref={canvasRef} aria-label={t("wheelAria")} />
        </div>
        <button
          className="spin-center"
          type="button"
          aria-label={canSpin ? t("startSpin") : t("hostStarts")}
          disabled={!canSpin}
          onClick={onSpin}
        >
          <span>{canSpin ? t("spinAction") : t("wait")}</span>
        </button>
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
    const fontSize = Math.max(8, Math.min(15, size * 0.035, arc * radius * 0.19));
    const maxLength = options.length > 12 ? 12 : 20;
    const label =
      option.label.length > maxLength
        ? `${option.label.slice(0, maxLength - 1)}…`
        : option.label;
    context.save();
    context.translate(center, center);
    context.rotate(angle + (flipLabel ? Math.PI : 0));
    context.textAlign = flipLabel ? "left" : "right";
    context.textBaseline = "middle";
    context.fillStyle = "#1d211b";
    context.font = `800 ${fontSize}px Manrope, sans-serif`;
    context.fillText(label, (flipLabel ? -1 : 1) * radius * 0.83, 0, radius * 0.6);
    context.restore();
  });
}
