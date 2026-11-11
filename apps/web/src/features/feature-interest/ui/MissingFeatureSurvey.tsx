import { useEffect, useId, useState } from "react";
import {
  INTEREST_FEATURES,
  type InterestFeature,
  trackAnalyticsEvent,
} from "@/shared/lib/analytics";
import { useI18n } from "@/shared/lib/i18n";
import { noteInterest } from "../model/feedback-storage";
import { featureLabelKeys } from "./feature-labels";

const THANKS_VISIBLE_MS = 2_500;

// A small corner card rather than a dialog: the host can ignore it and keep spinning.
export function MissingFeatureSurvey({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const titleId = useId();
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    if (!answered) return;
    const timer = window.setTimeout(onClose, THANKS_VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [answered, onClose]);

  const answer = (feature: InterestFeature) => {
    noteInterest(window.localStorage, feature);
    trackAnalyticsEvent("feature_interest", { feature, placement: "survey" });
    setAnswered(true);
  };

  return (
    <aside className="feature-survey" aria-labelledby={titleId}>
      <button
        className="modal-close"
        type="button"
        aria-label={t("surveyDismiss")}
        onClick={onClose}
      >
        ×
      </button>
      <h2 id={titleId}>{t("surveyTitle")}</h2>
      <div aria-live="polite">
        {answered ? (
          <p className="feature-interest-thanks">{t("featureInterestThanks")}</p>
        ) : (
          <>
            <p>{t("surveyCopy")}</p>
            <div className="feature-survey-options">
              {INTEREST_FEATURES.map((feature) => (
                <button key={feature} type="button" onClick={() => answer(feature)}>
                  {t(featureLabelKeys[feature])}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
