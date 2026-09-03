export type Locale = "en" | "ru" | "uk" | "de" | "zh" | "es" | "pt" | "ja" | "zh-Hant";

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
