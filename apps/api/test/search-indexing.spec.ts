import { describe, expect, it } from "vitest";
import {
  isKnownLinkPreviewBot,
  shouldPreventIndexing,
} from "../src/shared/http/search-indexing";

describe("search indexing policy", () => {
  it("allows public assets and localized home pages", () => {
    expect(shouldPreventIndexing("/")).toBe(false);
    expect(shouldPreventIndexing("/ru/")).toBe(false);
    expect(shouldPreventIndexing("/assets/index.js")).toBe(false);
  });

  it("prevents indexing rooms, APIs, sockets, and health endpoints", () => {
    expect(shouldPreventIndexing("/r/Ab7xK2pQ")).toBe(true);
    expect(shouldPreventIndexing("/r/Ab7xK2pQ?invite=true")).toBe(true);
    expect(shouldPreventIndexing("/api/rooms/Ab7xK2pQ/meta")).toBe(true);
    expect(shouldPreventIndexing("/socket.io/")).toBe(true);
    expect(shouldPreventIndexing("/health")).toBe(true);
    expect(shouldPreventIndexing("/ready")).toBe(true);
  });

  it.each([
    "TelegramBot (like TwitterBot)",
    "WhatsApp/2.23.20.0",
    "facebookexternalhit/1.1",
    "Twitterbot/1.0",
    "LinkedInBot/1.0",
    "Slackbot-LinkExpanding 1.0",
    "Discordbot/2.0",
    "SkypeUriPreview Preview/0.5",
    "Viber",
  ])("allows known link preview bot %s to read room metadata", (userAgent) => {
    expect(isKnownLinkPreviewBot(userAgent)).toBe(true);
    expect(shouldPreventIndexing("/r/Ab7xK2pQ", userAgent)).toBe(false);
  });

  it.each([
    "Mozilla/5.0",
    "Googlebot/2.1",
    "bingbot/2.0",
    "DuckDuckBot/1.1",
    "UnknownPreviewBot/1.0",
  ])("keeps room indexing blocked for %s", (userAgent) => {
    expect(isKnownLinkPreviewBot(userAgent)).toBe(false);
    expect(shouldPreventIndexing("/r/Ab7xK2pQ", userAgent)).toBe(true);
  });

  it("never exposes private API routes to preview bots", () => {
    expect(
      shouldPreventIndexing(
        "/api/rooms/Ab7xK2pQ/meta",
        "TelegramBot (like TwitterBot)",
      ),
    ).toBe(true);
  });
});
