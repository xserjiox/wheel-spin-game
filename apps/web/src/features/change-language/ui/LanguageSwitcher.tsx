import { useEffect, useId, useRef, useState } from "react";
import { type Locale, SUPPORTED_LOCALES, useI18n } from "@/shared/lib/i18n";

const localeLabels: Record<Locale, string> = {
  en: "EN",
  ru: "RU",
  uk: "UA",
  de: "DE",
  zh: "简体中文",
  "zh-Hant": "繁體中文",
  es: "ES",
  pt: "PT",
  ja: "日本語",
  vi: "VI",
  ms: "MS",
};

const localeMenuCodes: Record<Locale, string> = {
  en: "EN",
  ru: "RU",
  uk: "UA",
  de: "DE",
  zh: "ZH",
  "zh-Hant": "ZH-T",
  es: "ES",
  pt: "PT",
  ja: "JA",
  vi: "VI",
  ms: "MS",
};

const localeNames: Record<Locale, string> = {
  en: "English",
  ru: "Русский",
  uk: "Українська",
  de: "Deutsch",
  zh: "简体中文",
  "zh-Hant": "繁體中文",
  es: "Español",
  pt: "Português",
  ja: "日本語",
  vi: "Tiếng Việt",
  ms: "Bahasa Melayu",
};

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    SUPPORTED_LOCALES.indexOf(locale),
  );
  const switcherRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const menuId = useId();

  useEffect(() => {
    setActiveIndex(SUPPORTED_LOCALES.indexOf(locale));
  }, [locale]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!switcherRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      optionRefs.current[activeIndex]?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeIndex, open]);

  const focusOption = (index: number) => {
    const wrappedIndex = (index + SUPPORTED_LOCALES.length) % SUPPORTED_LOCALES.length;
    setActiveIndex(wrappedIndex);
    optionRefs.current[wrappedIndex]?.focus();
  };

  const selectLocale = (nextLocale: Locale) => {
    setOpen(false);
    setLocale(nextLocale);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  };

  return (
    <div className={`language-switcher ${open ? "is-open" : ""}`} ref={switcherRef}>
      <button
        className="language-switcher-control"
        ref={triggerRef}
        id={`${menuId}-trigger`}
        type="button"
        aria-label={`${t("language")}: ${localeNames[locale]}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex(SUPPORTED_LOCALES.indexOf(locale));
            setOpen(true);
          }
        }}
      >
        <span>{localeLabels[locale]}</span>
        <svg viewBox="0 0 12 8" aria-hidden="true">
          <path d="m1 1 5 5 5-5" />
        </svg>
      </button>
      {open && (
        <ul
          className="language-switcher-menu"
          id={menuId}
          role="menu"
          aria-labelledby={`${menuId}-trigger`}
        >
          {SUPPORTED_LOCALES.map((option, index) => (
            <li key={option} role="none">
              <button
                ref={(element) => {
                  optionRefs.current[index] = element;
                }}
                type="button"
                role="menuitemradio"
                aria-checked={option === locale}
                tabIndex={index === activeIndex ? 0 : -1}
                onClick={() => selectLocale(option)}
                onFocus={() => setActiveIndex(index)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    focusOption(index + 1);
                  } else if (event.key === "ArrowUp") {
                    event.preventDefault();
                    focusOption(index - 1);
                  } else if (event.key === "Home") {
                    event.preventDefault();
                    focusOption(0);
                  } else if (event.key === "End") {
                    event.preventDefault();
                    focusOption(SUPPORTED_LOCALES.length - 1);
                  } else if (event.key === "Escape") {
                    event.preventDefault();
                    setOpen(false);
                    triggerRef.current?.focus();
                  } else if (event.key === "Tab") {
                    setOpen(false);
                  }
                }}
              >
                <span className="language-option-code">{localeMenuCodes[option]}</span>
                <span className="language-option-name" lang={option}>
                  {localeNames[option]}
                </span>
                <span className="language-option-mark" aria-hidden="true">
                  {option === locale ? "✓" : ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
