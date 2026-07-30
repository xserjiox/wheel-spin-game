const ROOM_PATH_PREFIX = "/r/";
const PRIVATE_PATH_PREFIXES = ["/api/", "/socket.io"];
const PRIVATE_EXACT_PATHS = new Set(["/health", "/ready"]);
const LINK_PREVIEW_BOT_SIGNATURES = [
  "telegrambot",
  "whatsapp",
  "facebookexternalhit",
  "facebot",
  "twitterbot",
  "linkedinbot",
  "slackbot-linkexpanding",
  "discordbot",
  "skypeuripreview",
  "viber",
] as const;

export function isKnownLinkPreviewBot(userAgent: string | undefined): boolean {
  const normalizedUserAgent = userAgent?.toLowerCase() ?? "";
  return LINK_PREVIEW_BOT_SIGNATURES.some((signature) =>
    normalizedUserAgent.includes(signature),
  );
}

export function shouldPreventIndexing(requestUrl: string, userAgent?: string): boolean {
  const path = requestUrl.split("?")[0];

  if (path.startsWith(ROOM_PATH_PREFIX)) {
    return !isKnownLinkPreviewBot(userAgent);
  }

  return (
    PRIVATE_EXACT_PATHS.has(path) ||
    PRIVATE_PATH_PREFIXES.some((prefix) => path.startsWith(prefix))
  );
}
