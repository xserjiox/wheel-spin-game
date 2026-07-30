import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LanguageSwitcher } from "@/features/change-language";
import { legalConfig } from "@/shared/config/legal";
import { homePathForLocale, useI18n } from "@/shared/lib/i18n";
import { Brand } from "@/shared/ui/brand";
import { getLegalDocument } from "../model/legal-content";

export function LegalPage({ kind }: { kind: "privacy" | "cookies" }) {
  const { locale, t } = useI18n();
  const navigate = useNavigate();
  const content = getLegalDocument(locale, kind);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${content.title} | Wheel Spin`;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", content.summary);
  }, [content.summary, content.title]);

  return (
    <main className="legal-shell">
      <header className="topbar compact-topbar">
        <Brand onClick={() => navigate(homePathForLocale(locale))} />
        <LanguageSwitcher />
      </header>

      <article className="legal-document">
        <header className="legal-heading">
          <p className="eyebrow">{content.eyebrow}</p>
          <h1>{content.title}</h1>
          <p>{content.summary}</p>
          <small>
            {content.effectiveDateLabel}: {legalConfig.effectiveDate}
          </small>
        </header>

        {legalConfig.isConfigured && (
          <section>
            <h2>{content.controllerTitle}</h2>
            <p>
              {legalConfig.controllerName}
              <br />
              {content.contactLabel}:{" "}
              <a href={`mailto:${legalConfig.privacyEmail}`}>
                {legalConfig.privacyEmail}
              </a>
            </p>
          </section>
        )}

        {content.sections.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            {section.items && (
              <ul>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
      </article>

      <footer className="legal-footer">
        <Link to={homePathForLocale(locale)}>{t("home")}</Link>
        <Link to="/privacy">{t("privacyPolicy")}</Link>
        <Link to="/cookies">{t("cookiePolicy")}</Link>
      </footer>
    </main>
  );
}
