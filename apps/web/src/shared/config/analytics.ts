const configuredMeasurementId =
  import.meta.env.VITE_GA_MEASUREMENT_ID?.trim().toUpperCase() ?? "";

const productionMeasurementId = "G-3G5H8H6FD6";
const measurementIdPattern = /^G-[A-Z0-9]+$/;

export const analyticsConfig = {
  measurementId: measurementIdPattern.test(configuredMeasurementId)
    ? configuredMeasurementId
    : import.meta.env.PROD
      ? productionMeasurementId
      : "",
  consentLifetimeDays: 180,
} as const;
