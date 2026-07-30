import type { SavedRoom } from "@/entities/saved-room";
import { useI18n } from "@/shared/lib/i18n";

export function SavedRoomList({
  rooms,
  openingCode,
  onOpen,
  onRemove,
  onCreate,
  onClearDeviceData,
}: {
  rooms: SavedRoom[];
  openingCode: string | null;
  onOpen: (room: SavedRoom) => void;
  onRemove: (code: string) => void;
  onCreate: () => void;
  onClearDeviceData: () => void;
}) {
  const { localeTag, t } = useI18n();

  return (
    <section className="entry-form saved-rooms-panel">
      <div>
        <p className="step-label">{t("savedRoomsEyebrow")}</p>
        <h2>{t("savedRoomsTitle")}</h2>
      </div>

      {rooms.length === 0 ? (
        <div className="saved-rooms-empty">
          <button type="button" onClick={onCreate} aria-label={t("createRoom")}>
            <span aria-hidden="true">↗</span>
          </button>
          <strong>{t("noSavedRooms")}</strong>
          <p>{t("noSavedRoomsHint")}</p>
        </div>
      ) : (
        <div className="saved-room-list">
          {rooms.map((room) => {
            const isOpening = openingCode === room.code;
            return (
              <article className="saved-room-card" key={room.code}>
                <div className="saved-room-copy">
                  <strong>{room.title}</strong>
                  <div className="saved-room-meta">
                    <span className="saved-room-code">{room.code}</span>
                    <span className={`saved-room-role ${room.role.toLowerCase()}`}>
                      {t(room.role === "HOST" ? "hostRole" : "guestRole")}
                    </span>
                  </div>
                  <small>
                    {t("lastOpened", {
                      date: new Date(room.lastOpenedAt).toLocaleString(localeTag, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }),
                    })}
                  </small>
                </div>
                <div className="saved-room-actions">
                  <button
                    className="saved-room-open"
                    type="button"
                    disabled={openingCode !== null}
                    onClick={() => onOpen(room)}
                  >
                    {isOpening ? t("openingSavedRoom") : t("openRoom")}
                    <span aria-hidden="true">↗</span>
                  </button>
                  <button
                    className="saved-room-remove"
                    type="button"
                    disabled={openingCode !== null}
                    onClick={() => onRemove(room.code)}
                    aria-label={t("forgetRoomNamed", { title: room.title })}
                  >
                    ×
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="clear-device-data">
        <button type="button" onClick={onClearDeviceData}>
          {t("clearDeviceData")}
        </button>
        <p>{t("clearDeviceDataCopy")}</p>
      </div>
    </section>
  );
}
