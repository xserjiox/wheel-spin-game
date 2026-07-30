import { useI18n } from "@/shared/lib/i18n";

export function SaveRoomPrompt({
  onSave,
  onDismiss,
}: {
  onSave: () => void;
  onDismiss: () => void;
}) {
  const { t } = useI18n();

  return (
    <aside className="save-room-prompt" aria-labelledby="save-room-prompt-title">
      <div>
        <strong id="save-room-prompt-title">{t("saveRoomQuestion")}</strong>
        <p>{t("saveRoomCopy")}</p>
      </div>
      <div className="save-room-prompt-actions">
        <button className="secondary-button" type="button" onClick={onDismiss}>
          {t("notNow")}
        </button>
        <button className="primary-button" type="button" onClick={onSave}>
          {t("saveRoomAction")}
        </button>
      </div>
    </aside>
  );
}
