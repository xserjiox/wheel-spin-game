import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { type Locale, useI18n } from "@/shared/lib/i18n";
import { useConsent } from "../model/ConsentContext";

type ConsentCopy = {
  title: string;
  description: string;
  allow: string;
  reject: string;
  manage: string;
  settings: string;
  settingsTitle: string;
  settingsDescription: string;
  necessary: string;
  necessaryDescription: string;
  alwaysOn: string;
  analytics: string;
  analyticsDescription: string;
  save: string;
  close: string;
  privacy: string;
  cookies: string;
};

const copy: Record<Locale, ConsentCopy> = {
  en: {
    title: "Your privacy choices",
    description:
      "With your permission, Google Analytics helps us understand visits and feature use. We do not load it before you agree.",
    allow: "Allow analytics",
    reject: "Reject",
    manage: "Manage preferences",
    settings: "Cookie settings",
    settingsTitle: "Privacy preferences",
    settingsDescription:
      "You can change this choice at any time. Necessary storage cannot be disabled because the service needs it to work.",
    necessary: "Necessary",
    necessaryDescription: "Room sessions, language, saved items, and your choice.",
    alwaysOn: "Always on",
    analytics: "Analytics",
    analyticsDescription:
      "Google Analytics page views and four feature events, without room codes, names, or wheel content.",
    save: "Save choices",
    close: "Close",
    privacy: "Privacy Policy",
    cookies: "Cookie Policy",
  },
  ru: {
    title: "Ваш выбор конфиденциальности",
    description:
      "С вашего разрешения Google Analytics помогает нам понимать посещаемость и использование функций. До согласия он не загружается.",
    allow: "Разрешить аналитику",
    reject: "Отклонить",
    manage: "Настроить",
    settings: "Настройки cookies",
    settingsTitle: "Настройки конфиденциальности",
    settingsDescription:
      "Вы можете изменить выбор в любое время. Необходимое хранилище нельзя отключить: без него сервис не работает.",
    necessary: "Необходимые",
    necessaryDescription: "Сессии комнат, язык, сохранённые элементы и ваш выбор.",
    alwaysOn: "Всегда включены",
    analytics: "Аналитика",
    analyticsDescription:
      "Просмотры страниц и четыре события функций в Google Analytics — без кодов комнат, имён и содержимого колеса.",
    save: "Сохранить выбор",
    close: "Закрыть",
    privacy: "Политика конфиденциальности",
    cookies: "Политика cookies",
  },
  uk: {
    title: "Ваш вибір конфіденційності",
    description:
      "З вашого дозволу Google Analytics допомагає нам розуміти відвідування та використання функцій. До згоди він не завантажується.",
    allow: "Дозволити аналітику",
    reject: "Відхилити",
    manage: "Налаштувати",
    settings: "Налаштування cookies",
    settingsTitle: "Налаштування конфіденційності",
    settingsDescription:
      "Ви можете змінити вибір будь-коли. Необхідне сховище не можна вимкнути, бо без нього сервіс не працює.",
    necessary: "Необхідні",
    necessaryDescription: "Сесії кімнат, мова, збережені елементи та ваш вибір.",
    alwaysOn: "Завжди ввімкнені",
    analytics: "Аналітика",
    analyticsDescription:
      "Перегляди сторінок і чотири події функцій у Google Analytics — без кодів кімнат, імен і вмісту колеса.",
    save: "Зберегти вибір",
    close: "Закрити",
    privacy: "Політика конфіденційності",
    cookies: "Політика cookies",
  },
  de: {
    title: "Deine Datenschutzauswahl",
    description:
      "Mit deiner Einwilligung hilft uns Google Analytics, Besuche und Funktionsnutzung zu verstehen. Vorher wird es nicht geladen.",
    allow: "Analytics erlauben",
    reject: "Ablehnen",
    manage: "Einstellungen",
    settings: "Cookie-Einstellungen",
    settingsTitle: "Datenschutzeinstellungen",
    settingsDescription:
      "Du kannst deine Wahl jederzeit ändern. Notwendiger Speicher kann nicht deaktiviert werden, da der Dienst ihn benötigt.",
    necessary: "Notwendig",
    necessaryDescription:
      "Raumsitzungen, Sprache, gespeicherte Elemente und deine Wahl.",
    alwaysOn: "Immer aktiv",
    analytics: "Analytics",
    analyticsDescription:
      "Google-Analytics-Seitenaufrufe und vier Funktionsereignisse, ohne Raumcodes, Namen oder Radinhalte.",
    save: "Auswahl speichern",
    close: "Schließen",
    privacy: "Datenschutz",
    cookies: "Cookie-Richtlinie",
  },
  zh: {
    title: "你的隐私选择",
    description:
      "经你同意，Google Analytics 可帮助我们了解访问量和功能使用情况。未经同意不会加载。",
    allow: "允许分析",
    reject: "拒绝",
    manage: "管理偏好",
    settings: "Cookie 设置",
    settingsTitle: "隐私偏好",
    settingsDescription: "你可以随时更改选择。服务运行所需的必要存储无法关闭。",
    necessary: "必要",
    necessaryDescription: "房间会话、语言、已保存项目和你的选择。",
    alwaysOn: "始终开启",
    analytics: "分析",
    analyticsDescription:
      "Google Analytics 页面浏览和四项功能事件，不包含房间代码、姓名或转盘内容。",
    save: "保存选择",
    close: "关闭",
    privacy: "隐私政策",
    cookies: "Cookie 政策",
  },
};

