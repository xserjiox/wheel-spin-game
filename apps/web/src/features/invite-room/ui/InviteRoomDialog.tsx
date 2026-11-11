import { useEffect, useId, useRef, useState } from "react";
import { copyToClipboard } from "@/shared/lib/clipboard";
import { useI18n } from "@/shared/lib/i18n";
import { roomPath } from "@/shared/lib/router";
import { QrCode } from "@/shared/ui/qr-code";

export type InviteShareMethod = "copy_link" | "system_share";
export type InviteDialogVariant = "created" | "share";

export function InviteRoomDialog({
  code,
  variant,
  guestCount,
  onClose,
  onShared,
  onShareFailed,
}: {
  code: string;
  variant: InviteDialogVariant;
  guestCount: number;
  onClose: () => void;
  onShared: (method: InviteShareMethod) => void;
  onShareFailed: () => void;
}) {
  const { t } = useI18n();
  const modalRef = useRef<HTMLDivElement>(null);
  const copyButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const linkLabelId = useId();
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");
  const roomUrl = new URL(roomPath(code), window.location.origin).toString();
  // The marker lets join analytics tell QR scans apart from shared links.
  const qrUrl = `${roomUrl}?via=qr`;
  const canShare = typeof navigator.share === "function";

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() =>
      copyButtonRef.current?.focus(),
    );

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !modalRef.current) return;

      const controls = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(
          "button:not([disabled]):not([tabindex='-1']), input",
        ),
      );
      const first = controls[0];
      const last = controls.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          !modalRef.current.contains(document.activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      previousFocus?.focus();
    };
  }, [onClose]);

  useEffect(() => {
    if (copyStatus === "idle") return;
    const timer = setTimeout(() => setCopyStatus("idle"), 2_000);
    return () => clearTimeout(timer);
  }, [copyStatus]);

  const copyLink = async () => {
    try {
      await copyToClipboard(roomUrl);
      setCopyStatus("copied");
      onShared("copy_link");
    } catch {
      setCopyStatus("failed");
      onShareFailed();
    }
  };

  const shareLink = async () => {
    try {
      await navigator.share({ url: roomUrl });
      onShared("system_share");
    } catch {
      // Closing the system share sheet also rejects; nothing to report.
    }
  };

  return (
    <div
      ref={modalRef}
      className="result-modal invite-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <button
        className="modal-backdrop"
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        onClick={onClose}
      />
      <div className="result-card invite-card">
        <button
          className="modal-close"
          type="button"
          aria-label={t("closeInvite")}
          onClick={onClose}
        >
          ×
        </button>
        <p className="eyebrow">
          {variant === "created" ? t("roomReady") : `${t("room")} ${code}`}
        </p>
        <h2 id={titleId}>{t("inviteTitle")}</h2>
        <p id={descriptionId} className="invite-description">
          {t("inviteCopy")}
        </p>

        <figure className="invite-qr">
          <QrCode value={qrUrl} label={t("scanToJoin")} />
          <figcaption>{t("scanToJoin")}</figcaption>
        </figure>

        <div className="invite-link">
          <span id={linkLabelId}>{t("roomLinkLabel")}</span>
          <div className="invite-link-row">
            <input
              value={roomUrl.replace(/^https?:\/\//, "")}
              readOnly
              aria-labelledby={linkLabelId}
              onFocus={(event) => event.currentTarget.select()}
            />
            <button
              ref={copyButtonRef}
              className="invite-copy-button"
              type="button"
              onClick={() => void copyLink()}
            >
              {copyStatus === "copied"
                ? t("copied")
                : copyStatus === "failed"
                  ? t("copyFailed")
                  : t("copyLink")}
            </button>
          </div>
        </div>

        {canShare && (
          <button
            className="secondary-button invite-share-button"
            type="button"
            onClick={() => void shareLink()}
          >
            {t("share")}
          </button>
        )}

        <p
          className={`invite-joined ${guestCount > 0 ? "active" : ""}`}
          aria-live="polite"
        >
          <span className="status-dot" aria-hidden="true" />
          {t("guestsJoined", { count: guestCount })}
        </p>

        <button className="primary-button" type="button" onClick={onClose}>
          <span>{guestCount > 0 ? t("goToWheel") : t("spinSolo")}</span>
          <span className="button-arrow" aria-hidden="true">
            ↗
          </span>
        </button>
      </div>
    </div>
  );
}
