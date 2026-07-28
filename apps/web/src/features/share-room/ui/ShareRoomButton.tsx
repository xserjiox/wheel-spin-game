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
      disabled={copying}
      onClick={() => void copyRoomLink()}
    >
      <span aria-hidden="true">↗</span> {t("share")}
    </button>
  );
}
