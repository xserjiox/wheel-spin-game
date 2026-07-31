import { analyticsConfig } from "@/shared/config/analytics";

type GtagArguments = [command: string, ...parameters: unknown[]];
type AnalyticsWindow = Window &
  typeof globalThis & {
    dataLayer?: unknown[];
    gtag?: (...args: GtagArguments) => void;
    [key: `ga-disable-${string}`]: boolean | undefined;
  };

const SCRIPT_ID = "gatherwheel-google-analytics";
const GA_COOKIE_MAX_AGE_SECONDS = 180 * 24 * 60 * 60;

let analyticsEnabled = false;
let consentDefaultsQueued = false;
let lastPageKey = "";

function analyticsWindow(): AnalyticsWindow {
  return window as AnalyticsWindow;
}

function gtag(..._args: GtagArguments): void {
  const target = analyticsWindow();
  target.dataLayer = target.dataLayer ?? [];
  // Google tag's documented queue format requires the function's Arguments object.
  // eslint-disable-next-line prefer-rest-params
  target.dataLayer.push(arguments);
}

function initializeGoogleTag(): void {
  const target = analyticsWindow();
  target.dataLayer = target.dataLayer ?? [];
  target.gtag = target.gtag ?? gtag;
}

function queueDefaultDeniedConsent(): void {
  if (consentDefaultsQueued) return;
  initializeGoogleTag();
  gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  gtag("set", "ads_data_redaction", true);
  consentDefaultsQueued = true;
}

function loadGoogleTag(): void {
  const { measurementId } = analyticsConfig;
  if (!measurementId || document.getElementById(SCRIPT_ID)) return;

  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
    measurementId,
  )}`;
  document.head.append(script);
}

function deleteAnalyticsCookies(): void {
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0]?.trim();
    if (!name?.startsWith("_ga")) continue;

    document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
    document.cookie = `${name}=; Max-Age=0; Path=/; Domain=${window.location.hostname}; SameSite=Lax`;
    document.cookie = `${name}=; Max-Age=0; Path=/; Domain=.${window.location.hostname}; SameSite=Lax`;
  }
}

export function normalizeAnalyticsPath(pathname: string): string {
  const path = pathname.split(/[?#]/, 1)[0] || "/";
  return /^\/r\/[^/]+\/?$/i.test(path) ? "/r/:room" : path;
}

export function analyticsPageTitle(pathname: string): string {
  const normalized = normalizeAnalyticsPath(pathname);
  if (normalized === "/r/:room") return "Shared room";
  if (normalized === "/privacy") return "Privacy Policy";
  if (normalized === "/cookies") return "Cookie Policy";
  if (["/", "/ru/", "/uk/", "/de/", "/zh/"].includes(normalized)) return "Home";
  return "Page";
}

function sanitizedReferrer(): string {
  if (!document.referrer) return "";

  try {
    const referrer = new URL(document.referrer);
    return referrer.origin === window.location.origin
      ? `${referrer.origin}${normalizeAnalyticsPath(referrer.pathname)}`
      : referrer.origin;
  } catch {
    return "";
  }
}

export function applyAnalyticsConsent(granted: boolean): void {
  const { measurementId } = analyticsConfig;
  if (!measurementId) return;

  const target = analyticsWindow();
  queueDefaultDeniedConsent();

  if (!granted) {
    target[`ga-disable-${measurementId}`] = true;
    analyticsEnabled = false;
    lastPageKey = "";
    gtag("consent", "update", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    deleteAnalyticsCookies();
    return;
  }

  delete target[`ga-disable-${measurementId}`];
  gtag("consent", "update", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });

  if (!analyticsEnabled) {
    analyticsEnabled = true;
    gtag("js", new Date());
    gtag("config", measurementId, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_expires: GA_COOKIE_MAX_AGE_SECONDS,
      cookie_update: false,
    });
    loadGoogleTag();
  }
}

export function trackAnalyticsPageView(pathname: string): void {
  const { measurementId } = analyticsConfig;
  if (!measurementId) return;

  applyAnalyticsConsent(true);
  const pagePath = normalizeAnalyticsPath(pathname);
  if (lastPageKey === pagePath) return;
  lastPageKey = pagePath;

  gtag("event", "page_view", {
    page_location: `${window.location.origin}${pagePath}`,
    page_path: pagePath,
    page_title: analyticsPageTitle(pagePath),
    page_referrer: sanitizedReferrer(),
    send_to: measurementId,
  });
}

export function trackAnalyticsEvent(
  eventName:
    | "room_create"
    | "room_join"
    | "share_room"
    | "spin_start"
    | "preset_select"
    | "template_select"
    | "template_save"
    | "elimination_enable"
    | "round_reset",
): void {
  const { measurementId } = analyticsConfig;
  if (!analyticsEnabled || !measurementId) return;
  gtag("event", eventName, { send_to: measurementId });
}
