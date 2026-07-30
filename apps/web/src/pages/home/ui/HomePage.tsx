import { type FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom, restoreRoom, type RoomNavigationState } from "@/entities/room";
import { useSavedRooms, type SavedRoom } from "@/entities/saved-room";
import { LanguageSwitcher } from "@/features/change-language";
import { SavedRoomList } from "@/features/manage-saved-rooms";
import { WheelTemplatePicker } from "@/features/manage-wheel-templates";
import { ApiRequestError } from "@/shared/api/http";
import {
  homePathForLocale,
  type Locale,
  SUPPORTED_LOCALES,
  translateError,
  useI18n,
} from "@/shared/lib/i18n";
import { roomPath } from "@/shared/lib/router";
import { Brand } from "@/shared/ui/brand";

type CreateInput = {
  hostName: string;
  title: string;
  password: string;
  options: string[];
};

const localeLabels: Record<Locale, string> = {
  en: "English",
  ru: "Русский",
  uk: "Українська",
  de: "Deutsch",
  zh: "中文",
};

export function HomePage() {
  const navigate = useNavigate();
  const { defaultRoomOptions, locale, t } = useI18n();
  const localizedDefaultTitle = t("defaultTitle");
  const previousDefaultTitle = useRef(localizedDefaultTitle);
  const { rooms, save: saveRoom, remove: removeRoom } = useSavedRooms();
  const [mode, setMode] = useState<"create" | "join" | "rooms">("create");
  const [hostName, setHostName] = useState("");
  const [title, setTitle] = useState(localizedDefaultTitle);
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [templateOptions, setTemplateOptions] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [openingCode, setOpeningCode] = useState<string | null>(null);
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
      saveRoom(result.state);
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

  const openSavedRoom = async (room: SavedRoom) => {
    setOpeningCode(room.code);
    setError("");

    try {
      const result = await restoreRoom(room.code);
      if (result.state.role !== room.role) {
        removeRoom(room.code);
        setError(t("roomAccessExpired"));
        setOpeningCode(null);
        return;
      }

      saveRoom(result.state);
      navigate(roomPath(room.code), {
        state: {
          initialRoomState: result.state,
        } satisfies RoomNavigationState,
      });
    } catch (openError) {
      if (
        openError instanceof ApiRequestError &&
        [401, 403, 404].includes(openError.status)
      ) {
        removeRoom(room.code);
        setError(t("roomAccessExpired"));
      } else {
        setError(
          openError instanceof Error
            ? translateError(openError.message, t)
            : t("requestFailed"),
        );
      }
      setOpeningCode(null);
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
            <button
              className={mode === "rooms" ? "active" : ""}
              type="button"
              onClick={() => {
                setMode("rooms");
                setError("");
              }}
            >
              {t("myRooms")}
              {rooms.length > 0 && <span className="mode-count">{rooms.length}</span>}
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
          ) : mode === "join" ? (
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
          ) : (
            <>
              <SavedRoomList
                rooms={rooms}
                openingCode={openingCode}
                onOpen={(room) => void openSavedRoom(room)}
                onRemove={removeRoom}
                onCreate={() => {
                  setMode("create");
                  setError("");
                }}
              />
              {error && (
                <p className="form-error saved-room-error" role="alert">
                  {error}
                </p>
              )}
            </>
          )}
        </section>
      </section>

      <section className="seo-overview" aria-labelledby="how-it-works-title">
        <header className="seo-section-heading">
          <p className="eyebrow">{t("landingEyebrow")}</p>
          <h2 id="how-it-works-title">{t("howItWorks")}</h2>
          <p>{t("howItWorksCopy")}</p>
        </header>

        <div className="seo-step-grid">
          <article>
            <span aria-hidden="true">01</span>
            <h3>{t("createRoom")}</h3>
            <p>{t("lead")}</p>
          </article>
          <article>
            <span aria-hidden="true">02</span>
            <h3>{t("stepInviteTitle")}</h3>
            <p>{t("stepInviteCopy")}</p>
          </article>
          <article>
            <span aria-hidden="true">03</span>
            <h3>{t("stepSpinTitle")}</h3>
            <p>{t("stepSpinCopy")}</p>
          </article>
        </div>

        <div className="seo-benefit-grid">
          <article>
            <h2>{t("whySharedTitle")}</h2>
            <p>{t("whySharedCopy")}</p>
          </article>
          <article>
            <h2>{t("useCasesTitle")}</h2>
            <p>{t("useCasesCopy")}</p>
          </article>
        </div>
      </section>

      <section className="seo-faq" aria-labelledby="faq-title">
        <h2 id="faq-title">{t("faqTitle")}</h2>
        <div className="seo-faq-list">
          <details>
            <summary>{t("faqFreeQuestion")}</summary>
            <p>{t("faqFreeAnswer")}</p>
          </details>
          <details>
            <summary>{t("faqAccountQuestion")}</summary>
            <p>{t("faqAccountAnswer")}</p>
          </details>
          <details>
            <summary>{t("faqLifetimeQuestion")}</summary>
            <p>{t("faqLifetimeAnswer")}</p>
          </details>
        </div>
      </section>

      <footer className="landing-footer">
        <span>© {new Date().getFullYear()} Wheel Spin</span>
        <nav aria-label={t("language")}>
          {SUPPORTED_LOCALES.map((option) => (
            <a
              key={option}
              href={homePathForLocale(option)}
              hrefLang={option === "zh" ? "zh-CN" : option}
              aria-current={option === locale ? "page" : undefined}
            >
              {localeLabels[option]}
            </a>
          ))}
        </nav>
      </footer>
    </main>
  );
}
