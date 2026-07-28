import { translateError, useI18n } from "@/shared/lib/i18n";

export function UnavailableScreen({
  message = "",
  onHome,
}: {
  message?: string;
  onHome: () => void;
}) {
  const { t } = useI18n();

  return (
    <main className="center-page">
      <div className="empty-card">
        <span className="brand-mark" aria-hidden="true">
          ✦
        </span>
        <p className="eyebrow">{t("unavailable")}</p>
        <h1>{message ? translateError(message, t) : t("roomNotFound")}</h1>
        <button className="primary-button centered-button" onClick={onHome}>
          {t("home")}
        </button>
      </div>
    </main>
  );
}
