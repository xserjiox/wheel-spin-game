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
const CAMPAIGN_PARAMETERS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
] as const;
const MAX_CAMPAIGN_VALUE_LENGTH = 100;

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
  if (
    [
      "/",
      "/ru/",
      "/uk/",
      "/de/",
      "/zh/",
      "/zh-hant/",
      "/es/",
      "/pt/",
      "/ja/",
      "/vi/",
      "/ms/",
    ].includes(normalized)
  )
    return "Home";
  return "Page";
}

// Only campaign tags survive, so traffic sources stay measurable without leaking other query data.
export function analyticsCampaignQuery(search: string): string {
  const source = new URLSearchParams(search);
  const kept = new URLSearchParams();
  for (const name of CAMPAIGN_PARAMETERS) {
    const value = source.get(name)?.trim();
    if (value) kept.set(name, value.slice(0, MAX_CAMPAIGN_VALUE_LENGTH));
  }
  const query = kept.toString();
  return query ? `?${query}` : "";
}

function analyticsLocation(pathname: string, search: string): string {
  return `${window.location.origin}${normalizeAnalyticsPath(pathname)}${analyticsCampaignQuery(search)}`;
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
      page_location: analyticsLocation(
        window.location.pathname,
        window.location.search,
      ),
      page_referrer: sanitizedReferrer(),
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_expires: GA_COOKIE_MAX_AGE_SECONDS,
      cookie_update: false,
    });
    loadGoogleTag();
  }
}

export function trackAnalyticsPageView(pathname: string, search = ""): void {
  const { measurementId } = analyticsConfig;
  if (!analyticsEnabled || !measurementId) return;

  const pagePath = normalizeAnalyticsPath(pathname);
  if (lastPageKey === pagePath) return;
  lastPageKey = pagePath;

  const pageContext = {
    page_location: analyticsLocation(pagePath, search),
    page_title: analyticsPageTitle(pagePath),
    page_referrer: sanitizedReferrer(),
  };
  // Automatic events such as user_engagement otherwise report the raw URL with the room code.
  gtag("set", pageContext);
  gtag("event", "page_view", {
    ...pageContext,
    page_path: pagePath,
    send_to: measurementId,
  });
}

type JoinEntryType = "shared_link" | "manual_code";
type JoinFailureReason =
  | "validation"
  | "unauthorized"
  | "unavailable"
  | "rate_limited"
  | "network"
  | "server"
  | "unknown";
type JoinAnalyticsParameters = {
  entry_type: JoinEntryType;
  has_password: boolean;
};
type ShareAnalyticsParameters = {
  role: "host" | "guest";
  method: "copy_link";
};
type CreateAnalyticsParameters = {
  has_password: boolean;
};
type ParameterlessAnalyticsEventName =
  | "spin_start"
  | "preset_select"
  | "template_select"
  | "template_save"
  | "elimination_enable"
  | "round_reset";
type AnalyticsEventName =
  | ParameterlessAnalyticsEventName
  | "room_create"
  | "room_join_start"
  | "room_join"
  | "room_join_failed"
  | "share_room"
  | "share_room_failed";
type AnalyticsEventParameters = Record<string, string | number | boolean>;

export function trackAnalyticsEvent(eventName: ParameterlessAnalyticsEventName): void;
export function trackAnalyticsEvent(
  eventName: "room_create",
  parameters: CreateAnalyticsParameters,
): void;
export function trackAnalyticsEvent(
  eventName: "room_join_start" | "room_join",
  parameters: JoinAnalyticsParameters,
): void;
export function trackAnalyticsEvent(
  eventName: "room_join_failed",
  parameters: JoinAnalyticsParameters & { reason: JoinFailureReason },
): void;
export function trackAnalyticsEvent(
  eventName: "share_room" | "share_room_failed",
  parameters: ShareAnalyticsParameters,
): void;
export function trackAnalyticsEvent(
  eventName: AnalyticsEventName,
  parameters: AnalyticsEventParameters = {},
): void {
  const { measurementId } = analyticsConfig;
  if (!analyticsEnabled || !measurementId) return;
  gtag("event", eventName, { ...parameters, send_to: measurementId });
}
