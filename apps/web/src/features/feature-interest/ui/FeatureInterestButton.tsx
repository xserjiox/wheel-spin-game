import { useState } from "react";
import {
  type InterestFeature,
  type InterestPlacement,
  trackAnalyticsEvent,
} from "@/shared/lib/analytics";
import { useI18n } from "@/shared/lib/i18n";
import { noteInterest } from "../model/feedback-storage";
import { featureLabelKeys } from "./feature-labels";

// A quiet "Soon" button that measures interest in a planned feature. No contact details are asked.
export function FeatureInterestButton({
  feature,
  placement,
}: {
  feature: InterestFeature;
  placement: InterestPlacement;
}) {
  const { t } = useI18n();
  const [noted, setNoted] = useState(false);

  const register = () => {
    if (noted) return;
    if (noteInterest(window.localStorage, feature)) {
      trackAnalyticsEvent("feature_interest", { feature, placement });
    }
    setNoted(true);
  };

  // The button stays in place after the tap so keyboard focus is not lost.
  return (
    <button
      className={`feature-interest${noted ? " noted" : ""}`}
      type="button"
      onClick={register}
    >
      {noted ? (
        <span>{t("featureInterestThanks")}</span>
      ) : (
        <>
          <span>{t(featureLabelKeys[feature])}</span>
          <span className="soon-badge">{t("featureSoon")}</span>
        </>
      )}
    </button>
  );
}
