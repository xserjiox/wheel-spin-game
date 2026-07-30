import { type FormEvent, useEffect, useId, useRef, useState } from "react";
import { deleteOwnData, deleteRoomData, exportOwnData } from "@/entities/room";
import { removeSavedRoom } from "@/entities/saved-room";
import { translateError, useI18n } from "@/shared/lib/i18n";

export function RoomSettings({
  code,
  isHost,
  hasPassword,
  disabled,
  update,
  onExit,
}: {
  code: string;
  isHost: boolean;
  hasPassword: boolean;
  disabled: boolean;
  update: (password: string) => Promise<unknown>;
  onExit: () => void;
}) {
  const { t } = useI18n();
  const [password, setPassword] = useState("");
  const [saved, setSaved] = useState(false);
  const [dataAction, setDataAction] = useState<"export" | "delete" | null>(null);
  const [dataError, setDataError] = useState("");
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const result = await update(password);
    if ((result as { ok?: boolean }).ok) {
      setPassword("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2_000);
    }
  };

  const downloadData = async () => {
    setDataAction("export");
    setDataError("");
    try {
      const data = await exportOwnData(code);
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `gatherwheel-${code.toLowerCase()}-data.json`;
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setDataError(
        error instanceof Error ? translateError(error.message, t) : t("requestFailed"),
      );
    } finally {
      setDataAction(null);
    }
  };

  const deleteData = async () => {
    setDataAction("delete");
    setDataError("");
    try {
      if (isHost) await deleteRoomData(code);
      else await deleteOwnData(code);
      removeSavedRoom(window.localStorage, code);
      onExit();
    } catch (error) {
      setDataError(
        error instanceof Error ? translateError(error.message, t) : t("requestFailed"),
      );
      setDataAction(null);
    }
  };

  const closeDeleteConfirmation = () => {
    if (dataAction === "delete") return;
    setDeleteConfirmationOpen(false);
    setDataError("");
  };

  return (
    <>
      <section className="panel-content">
        {isHost && (
          <div className="settings-section">
            <p className="step-label">{t("access")}</p>
            <h2>{t("roomPasswordTitle")}</h2>
            <p className="panel-copy">
              {hasPassword ? t("protectedCopy") : t("openCopy")}
            </p>
            <form className="proposal-form" onSubmit={submit}>
              <label>
                {t("newPassword")}
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  maxLength={72}
                  placeholder={
                    hasPassword ? t("enterNewPassword") : t("createPassword")
                  }
                  disabled={disabled}
                />
              </label>
              <button className="primary-button" disabled={disabled}>
                <span>
                  {saved
                    ? t("saved")
                    : hasPassword
                      ? t("changePassword")
                      : t("setPassword")}
                </span>
                <span className="button-arrow" aria-hidden="true">
                  ↗
                </span>
              </button>
              {hasPassword && (
                <button
                  className="danger-text-button"
                  type="button"
                  disabled={disabled}
                  onClick={() => void update("")}
                >
                  {t("removePassword")}
                </button>
              )}
            </form>
            <p className="settings-note">{t("settingsNote")}</p>
          </div>
        )}

        <div className="settings-section data-controls">
          <p className="step-label">{t("privacyPolicy")}</p>
          <h2>{t("dataControls")}</h2>
          <p className="panel-copy">{t("dataControlsCopy")}</p>
          <div className="data-control-actions">
            <button
              className="secondary-button"
              type="button"
              disabled={dataAction !== null}
              onClick={() => void downloadData()}
            >
              {dataAction === "export" ? t("exportingData") : t("exportMyData")}
            </button>
            <button
              className="danger-text-button data-delete-button"
              type="button"
              disabled={dataAction !== null}
              onClick={() => {
                setDataError("");
                setDeleteConfirmationOpen(true);
              }}
            >
              {t(isHost ? "deleteRoomData" : "deleteMyData")}
            </button>
          </div>
          {dataError && !deleteConfirmationOpen && (
            <p className="form-error" role="alert">
              {dataError}
            </p>
          )}
        </div>
      </section>

      {deleteConfirmationOpen && (
        <DeleteDataConfirmationModal
          isHost={isHost}
          deleting={dataAction === "delete"}
          error={dataError}
          onClose={closeDeleteConfirmation}
          onConfirm={() => void deleteData()}
        />
      )}
    </>
  );
}

function DeleteDataConfirmationModal({
  isHost,
  deleting,
  error,
  onClose,
  onConfirm,
}: {
  isHost: boolean;
  deleting: boolean;
  error: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { t } = useI18n();
  const modalRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const actionKey = isHost ? "deleteRoomData" : "deleteMyData";
  const confirmationKey = isHost ? "deleteRoomDataConfirm" : "deleteMyDataConfirm";

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() =>
      cancelButtonRef.current?.focus(),
    );

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !deleting) {
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
  }, [deleting, onClose]);

  return (
    <div
      ref={modalRef}
      className="result-modal delete-data-modal"
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
      <div className="result-card delete-data-card">
        <div className="delete-data-symbol" aria-hidden="true">
          !
        </div>
        <p className="eyebrow">{t("dataControls")}</p>
        <h2 id={titleId}>{t(actionKey)}</h2>
        <p id={descriptionId} className="delete-data-description">
          {t(confirmationKey)}
        </p>
        {error && (
          <p className="form-error delete-data-error" role="alert">
            {error}
          </p>
        )}
        <div className="delete-data-actions">
          <button
            ref={cancelButtonRef}
            className="delete-data-cancel-button"
            type="button"
            disabled={deleting}
            onClick={onClose}
          >
            {t("cancel")}
          </button>
          <button
            className="delete-data-confirm-button"
            type="button"
            disabled={deleting}
            onClick={onConfirm}
          >
            {deleting ? t("deletingData") : t(actionKey)}
          </button>
        </div>
      </div>
    </div>
  );
}
