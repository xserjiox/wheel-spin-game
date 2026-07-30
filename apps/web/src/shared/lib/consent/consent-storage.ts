export const CONSENT_STORAGE_KEY = "gatherwheel-consent-v1";
export const CONSENT_VERSION = 1;
export const CONSENT_LIFETIME_DAYS = 180;

export type ConsentChoice = "granted" | "denied";

type ConsentRecord = {
  version: typeof CONSENT_VERSION;
  analytics: boolean;
  decidedAt: string;
  expiresAt: string;
};

function isConsentRecord(value: unknown): value is ConsentRecord {
  if (!value || typeof value !== "object") return false;

  const record = value as Partial<ConsentRecord>;
  return (
    record.version === CONSENT_VERSION &&
    typeof record.analytics === "boolean" &&
    typeof record.decidedAt === "string" &&
    Number.isFinite(Date.parse(record.decidedAt)) &&
    typeof record.expiresAt === "string" &&
    Number.isFinite(Date.parse(record.expiresAt))
  );
}

export function readConsentChoice(
  storage: Storage,
  now = Date.now(),
): ConsentChoice | null {
  try {
    const stored = storage.getItem(CONSENT_STORAGE_KEY);
    if (!stored) return null;

    const record: unknown = JSON.parse(stored);
    if (!isConsentRecord(record) || Date.parse(record.expiresAt) <= now) {
      storage.removeItem(CONSENT_STORAGE_KEY);
      return null;
    }

    return record.analytics ? "granted" : "denied";
  } catch {
    storage.removeItem(CONSENT_STORAGE_KEY);
    return null;
  }
}

export function writeConsentChoice(
  storage: Storage,
  choice: ConsentChoice,
  now = new Date(),
): void {
  const expiresAt = new Date(now);
  expiresAt.setUTCDate(expiresAt.getUTCDate() + CONSENT_LIFETIME_DAYS);

  const record: ConsentRecord = {
    version: CONSENT_VERSION,
    analytics: choice === "granted",
    decidedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  storage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
}
