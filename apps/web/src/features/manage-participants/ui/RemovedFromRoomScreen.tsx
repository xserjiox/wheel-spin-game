import { useI18n } from "@/shared/lib/i18n";

export function RemovedFromRoomScreen({
  onHome,
  reason = "kicked",
}: {
  onHome: () => void;
  reason?: "kicked" | "participant-deleted" | "room-deleted";
}) {
  const { t } = useI18n();
  const title =
    reason === "participant-deleted"
      ? t("participantDataDeleted")
      : reason === "room-deleted"
        ? t("roomDataDeleted")
        : t("removedFromRoomTitle");
  const copy =
    reason === "participant-deleted"
      ? t("participantDataDeletedCopy")
      : reason === "room-deleted"
        ? t("roomDataDeletedCopy")
        : t("removedFromRoomCopy");

  return (
    <main className="center-page">
      <div className="empty-card removed-room-card">
        <span className="brand-mark" aria-hidden="true">
          ×
        </span>
        <p className="eyebrow">{t("removedFromRoom")}</p>
        <h1>{title}</h1>
        <p>{copy}</p>
        <button className="primary-button centered-button" onClick={onHome}>
          {t("home")}
        </button>
      </div>
    </main>
  );
}
