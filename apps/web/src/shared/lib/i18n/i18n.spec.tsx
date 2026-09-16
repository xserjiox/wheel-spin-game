// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider, translateError, useI18n } from "./i18n";
import type { Locale } from "./locale";
import { LOCALE_STORAGE_KEY } from "./storage";

const expectedMessages: Array<{
  locale: Locale;
  rateLimited: string;
  chanceOutOfRange: string;
  requestFailed: string;
}> = [
  {
    locale: "vi",
    rateLimited: "Có quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.",
    chanceOutOfRange: "Không thể đặt xác suất này nữa. Hãy tải lại phòng và thử lại.",
    requestFailed: "Không thể hoàn tất yêu cầu",
  },
  {
    locale: "ms",
    rateLimited: "Terlalu banyak permintaan. Sila cuba lagi sebentar lagi.",
    chanceOutOfRange:
      "Peluang itu tidak lagi boleh ditetapkan. Muat semula bilik dan cuba lagi.",
    requestFailed: "Permintaan tidak dapat diselesaikan",
  },
  {
    locale: "en",
    rateLimited: "Too many requests. Please try again shortly.",
    chanceOutOfRange:
      "That chance is no longer available. Refresh the room and try again.",
    requestFailed: "Could not complete the request",
  },
  {
    locale: "ru",
    rateLimited: "Слишком много запросов. Повторите попытку чуть позже.",
    chanceOutOfRange:
      "Этот шанс больше нельзя установить. Обновите комнату и попробуйте снова.",
    requestFailed: "Не удалось выполнить запрос",
  },
  {
    locale: "uk",
    rateLimited: "Забагато запитів. Спробуйте ще раз трохи пізніше.",
    chanceOutOfRange:
      "Це значення шансу більше недоступне. Оновіть кімнату й спробуйте ще раз.",
    requestFailed: "Не вдалося виконати запит",
  },
  {
    locale: "de",
    rateLimited: "Zu viele Anfragen. Bitte versuche es gleich noch einmal.",
    chanceOutOfRange:
      "Diese Wahrscheinlichkeit ist nicht mehr verfügbar. Lade den Raum neu und versuche es erneut.",
    requestFailed: "Die Anfrage konnte nicht ausgeführt werden",
  },
  {
    locale: "zh",
    rateLimited: "请求过于频繁，请稍后重试。",
    chanceOutOfRange: "当前无法设置此概率。请刷新房间后重试。",
    requestFailed: "请求失败",
  },
  {
    locale: "es",
    rateLimited: "Demasiadas solicitudes. Vuelve a intentarlo en unos instantes.",
    chanceOutOfRange:
      "Esa probabilidad ya no está disponible. Actualiza la sala e inténtalo de nuevo.",
    requestFailed: "No se pudo completar la solicitud",
  },
  {
    locale: "pt",
    rateLimited: "Muitas solicitações. Tente novamente em instantes.",
    chanceOutOfRange:
      "Essa chance não está mais disponível. Atualize a sala e tente novamente.",
    requestFailed: "Não foi possível concluir a solicitação",
  },
  {
    locale: "ja",
    rateLimited: "リクエストが多すぎます。しばらくしてからもう一度お試しください。",
    chanceOutOfRange:
      "この確率は設定できなくなりました。ルームを再読み込みしてもう一度お試しください。",
    requestFailed: "リクエストを完了できませんでした",
  },
  {
    locale: "zh-Hant",
    rateLimited: "要求過於頻繁，請稍後再試。",
    chanceOutOfRange: "目前無法設定此機率。請重新載入房間後再試。",
    requestFailed: "無法完成要求",
  },
];

function ErrorMessages() {
  const { t } = useI18n();

  return (
    <div>
      <span data-testid="rate-limited">{translateError("RATE_LIMIT_EXCEEDED", t)}</span>
      <span data-testid="chance-out-of-range">
        {translateError("CHANCE_OUT_OF_RANGE", t)}
      </span>
      <span data-testid="unknown">{translateError("UNEXPECTED_SERVER_ERROR", t)}</span>
    </div>
  );
}

describe("error localization", () => {
  afterEach(() => {
    cleanup();
    window.history.replaceState(null, "", "/");
  });

  it.each(expectedMessages)(
    "localizes known and unknown server errors in $locale",
    ({ locale, rateLimited, chanceOutOfRange, requestFailed }) => {
      render(
        <I18nProvider initialLocale={locale}>
          <ErrorMessages />
        </I18nProvider>,
      );

      expect(screen.getByTestId("rate-limited").textContent).toBe(rateLimited);
      expect(screen.getByTestId("chance-out-of-range").textContent).toBe(
        chanceOutOfRange,
      );
      expect(screen.getByTestId("unknown").textContent).toBe(requestFailed);
    },
  );
});

function LanguagePreference() {
  const { locale, localeTag, t, setLocale } = useI18n();
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="locale-tag">{localeTag}</span>
      <span data-testid="choices">{t("choiceCount", { count: 3 })}</span>
      <button onClick={() => setLocale("en")}>English</button>
    </div>
  );
}

describe("automatic language selection", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.replaceState({ key: "initial" }, "", "/?invite=example#faq");
    vi.spyOn(window.navigator, "languages", "get").mockReturnValue(["ms-MY", "en-US"]);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    window.localStorage.clear();
    window.history.replaceState(null, "", "/");
  });

  it("uses the detected locale and its formatting without saving a manual preference", () => {
    render(
      <I18nProvider>
        <LanguagePreference />
      </I18nProvider>,
    );

    expect(screen.getByTestId("locale").textContent).toBe("ms");
    expect(screen.getByTestId("locale-tag").textContent).toBe("ms-MY");
    expect(screen.getByTestId("choices").textContent).toBe("3 pilihan");
    expect(document.documentElement.lang).toBe("ms");
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBeNull();
  });

  it("retains an explicit English choice after reopening the default home", () => {
    const view = render(
      <I18nProvider>
        <LanguagePreference />
      </I18nProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "English" }));
    expect(window.location.pathname).toBe("/");
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("en");
    view.unmount();

    render(
      <I18nProvider>
        <LanguagePreference />
      </I18nProvider>,
    );
    expect(screen.getByTestId("locale").textContent).toBe("en");
    expect(window.location.pathname).toBe("/");
  });

  it("detects the language in a room without changing the invite URL", () => {
    window.history.replaceState(null, "", "/r/Ab7xK2pQ?invite=true");
    render(
      <I18nProvider>
        <LanguagePreference />
      </I18nProvider>,
    );
    expect(screen.getByTestId("locale").textContent).toBe("ms");
    expect(window.location.pathname).toBe("/r/Ab7xK2pQ");
    expect(window.location.search).toBe("?invite=true");
  });

  it("allows a manual language change even when storage is blocked", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Storage is blocked", "SecurityError");
    });
    render(
      <I18nProvider>
        <LanguagePreference />
      </I18nProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "English" }));
    expect(screen.getByTestId("locale").textContent).toBe("en");
  });
});
