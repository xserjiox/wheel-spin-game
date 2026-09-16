export type Locale =
  "en" | "ru" | "uk" | "de" | "zh" | "es" | "pt" | "ja" | "zh-Hant" | "vi" | "ms";

export const SUPPORTED_LOCALES: Locale[] = [
  "en",
  "ru",
  "uk",
  "de",
  "zh",
  "zh-Hant",
  "es",
  "pt",
  "ja",
  "vi",
  "ms",
];

const HOME_PATHS: Record<Locale, string> = {
  en: "/",
  ru: "/ru/",
  uk: "/uk/",
  de: "/de/",
  zh: "/zh/",
  "zh-Hant": "/zh-hant/",
  es: "/es/",
  pt: "/pt/",
  ja: "/ja/",
  vi: "/vi/",
  ms: "/ms/",
};

export function homePathForLocale(locale: Locale): string {
  return HOME_PATHS[locale];
}

export function localeFromHomePath(pathname: string): Locale | null {
  const normalizedPath =
    pathname === "/" ? pathname : `/${pathname.split("/").filter(Boolean).join("/")}/`;

  return (
    SUPPORTED_LOCALES.find((locale) => homePathForLocale(locale) === normalizedPath) ??
    null
  );
}

export function localeFromLanguages(languages: readonly string[]): Locale {
  for (const tag of languages) {
    try {
      const { language, script, region } = new Intl.Locale(tag);
      if (language === "zh") {
        if (script === "Hant") return "zh-Hant";
        if (script === "Hans") return "zh";
        return region && ["TW", "HK", "MO"].includes(region) ? "zh-Hant" : "zh";
      }

      const supported = SUPPORTED_LOCALES.find((locale) => locale === language);
      if (supported) return supported;
    } catch {
      // Ignore malformed language tags and try the next browser preference.
    }
  }

  return "en";
}
