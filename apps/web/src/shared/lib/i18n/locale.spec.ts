import { describe, expect, it } from "vitest";
import { homePathForLocale, localeFromHomePath } from "./locale";

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
  });

  it("recognizes localized home paths without treating app routes as homes", () => {
    expect(localeFromHomePath("/ru")).toBe("ru");
    expect(localeFromHomePath("/zh/")).toBe("zh");
    expect(localeFromHomePath("/zh-hant/")).toBe("zh-Hant");
    expect(localeFromHomePath("/es")).toBe("es");
    expect(localeFromHomePath("/r/Ab7xK2pQ")).toBeNull();
    expect(localeFromHomePath("/unknown")).toBeNull();
  });
});