export function ConsentBanner() {
  const [mounted, setMounted] = useState(false);
  const { locale } = useI18n();
  const { choice, preferencesOpen, setChoice, openPreferences, closePreferences } =
    useConsent();
  const [analyticsAllowed, setAnalyticsAllowed] = useState(choice === "granted");
  const text = copy[locale];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (preferencesOpen) setAnalyticsAllowed(choice === "granted");
  }, [choice, preferencesOpen]);

  useEffect(() => {
    if (!preferencesOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && choice) closePreferences();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [choice, closePreferences, preferencesOpen]);

  if (!mounted) return null;

  return (
    <>
      {choice === null && !preferencesOpen && (
        <aside className="consent-banner" aria-labelledby="consent-title">
          <div className="consent-copy">
            <h2 id="consent-title">{text.title}</h2>
            <p>{text.description}</p>
            <nav aria-label="Legal information">
              <Link to="/privacy">{text.privacy}</Link>
              <Link to="/cookies">{text.cookies}</Link>
            </nav>
          </div>
          <div className="consent-actions">
            <button
              className="consent-button consent-allow"
              type="button"
              onClick={() => setChoice("granted")}
            >
              {text.allow}
            </button>
            <button
              className="consent-button"
              type="button"
              onClick={() => setChoice("denied")}
            >
              {text.reject}
            </button>
            <button className="consent-manage" type="button" onClick={openPreferences}>
              {text.manage}
            </button>
          </div>
        </aside>
      )}

      {choice !== null && !preferencesOpen && (
        <button
          className="consent-settings-button"
          type="button"
          onClick={openPreferences}
        >
          {text.settings}
        </button>
      )}

      {preferencesOpen && (
        <div className="consent-modal-backdrop">
          <section
            className="consent-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="consent-settings-title"
          >
            <header>
              <div>
                <p className="eyebrow">PRIVACY</p>
                <h2 id="consent-settings-title">{text.settingsTitle}</h2>
              </div>
              {choice !== null && (
                <button
                  className="consent-close"
                  type="button"
                  aria-label={text.close}
                  onClick={closePreferences}
                >
                  ×
                </button>
              )}
            </header>
            <p className="consent-modal-description">{text.settingsDescription}</p>

            <div className="consent-option">
              <div>
                <strong>{text.necessary}</strong>
                <p>{text.necessaryDescription}</p>
              </div>
              <span>{text.alwaysOn}</span>
            </div>
            <label className="consent-option consent-option-toggle">
              <div>
                <strong>{text.analytics}</strong>
                <p>{text.analyticsDescription}</p>
              </div>
              <input
                type="checkbox"
                checked={analyticsAllowed}
                onChange={(event) => setAnalyticsAllowed(event.target.checked)}
              />
            </label>

            <div className="consent-modal-footer">
              <nav aria-label="Legal information">
                <Link to="/privacy" onClick={closePreferences}>
                  {text.privacy}
                </Link>
                <Link to="/cookies" onClick={closePreferences}>
                  {text.cookies}
                </Link>
              </nav>
              <button
                className="consent-button consent-allow"
                type="button"
                onClick={() => setChoice(analyticsAllowed ? "granted" : "denied")}
              >
                {text.save}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
