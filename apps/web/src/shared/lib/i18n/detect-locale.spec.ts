// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { detectInitialLocale } from "./detect-locale";
import { LOCALE_STORAGE_KEY } from "./storage";

describe("initial language detection", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.replaceState(null, "", "/");
    vi.spyOn(window.navigator, "languages", "get").mockReturnValue(["vi-VN", "en-US"]);
    vi.spyOn(window.navigator, "language", "get").mockReturnValue("vi-VN");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
    window.history.replaceState(null, "", "/");
  });

  it.each(["/", "/r/Ab7xK2pQ", "/privacy", "/cookies"])(
    "uses the browser language on %s on a first visit",
    (path) => {
      window.history.replaceState(null, "", path);
      expect(detectInitialLocale()).toBe("vi");
    },
  );

  it.each(["en", "ms", "zh-Hant"])(
    "keeps the saved %s preference ahead of the system language",
    (locale) => {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
      expect(detectInitialLocale()).toBe(locale);
    },
  );

  it("prioritizes an explicit localized URL", () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, "en");
    window.history.replaceState(null, "", "/ms/");
    expect(detectInitialLocale()).toBe("ms");
  });

  it.each(["fr", "constructor", "toString"])(
    "ignores the unsupported stored preference %s",
    (locale) => {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
      expect(detectInitialLocale()).toBe("vi");
    },
  );

  it("uses navigator.language when the preference list is empty", () => {
    vi.spyOn(window.navigator, "languages", "get").mockReturnValue([]);
    vi.spyOn(window.navigator, "language", "get").mockReturnValue("ms-MY");
    expect(detectInitialLocale()).toBe("ms");
  });

  it("falls back to English when no browser language is supported", () => {
    vi.spyOn(window.navigator, "languages", "get").mockReturnValue(["fr-FR", "th-TH"]);
    expect(detectInitialLocale()).toBe("en");
  });

  it("still detects the language when local storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("Storage is blocked", "SecurityError");
    });
    expect(detectInitialLocale()).toBe("vi");
  });
});
