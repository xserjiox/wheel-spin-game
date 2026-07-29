import { useId } from "react";
import { useI18n } from "@/shared/lib/i18n";

const MIN_DURATION_SECONDS = 5;
const MAX_DURATION_SECONDS = 120;
const PRESET_DURATIONS = [10, 20, 30];

export function SpinControls({
  duration,
  isSpinning,
  connected,
  hasEnoughOptions,
  setDuration,
  onSpin,
  onCancel,
}: {
  duration: string;
  isSpinning: boolean;
  connected: boolean;
  hasEnoughOptions: boolean;
  setDuration: (duration: string) => void;
  onSpin: () => void;
  onCancel: () => void;
}) {
  const { t } = useI18n();
  const durationHintId = useId();
  const durationSeconds = Number(duration);
  const durationIsValid =
    /^\d+$/.test(duration) &&
    Number.isInteger(durationSeconds) &&
    durationSeconds >= MIN_DURATION_SECONDS &&
    durationSeconds <= MAX_DURATION_SECONDS;

  return (
    <>
      <section className="duration-section">
        <div className="duration-heading">
          <h2>{t("spinDuration")}</h2>
          <p>{t("durationDescription")}</p>
        </div>
        <div className="duration-controls">
          <div className="time-presets">
            {PRESET_DURATIONS.map((value) => (
              <button
                key={value}
                className={
                  duration === String(value) ? "time-chip active" : "time-chip"
                }
                type="button"
                onClick={() => setDuration(String(value))}
                disabled={isSpinning}
              >
                {t("seconds", { value })}
              </button>
            ))}
          </div>
          <label className={`custom-duration ${durationIsValid ? "" : "invalid"}`}>
            <span className="custom-duration-copy">
              <strong>{t("customTime")}</strong>
              <small id={durationHintId}>{t("durationRange")}</small>
            </span>
            <span className="custom-duration-input">
              <input
                type="number"
                inputMode="numeric"
                min={MIN_DURATION_SECONDS}
                max={MAX_DURATION_SECONDS}
                step={1}
                value={duration}
                disabled={isSpinning}
                aria-label={t("customTime")}
                aria-invalid={!durationIsValid}
                aria-describedby={durationHintId}
                onChange={(event) => setDuration(event.target.value)}
              />
              <span>{t("secondsShort")}</span>
            </span>
          </label>
        </div>
      </section>

      {isSpinning ? (
        <button
          className="cancel-spin-button"
          type="button"
          disabled={!connected}
          onClick={onCancel}
        >
          <span>{t("stopSpin")}</span>
          <span className="cancel-spin-symbol" aria-hidden="true">
            ■
          </span>
        </button>
      ) : (
        <button
          className="primary-button spin-start-button"
          type="button"
          disabled={!connected || !hasEnoughOptions || !durationIsValid}
          onClick={onSpin}
        >
          <span>{t("startWheel")}</span>
          <span className="spin-button-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M19 7v5h-5" />
              <path d="M18.2 15.7A7.5 7.5 0 1 1 19 9" />
            </svg>
          </span>
        </button>
      )}
    </>
  );
}
