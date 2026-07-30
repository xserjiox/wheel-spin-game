const controllerName = import.meta.env.VITE_LEGAL_CONTROLLER_NAME?.trim() ?? "";
const privacyEmail = import.meta.env.VITE_PRIVACY_EMAIL?.trim() ?? "";

export const legalConfig = {
  controllerName,
  privacyEmail,
  effectiveDate: "30 July 2026",
  isConfigured: Boolean(controllerName && privacyEmail),
} as const;
