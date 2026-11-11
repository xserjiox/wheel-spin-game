import { useId } from "react";
import type { InterestFeature, InterestPlacement } from "@/shared/lib/analytics";
import { useI18n } from "@/shared/lib/i18n";
import { FeatureInterestButton } from "./FeatureInterestButton";

export function ComingSoonFeatures({
  features,
  placement,
}: {
  features: InterestFeature[];
  placement: InterestPlacement;
}) {
  const { t } = useI18n();
  const titleId = useId();
  return (
    <section className="coming-soon" aria-labelledby={titleId}>
      <h3 id={titleId}>{t("comingSoonTitle")}</h3>
      <p>{t("comingSoonCopy")}</p>
      <div className="feature-interest-list">
        {features.map((feature) => (
          <FeatureInterestButton
            key={feature}
            feature={feature}
            placement={placement}
          />
        ))}
      </div>
    </section>
  );
}
