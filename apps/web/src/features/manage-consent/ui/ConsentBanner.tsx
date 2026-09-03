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
  legalInformation: string;
  privacyEyebrow: string;
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
      "Google Analytics page views and feature events, without room codes, names, or wheel content.",
    save: "Save choices",
    close: "Close",
    privacy: "Privacy Policy",
    cookies: "Cookie Policy",
    legalInformation: "Legal information",
    privacyEyebrow: "PRIVACY",
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
      "Просмотры страниц и события функций в Google Analytics — без кодов комнат, имён и содержимого колеса.",
    save: "Сохранить выбор",
    close: "Закрыть",
    privacy: "Политика конфиденциальности",
    cookies: "Политика cookies",
    legalInformation: "Правовая информация",
    privacyEyebrow: "КОНФИДЕНЦИАЛЬНОСТЬ",
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
      "Перегляди сторінок і події функцій у Google Analytics — без кодів кімнат, імен і вмісту колеса.",
    save: "Зберегти вибір",
    close: "Закрити",
    privacy: "Політика конфіденційності",
    cookies: "Політика cookies",
    legalInformation: "Правова інформація",
    privacyEyebrow: "КОНФІДЕНЦІЙНІСТЬ",
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
      "Google-Analytics-Seitenaufrufe und Funktionsereignisse, ohne Raumcodes, Namen oder Radinhalte.",
    save: "Auswahl speichern",
    close: "Schließen",
    privacy: "Datenschutz",
    cookies: "Cookie-Richtlinie",
    legalInformation: "Rechtliche Informationen",
    privacyEyebrow: "DATENSCHUTZ",
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
      "Google Analytics 页面浏览和功能事件，不包含房间代码、姓名或转盘内容。",
    save: "保存选择",
    close: "关闭",
    privacy: "隐私政策",
    cookies: "Cookie 政策",
    legalInformation: "法律信息",
    privacyEyebrow: "隐私",
  },
  es: {
    title: "Tus opciones de privacidad",
    description:
      "Con tu permiso, Google Analytics nos ayuda a conocer las visitas y el uso de las funciones. No se carga antes de que aceptes.",
    allow: "Permitir analítica",
    reject: "Rechazar",
    manage: "Administrar preferencias",
    settings: "Configuración de cookies",
    settingsTitle: "Preferencias de privacidad",
    settingsDescription:
      "Puedes cambiar esta elección en cualquier momento. El almacenamiento necesario no se puede desactivar porque el servicio lo necesita para funcionar.",
    necessary: "Necesarias",
    necessaryDescription:
      "Sesiones de sala, idioma, elementos guardados y tu elección.",
    alwaysOn: "Siempre activas",
    analytics: "Analítica",
    analyticsDescription:
      "Vistas de página y eventos de funciones de Google Analytics, sin códigos de sala, nombres ni contenido de la ruleta.",
    save: "Guardar preferencias",
    close: "Cerrar",
    privacy: "Política de privacidad",
    cookies: "Política de cookies",
    legalInformation: "Información legal",
    privacyEyebrow: "PRIVACIDAD",
  },
  pt: {
    title: "Suas escolhas de privacidade",
    description:
      "Com a sua permissão, o Google Analytics nos ajuda a entender as visitas e o uso dos recursos. Ele não é carregado antes do seu consentimento.",
    allow: "Permitir análise",
    reject: "Recusar",
    manage: "Gerenciar preferências",
    settings: "Configurações de cookies",
    settingsTitle: "Preferências de privacidade",
    settingsDescription:
      "Você pode alterar esta escolha a qualquer momento. O armazenamento necessário não pode ser desativado porque o serviço precisa dele para funcionar.",
    necessary: "Necessários",
    necessaryDescription: "Sessões de sala, idioma, itens salvos e a sua escolha.",
    alwaysOn: "Sempre ativos",
    analytics: "Análise",
    analyticsDescription:
      "Visualizações de página e eventos de recursos do Google Analytics, sem códigos de sala, nomes ou conteúdo da roleta.",
    save: "Salvar escolhas",
    close: "Fechar",
    privacy: "Política de Privacidade",
    cookies: "Política de Cookies",
    legalInformation: "Informações legais",
    privacyEyebrow: "PRIVACIDADE",
  },
  ja: {
    title: "プライバシーの選択",
    description:
      "許可いただいた場合、Google Analyticsを使って訪問数や機能の利用状況を把握します。同意前に読み込まれることはありません。",
    allow: "分析を許可",
    reject: "拒否",
    manage: "設定を管理",
    settings: "Cookie設定",
    settingsTitle: "プライバシー設定",
    settingsDescription:
      "この選択はいつでも変更できます。サービスの動作に必要な保存領域は無効にできません。",
    necessary: "必須",
    necessaryDescription: "ルームセッション、言語、保存した項目、およびこの選択。",
    alwaysOn: "常に有効",
    analytics: "アクセス解析",
    analyticsDescription:
      "ルームコード、名前、ルーレットの内容を含まないGoogle Analyticsのページビューと機能イベント。",
    save: "設定を保存",
    close: "閉じる",
    privacy: "プライバシーポリシー",
    cookies: "Cookieポリシー",
    legalInformation: "法的情報",
    privacyEyebrow: "プライバシー",
  },
  "zh-Hant": {
    title: "你的私隱選擇",
    description:
      "經你同意後，Google Analytics 可協助我們了解瀏覽量和功能使用情況。我們不會在你同意前載入它。",
    allow: "允許分析",
    reject: "拒絕",
    manage: "管理偏好",
    settings: "Cookie 設定",
    settingsTitle: "私隱偏好",
    settingsDescription: "你可以隨時變更此選擇。服務運作所需的必要儲存空間無法停用。",
    necessary: "必要",
    necessaryDescription: "房間工作階段、語言、已儲存項目和你的選擇。",
    alwaysOn: "始終開啟",
    analytics: "分析",
    analyticsDescription:
      "Google Analytics 頁面瀏覽和功能事件，不包含房間代碼、名稱或轉盤內容。",
    save: "儲存選擇",
    close: "關閉",
    privacy: "私隱政策",
    cookies: "Cookie 政策",
    legalInformation: "法律資訊",
    privacyEyebrow: "私隱",
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
            <nav aria-label={text.legalInformation}>
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
                <p className="eyebrow">{text.privacyEyebrow}</p>
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
              <nav aria-label={text.legalInformation}>
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
