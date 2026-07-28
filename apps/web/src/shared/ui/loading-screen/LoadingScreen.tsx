import { useI18n } from "@/shared/lib/i18n";

export function LoadingScreen() {
  const { t } = useI18n();

  return (
    <main className="center-page">
      <div className="loading-mark" aria-hidden="true">
        ✦
      </div>
      <p className="loading-label">{t("openingRoom")}</p>
    </main>
  );
}
