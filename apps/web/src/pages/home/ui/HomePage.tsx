import { type FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom, type RoomNavigationState } from "@/entities/room";
import { LanguageSwitcher } from "@/features/change-language";
import { WheelTemplatePicker } from "@/features/manage-wheel-templates";
import { translateError, useI18n } from "@/shared/lib/i18n";
import { roomPath } from "@/shared/lib/router";
import { Brand } from "@/shared/ui/brand";

type CreateInput = {
  hostName: string;
  title: string;
  password: string;
  options: string[];
};

export function HomePage() {
  const navigate = useNavigate();
  const { defaultRoomOptions, t } = useI18n();
  const localizedDefaultTitle = t("defaultTitle");
  const previousDefaultTitle = useRef(localizedDefaultTitle);
  const [mode, setMode] = useState<"create" | "join">("create");
  const [hostName, setHostName] = useState("");
  const [title, setTitle] = useState(localizedDefaultTitle);
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [templateOptions, setTemplateOptions] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const oldDefaultTitle = previousDefaultTitle.current;
    setTitle((current) =>
      current === oldDefaultTitle ? localizedDefaultTitle : current,
    );
    previousDefaultTitle.current = localizedDefaultTitle;
  }, [localizedDefaultTitle]);

  const submitCreate = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await createRoom({
        hostName,
        title,
        password,
        options: templateOptions ?? defaultRoomOptions,
      } satisfies CreateInput);
      navigate(roomPath(result.code), {
        state: {
          initialRoomState: result.state,
        } satisfies RoomNavigationState,
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? translateError(submitError.message, t)
          : t("createFailed"),
      );
      setBusy(false);
    }
  };

  return (
    <main className="landing-shell">
      <header className="topbar">
        <Brand />
        <div className="topbar-tools">
          <p className="tagline">{t("tagline")}</p>
          <LanguageSwitcher />
        </div>
      </header>

      <section className="landing-grid">
        <div className="landing-copy">
          <p className="eyebrow">{t("landingEyebrow")}</p>
          <h1>
            {t("heroLine1")}
            <br />
            <span>{t("heroLine2")}</span>
          </h1>
          <p className="lead">{t("lead")}</p>
          <div className="feature-row" aria-label={t("features")}>
            <span>{t("featureGuests")}</span>
            <span>{t("featureAnonymous")}</span>
            <span>{t("featureResult")}</span>
          </div>
          <div className="preview-wheel" aria-hidden="true">
            <span>{t("spinAction")}</span>
          </div>
        </div>

        <section className="entry-card" aria-label={t("join")}>
          <div className="mode-switch">
            <button
              className={mode === "create" ? "active" : ""}
              type="button"
              onClick={() => {
                setMode("create");
                setError("");
              }}
            >
              {t("create")}
            </button>
            <button
              className={mode === "join" ? "active" : ""}
              type="button"
              onClick={() => {
                setMode("join");
                setError("");
              }}
            >
              {t("join")}
            </button>
          </div>

          {mode === "create" ? (
            <form className="entry-form" onSubmit={submitCreate}>
              <div>
                <p className="step-label">{t("newRoom")}</p>
                <h2>{t("gatherFriends")}</h2>
              </div>
              <label>
                {t("yourName")}
                <input
                  value={hostName}
                  onChange={(event) => setHostName(event.target.value)}
                  maxLength={32}
                  placeholder={t("nameExample")}
                  autoComplete="name"
                  required
                />
              </label>
              <label>
                {t("wheelTitle")}
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={60}
                  required
                />
              </label>
              <WheelTemplatePicker
                onTemplateChange={(template) =>
                  setTemplateOptions(template?.options ?? null)
                }
              />
              <label>
                <span className="field-label-row">
                  <span>{t("password")}</span>
                  <span className="optional">{t("optional")}</span>
                </span>
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  maxLength={72}
                  type="password"
                  placeholder={t("passwordOpenPlaceholder")}
                  autoComplete="new-password"
                />
              </label>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <button className="primary-button" disabled={busy}>
                <span>{busy ? t("creating") : t("createRoom")}</span>
                <span className="button-arrow" aria-hidden="true">
                  ↗
                </span>
              </button>
            </form>
          ) : (
            <form
              className="entry-form join-short"
              onSubmit={(event) => {
                event.preventDefault();
                const cleanCode = code.trim();
                if (cleanCode) navigate(roomPath(cleanCode));
              }}
            >
              <div>
                <p className="step-label">{t("haveInvite")}</p>
                <h2>{t("enterRoomCode")}</h2>
              </div>
              <label>
                {t("code")}
                <input
                  className="room-code-input"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  maxLength={16}
                  placeholder={t("codeExample")}
                  autoCapitalize="none"
                  required
                />
              </label>
              <button className="primary-button">
                <span>{t("continue")}</span>
                <span className="button-arrow" aria-hidden="true">
                  ↗
                </span>
              </button>
              <p className="form-hint">{t("inviteHint")}</p>
            </form>
          )}
        </section>
      </section>
    </main>
  );
}
