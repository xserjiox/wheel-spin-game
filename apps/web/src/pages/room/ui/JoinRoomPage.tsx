import { type FormEvent, useState } from "react";
import type { RoomMeta } from "@/entities/room";
import { LanguageSwitcher } from "@/features/change-language";
import { translateError, useI18n } from "@/shared/lib/i18n";
import { Brand } from "@/shared/ui/brand";

export function JoinRoomPage({
  meta,
  onJoin,
  onBack,
}: {
  meta: RoomMeta;
  onJoin: (input: { name: string; password: string }) => Promise<void>;
  onBack: () => void;
}) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onJoin({ name, password });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? translateError(submitError.message, t)
          : t("joinFailed"),
      );
      setBusy(false);
    }
  };

  return (
    <main className="join-page">
      <header className="topbar compact-topbar">
        <Brand onClick={onBack} />
        <div className="topbar-tools">
          <span className="room-code-pill">
            {t("room")} {meta.code}
          </span>
          <LanguageSwitcher />
        </div>
      </header>
      <section className="join-stage">
        <div className="join-decoration" aria-hidden="true">
          <div className="preview-wheel">
            <span>{t("spinAction")}</span>
          </div>
        </div>
        <form className="entry-card join-card" onSubmit={submit}>
          <span className="brand-mark large-mark" aria-hidden="true">
            ✦
          </span>
          <p className="eyebrow">{t("invited")}</p>
          <h1>{meta.title}</h1>
          <p className="join-description">{t("joinDescription")}</p>
          <label>
            {t("yourName")}
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={32}
              placeholder={t("guestNameExample")}
              autoFocus
              required
            />
          </label>
          {meta.requiresPassword && (
            <label>
              {t("roomPassword")}
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                maxLength={72}
                autoComplete="current-password"
                placeholder={t("enterPassword")}
                required
              />
            </label>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="primary-button" disabled={busy}>
            <span>{busy ? t("entering") : t("enterRoom")}</span>
            <span className="button-arrow" aria-hidden="true">
              ↗
            </span>
          </button>
          <button className="text-button" type="button" onClick={onBack}>
            {t("home")}
          </button>
        </form>
      </section>
    </main>
  );
}
