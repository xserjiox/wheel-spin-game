import { useI18n } from "@/shared/lib/i18n";

export function RemovedFromRoomScreen({ onHome }: { onHome: () => void }) {
  const { t } = useI18n();

  return (
    <main className="center-page">
      <div className="empty-card removed-room-card">
        <span className="brand-mark" aria-hidden="true">
          ×
        </span>
        <p className="eyebrow">{t("removedFromRoom")}</p>
        <h1>{t("removedFromRoomTitle")}</h1>
        <p>{t("removedFromRoomCopy")}</p>
        <button className="primary-button centered-button" onClick={onHome}>
          {t("home")}
        </button>
      </div>
    </main>
  );
}
