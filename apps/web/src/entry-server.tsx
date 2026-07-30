import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { HomePage } from "@/pages/home";
import {
  getLocaleSeoMeta,
  homePathForLocale,
  I18nProvider,
  type Locale,
} from "@/shared/lib/i18n";

export function renderHome(locale: Locale): {
  html: string;
  title: string;
  description: string;
} {
  const { title, description } = getLocaleSeoMeta(locale);
  const html = renderToString(
    <I18nProvider initialLocale={locale}>
      <MemoryRouter initialEntries={[homePathForLocale(locale)]}>
        <HomePage />
      </MemoryRouter>
    </I18nProvider>,
  );

  return { html, title, description };
}
