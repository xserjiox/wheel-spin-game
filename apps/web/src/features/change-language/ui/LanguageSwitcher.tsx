import { type Locale, SUPPORTED_LOCALES, useI18n } from "@/shared/lib/i18n";

const localeLabels: Record<Locale, string> = {
  en: "EN",
  ru: "RU",
  uk: "UA",
  de: "DE",
  zh: "中文",
};

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <label className="language-switcher">
      <span className="sr-only">{t("language")}</span>
      <select
        value={locale}
        aria-label={t("language")}
        onChange={(event) => setLocale(event.target.value as typeof locale)}
      >
        {SUPPORTED_LOCALES.map((option) => (
          <option key={option} value={option}>
            {localeLabels[option]}
          </option>
        ))}
      </select>
    </label>
  );
}
