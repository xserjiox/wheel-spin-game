import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { App } from "@/app/App";
import "@/app/styles/index.css";
import { I18nProvider, localeFromHomePath } from "@/shared/lib/i18n";

const root = document.getElementById("root")!;
const application = (
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>
);

if (root.hasChildNodes() && localeFromHomePath(window.location.pathname)) {
  hydrateRoot(root, application);
} else {
  root.replaceChildren();
  createRoot(root).render(application);
}
