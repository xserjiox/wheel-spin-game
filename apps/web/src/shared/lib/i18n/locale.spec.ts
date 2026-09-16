import { describe, expect, it } from "vitest";
import { homePathForLocale, localeFromHomePath, localeFromLanguages } from "./locale";

describe("localized home paths", () => {
  it("maps every supported language to one canonical home path", () => {
    expect(homePathForLocale("en")).toBe("/");
    expect(homePathForLocale("ru")).toBe("/ru/");
    expect(homePathForLocale("uk")).toBe("/uk/");
    expect(homePathForLocale("de")).toBe("/de/");
    expect(homePathForLocale("zh")).toBe("/zh/");
    expect(homePathForLocale("zh-Hant")).toBe("/zh-hant/");
    expect(homePathForLocale("es")).toBe("/es/");
    expect(homePathForLocale("pt")).toBe("/pt/");
    expect(homePathForLocale("ja")).toBe("/ja/");
    expect(homePathForLocale("vi")).toBe("/vi/");
    expect(homePathForLocale("ms")).toBe("/ms/");
  });

  it("recognizes localized home paths without treating app routes as homes", () => {
    expect(localeFromHomePath("/ru")).toBe("ru");
    expect(localeFromHomePath("/zh/")).toBe("zh");
    expect(localeFromHomePath("/zh-hant/")).toBe("zh-Hant");
    expect(localeFromHomePath("/es")).toBe("es");
    expect(localeFromHomePath("/vi/")).toBe("vi");
    expect(localeFromHomePath("/ms")).toBe("ms");
    expect(localeFromHomePath("/r/Ab7xK2pQ")).toBeNull();
    expect(localeFromHomePath("/unknown")).toBeNull();
  });
});

describe("browser language matching", () => {
  it.each([
    ["en-GB", "en"],
    ["ru-RU", "ru"],
    ["uk-UA", "uk"],
    ["de-AT", "de"],
    ["es-MX", "es"],
    ["pt-PT", "pt"],
    ["ja-JP", "ja"],
    ["vi-VN", "vi"],
    ["ms-MY", "ms"],
    ["ms-SG", "ms"],
    ["zh", "zh"],
    ["zh-CN", "zh"],
    ["zh-SG", "zh"],
    ["zh-TW", "zh-Hant"],
    ["zh-HK", "zh-Hant"],
    ["zh-MO", "zh-Hant"],
    ["zh-Hant", "zh-Hant"],
    ["zh-Hans", "zh"],
    ["zh-Hans-HK", "zh"],
    ["zh-Hant-CN", "zh-Hant"],
    ["VI-vn", "vi"],
  ])("matches %s to %s", (tag, expected) => {
    expect(localeFromLanguages([tag])).toBe(expected);
  });

  it("uses the first supported browser preference", () => {
    expect(localeFromLanguages(["fr-FR", "ms-MY", "vi-VN", "en-US"])).toBe("ms");
    expect(localeFromLanguages(["en-GB", "vi-VN"])).toBe("en");
    expect(localeFromLanguages(["invalid_tag", "", "vi-VN"])).toBe("vi");
  });

  it("falls back to English for unsupported or missing preferences", () => {
    expect(localeFromLanguages(["fr-FR", "th-TH", "id-ID"])).toBe("en");
    expect(localeFromLanguages([])).toBe("en");
  });
});
