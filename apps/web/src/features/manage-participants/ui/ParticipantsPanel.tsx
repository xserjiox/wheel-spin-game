import { useEffect, useMemo, useRef, useState } from "react";
import type { Ack, RoomParticipant } from "@/entities/room";
import { useI18n } from "@/shared/lib/i18n";

export function ParticipantsPanel({
  participants,
  isHost,
  connected,
  onKick,
}: {
  participants: RoomParticipant[];
  isHost: boolean;
  connected: boolean;
  onKick: (participantId: string) => Promise<unknown>;
}) {
  const { t } = useI18n();
  const [target, setTarget] = useState<RoomParticipant | null>(null);
  const [removing, setRemoving] = useState(false);
  const onlineCount = participants.filter((participant) => participant.online).length;

  const removeParticipant = async () => {
    if (!target) return;
    setRemoving(true);
    const result = (await onKick(target.id)) as Ack;
    setRemoving(false);
    setTarget(null);
    if (!result.ok) return;
  };

  return (
    <>
      <section className="panel-content participants-panel">
        <div className="panel-title-row">
          <div>
            <p className="step-label">{t("roomMembers")}</p>
            <h2>{t("membersTitle")}</h2>
          </div>
          <span className="count-badge">{participants.length}</span>
        </div>
        <p className="participants-summary">
          {t("onlineSummary", {
            online: onlineCount,
            total: participants.length,
          })}
        </p>
        <div className="participant-list">
          {participants.map((participant) => (
            <article className="participant-card" key={participant.id}>
              <span className="participant-avatar" aria-hidden="true">
                {participant.displayName.slice(0, 1).toLocaleUpperCase()}
              </span>
              <span className="participant-details">
                <span className="participant-name">
                  {participant.displayName}
                  {participant.role === "HOST" && (
                    <b className="participant-role">{t("hostBadge")}</b>
                  )}
                </span>
                <span
                  className={`participant-presence ${
                    participant.online ? "online" : ""
                  }`}
                >
                  <i aria-hidden="true" />
                  {t(participant.online ? "online" : "offline")}
                </span>
              </span>
              {isHost && participant.role === "GUEST" && (
                <button
                  className="participant-remove"
                  type="button"
                  disabled={!connected}
                  onClick={() => setTarget(participant)}
                  aria-label={t("removeParticipantNamed", {
                    name: participant.displayName,
                  })}
                >
                  {t("removeParticipant")}
                </button>
              )}
            </article>
          ))}
        </div>
      </section>

      {target && (
        <KickParticipantModal
          participant={target}
          removing={removing}
          onClose={() => setTarget(null)}
          onConfirm={() => void removeParticipant()}
        />
      )}
    </>
  );
}

function KickParticipantModal({
  participant,
  removing,
  onClose,
  onConfirm,
}: {
  participant: RoomParticipant;
  removing: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { t } = useI18n();
  const modalRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useMemo(() => `kick-title-${participant.id}`, [participant.id]);
  const descriptionId = useMemo(
    () => `kick-description-${participant.id}`,
    [participant.id],
  );

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() =>
      cancelButtonRef.current?.focus(),
    );

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !removing) {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !modalRef.current) return;

      const buttons = Array.from(
        modalRef.current.querySelectorAll<HTMLButtonElement>(
          "button:not([disabled]):not([tabindex='-1'])",
        ),
      );
      const firstButton = buttons[0];
      const lastButton = buttons.at(-1);
      if (!firstButton || !lastButton) return;
      if (event.shiftKey && document.activeElement === firstButton) {
        event.preventDefault();
        lastButton.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === lastButton ||
          !modalRef.current.contains(document.activeElement))
      ) {
        event.preventDefault();
        firstButton.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      previousFocus?.focus();
    };
  }, [onClose, removing]);

  return (
    <div
      ref={modalRef}
      className="result-modal kick-modal"
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
        onClick={() => {
          if (!removing) onClose();
        }}
      />
      <div className="result-card kick-card">
        <div className="kick-symbol" aria-hidden="true">
          ×
        </div>
        <p className="eyebrow">{t("removeParticipant")}</p>
        <h2 id={titleId}>
          {t("confirmRemoveTitle", { name: participant.displayName })}
        </h2>
        <p id={descriptionId} className="kick-description">
          {t("confirmRemoveCopy")}
        </p>
        <div className="kick-actions">
          <button
            ref={cancelButtonRef}
            className="kick-cancel-button"
            type="button"
            disabled={removing}
            onClick={onClose}
          >
            {t("cancel")}
          </button>
          <button
            className="kick-confirm-button"
            type="button"
            disabled={removing}
            onClick={onConfirm}
          >
            {removing ? t("removingParticipant") : t("confirmRemove")}
          </button>
        </div>
      </div>
    </div>
  );
}
