import {
  localeFromHomePath,
  localeFromLanguages,
  SUPPORTED_LOCALES,
  type Locale,
} from "./locale";
import { LOCALE_STORAGE_KEY } from "./storage";

export function detectInitialLocale(): Locale {
  if (typeof window === "undefined") return "en";

  // The root URL is the default entry point; localized URLs are explicit choices.
  const pathLocale = localeFromHomePath(window.location.pathname);
  if (pathLocale && pathLocale !== "en") return pathLocale;

  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    const savedLocale = SUPPORTED_LOCALES.find((locale) => locale === stored);
    if (savedLocale) return savedLocale;
  } catch {
    // Browser privacy settings may block storage without blocking language detection.
  }

  return localeFromLanguages(
    window.navigator.languages.length
      ? window.navigator.languages
      : [window.navigator.language],
  );
}
