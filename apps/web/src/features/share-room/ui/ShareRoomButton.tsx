import { useState } from "react";
import { copyToClipboard } from "@/shared/lib/clipboard";
import { useI18n } from "@/shared/lib/i18n";
import { roomPath } from "@/shared/lib/router";

export function ShareRoomButton({
  code,
  onCopied,
  onCopyError,
}: {
  code: string;
  onCopied: () => void;
  onCopyError: () => void;
}) {
  const { t } = useI18n();
  const [copying, setCopying] = useState(false);

  const copyRoomLink = async () => {
    if (copying) return;
    setCopying(true);

    try {
      const url = new URL(roomPath(code), window.location.origin).toString();
      await copyToClipboard(url);
      onCopied();
    } catch {
      onCopyError();
    } finally {
      setCopying(false);
    }
  };

  return (
    <button
      className="share-button"
      type="button"
      aria-label={t("share")}
      disabled={copying}
      onClick={() => void copyRoomLink()}
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
