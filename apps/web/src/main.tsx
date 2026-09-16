import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { App } from "@/app/App";
import "@/app/styles/index.css";
import {
  detectInitialLocale,
  homePathForLocale,
  I18nProvider,
  localeFromHomePath,
} from "@/shared/lib/i18n";

const root = document.getElementById("root")!;
const prerenderedLocale = localeFromHomePath(window.location.pathname);
const initialLocale = detectInitialLocale();

if (window.location.pathname === "/" && initialLocale !== "en") {
  const { search, hash } = window.location;
  window.history.replaceState(
    window.history.state,
    "",
    `${homePathForLocale(initialLocale)}${search}${hash}`,
  );
  window.dispatchEvent(new PopStateEvent("popstate"));
}

const application = (
  <StrictMode>
    <I18nProvider initialLocale={initialLocale}>
      <App />
    </I18nProvider>
  </StrictMode>
);

// A preferred language can differ from the English HTML pre-rendered at `/`.
// Hydrate only matching translations to avoid a server/client markup mismatch.
if (root.hasChildNodes() && prerenderedLocale === initialLocale) {
  hydrateRoot(root, application);
} else {
  root.replaceChildren();
  createRoot(root).render(application);
}
