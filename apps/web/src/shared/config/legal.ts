const controllerName = import.meta.env.VITE_LEGAL_CONTROLLER_NAME?.trim() ?? "";
const privacyEmail = import.meta.env.VITE_PRIVACY_EMAIL?.trim() ?? "";

export const legalConfig = {
  controllerName,
  privacyEmail,
  effectiveDate: "2026-07-30",
  isConfigured: Boolean(controllerName && privacyEmail),
} as const;
