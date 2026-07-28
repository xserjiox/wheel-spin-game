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
  canSpin,
  onSpin,
}: {
  options: Option[];
  activeSpin: ActiveSpin | null;
  canSpin: boolean;
  onSpin: () => void;
}) {
  const { t } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const handledSpin = useRef<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [transition, setTransition] = useState("none");
  const [winner, setWinner] = useState("");
  const visibleOptions = activeSpin?.optionsSnapshot ?? options;
  const emptyLabel = t("addOptions");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const draw = () => drawWheel(canvas, visibleOptions, emptyLabel);
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    document.fonts?.ready.then(draw);
    return () => observer.disconnect();
  }, [emptyLabel, visibleOptions]);

  useEffect(() => {
    if (!activeSpin || handledSpin.current === activeSpin.id) return;
    handledSpin.current = activeSpin.id;
    setWinner("");
    const startAt = new Date(activeSpin.startedAt).getTime();
    const endAt = startAt + activeSpin.durationMs;
    const beginIn = Math.max(0, startAt - Date.now());
    const remaining = Math.max(0, endAt - Math.max(Date.now(), startAt));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let finishTimer = 0;
    const beginTimer = window.setTimeout(() => {
      setTransition(
        reduced ? "none" : `transform ${remaining}ms cubic-bezier(0.12, 0.72, 0.08, 1)`,
      );
      requestAnimationFrame(() => setRotation(activeSpin.finalRotation));
      finishTimer = window.setTimeout(() => {
        setWinner(activeSpin.winnerLabel);
      }, remaining + 40);
    }, beginIn);
    return () => {
      clearTimeout(beginTimer);
      clearTimeout(finishTimer);
    };
  }, [activeSpin?.id]);

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
          className="result-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="result-title"
        >
          <button
            className="modal-backdrop"
            aria-label={t("closeResult")}
            onClick={() => setWinner("")}
          />
          <Confetti />
          <div className="result-card">
            <button className="modal-close" type="button" onClick={() => setWinner("")}>
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

function drawWheel(
  canvas: HTMLCanvasElement,
  options: Option[],
  emptyLabel: string,
): void {
  const rect = canvas.getBoundingClientRect();
  const size = Math.max(260, Math.round(rect.width || 570));
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = size * ratio;
  canvas.height = size * ratio;
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
    const fontSize = Math.max(8, Math.min(15, size * 0.035, arc * radius * 0.19));
    const maxLength = options.length > 12 ? 12 : 20;
    const label =
      option.label.length > maxLength
        ? `${option.label.slice(0, maxLength - 1)}…`
        : option.label;
    context.save();
    context.translate(center, center);
    context.rotate(angle);
    context.textAlign = "right";
    context.textBaseline = "middle";
    context.fillStyle = "#1d211b";
    context.font = `800 ${fontSize}px Manrope, sans-serif`;
    context.fillText(label, radius * 0.83, 0, radius * 0.6);
    context.restore();
  });
}
