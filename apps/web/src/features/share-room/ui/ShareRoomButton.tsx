import { useI18n } from "@/shared/lib/i18n";

export function ShareRoomButton({ onOpen }: { onOpen: () => void }) {
  const { t } = useI18n();

  return (
    <button
      className="share-button"
      type="button"
      aria-label={t("share")}
      onClick={onOpen}
    >
      <span className="share-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="M9.5 14.5 14.5 9" />
          <path d="M7.2 16.8 5.8 18.2a3.1 3.1 0 0 1-4.4-4.4l4-4a3.1 3.1 0 0 1 4.4 0" />
          <path d="m16.8 7.2 1.4-1.4a3.1 3.1 0 1 1 4.4 4.4l-4 4a3.1 3.1 0 0 1-4.4 0" />
        </svg>
      </span>
      <span className="share-label">{t("share")}</span>
    </button>
  );
}
