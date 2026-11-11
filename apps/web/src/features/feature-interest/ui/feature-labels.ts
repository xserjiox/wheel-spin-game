import type { InterestFeature } from "@/shared/lib/analytics";
import type { Translate } from "@/shared/lib/i18n";

export const featureLabelKeys: Record<InterestFeature, Parameters<Translate>[0]> = {
  saved_group: "featureSavedGroup",
  permanent_room: "featurePermanentRoom",
  split_teams: "featureSplitTeams",
  projector_mode: "featureProjectorMode",
  pro: "featurePro",
};
