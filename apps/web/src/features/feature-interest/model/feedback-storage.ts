import { INTEREST_FEATURES, type InterestFeature } from "@/shared/lib/analytics";

export const FEEDBACK_STORAGE_KEY = "gatherwheel-feedback";
// By the third result the host knows the app well enough to say what is missing.
export const SURVEY_AFTER_SPINS = 3;

type Feedback = { surveyShown: boolean; features: InterestFeature[] };

function readFeedback(storage: Storage): Feedback {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(FEEDBACK_STORAGE_KEY) ?? "{}");
    const value = (parsed && typeof parsed === "object" ? parsed : {}) as Record<
      string,
      unknown
    >;
    const features = Array.isArray(value.features) ? (value.features as unknown[]) : [];
    return {
      surveyShown: value.surveyShown === true,
      features: INTEREST_FEATURES.filter((feature) => features.includes(feature)),
    };
  } catch {
    return { surveyShown: false, features: [] };
  }
}

function writeFeedback(storage: Storage, feedback: Feedback): void {
  try {
    storage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(feedback));
  } catch {
    // Storage can be blocked (private mode); the page still keeps its own once-per-visit guard.
  }
}

// True only the first time on this device, so the survey is never shown twice.
export function claimSurvey(storage: Storage, completedSpins: number): boolean {
  if (completedSpins < SURVEY_AFTER_SPINS) return false;
  const feedback = readFeedback(storage);
  if (feedback.surveyShown) return false;
  writeFeedback(storage, { ...feedback, surveyShown: true });
  return true;
}

// True when the feature was not noted on this device before, so repeated taps count once.
export function noteInterest(storage: Storage, feature: InterestFeature): boolean {
  const feedback = readFeedback(storage);
  if (feedback.features.includes(feature)) return false;
  writeFeedback(storage, { ...feedback, features: [...feedback.features, feature] });
  return true;
}
