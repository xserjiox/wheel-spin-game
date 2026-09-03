// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { I18nProvider, translateError, useI18n } from "./i18n";
import type { Locale } from "./locale";

const expectedMessages: Array<{
  locale: Locale;
  rateLimited: string;
  chanceOutOfRange: string;
  requestFailed: string;
}> = [
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
  afterEach(cleanup);

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
