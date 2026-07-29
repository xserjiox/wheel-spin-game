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
      <div className="duration-row">
        <div>
          <p className="step-label">{t("spinLabel")}</p>
          <h2>{t("time")}</h2>
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
          <label className="custom-duration">
            <span>{t("customTime")}</span>
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
          <small
            id={durationHintId}
            className={`duration-hint ${durationIsValid ? "" : "error"}`}
          >
            {t("durationRange")}
          </small>
        </div>
      </div>

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
          className="primary-button"
          type="button"
          disabled={!connected || !hasEnoughOptions || !durationIsValid}
          onClick={onSpin}
        >
          <span>{t("startWheel")}</span>
          <span className="button-arrow" aria-hidden="true">
            ↗
          </span>
        </button>
      )}
    </>
  );
}
