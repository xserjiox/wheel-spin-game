import { type FormEvent, useEffect, useMemo, useState } from "react";
import { type RoomState, useRoom, Wheel } from "@/entities/room";
import { saveHostRoom } from "@/entities/saved-room";
import { LanguageSwitcher } from "@/features/change-language";
import { SpinControls } from "@/features/control-spin";
import {
  ParticipantsPanel,
  RemovedFromRoomScreen,
} from "@/features/manage-participants";
import { SaveWheelTemplate } from "@/features/manage-wheel-templates";
import { ShareRoomButton } from "@/features/share-room";
import { useI18n } from "@/shared/lib/i18n";
import { Brand } from "@/shared/ui/brand";

type Tab = "options" | "proposals" | "participants" | "history" | "settings";

export function RoomPage({
  code,
  initialState,
  onExit,
}: {
  code: string;
  initialState: RoomState;
  onExit: () => void;
}) {
  const { t } = useI18n();
  const { state, connected, error, clearError, canceledSpinId, wasKicked, command } =
    useRoom(code, initialState);
  const [tab, setTab] = useState<Tab>("options");
  const [duration, setDuration] = useState("20");
  const [title, setTitle] = useState(state.title);
  const [notice, setNotice] = useState("");
  const isHost = state.role === "HOST";
  const isSpinning = state.status === "SPINNING";

  useEffect(() => setTitle(state.title), [state.title]);
  useEffect(() => {
    if (state.role === "HOST") {
      saveHostRoom(window.localStorage, state);
    }
  }, [state.code, state.expiresAt, state.role, state.title]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 2_500);
    return () => clearTimeout(timer);
  }, [notice]);

  const statusText = useMemo(() => {
    if (!connected) return t("reconnecting");
    if (isSpinning) return t("wheelSpinning");
    return isHost ? t("ready") : t("waitingHost");
  }, [connected, isHost, isSpinning, t]);

  if (wasKicked) {
    return <RemovedFromRoomScreen onHome={onExit} />;
  }

  const run = async () => {
    const durationSeconds = Number(duration);
    if (
      !Number.isInteger(durationSeconds) ||
      durationSeconds < 5 ||
      durationSeconds > 120
    ) {
      return;
    }
    await command("spin.start", {
      requestId: crypto.randomUUID(),
      durationMs: durationSeconds * 1_000,
    });
  };

  const cancelSpin = async () => {
    await command("spin.cancel", {});
  };

  return (
    <main className="room-shell">
      <header className="room-topbar">
        <Brand onClick={onExit} />
        <div className="room-summary">
          <span className={`connection-dot ${connected ? "online" : ""}`} />
          <span className="participant-count">
            {t(state.participantCount === 1 ? "participant" : "participants", {
              count: state.participantCount,
            })}
          </span>
          <span className="room-code-pill">
            <span>{t("room")}</span>
            <strong>{state.code}</strong>
          </span>
        </div>
        <div className="room-actions">
          <LanguageSwitcher />
          <span className="identity-pill">
            {state.displayName}
            {isHost && <b>HOST</b>}
          </span>
          <ShareRoomButton
            code={state.code}
            onCopied={() => setNotice(t("copied"))}
            onCopyError={() => setNotice(t("copyFailed"))}
          />
        </div>
      </header>

      {(notice || error) && (
        <div className={`toast ${error ? "error" : ""}`} role="status">
          <span>{error || notice}</span>
          {error && <button onClick={clearError}>×</button>}
        </div>
      )}

      <section className="room-workspace">
        <section className="wheel-section">
          <div className="section-heading room-heading">
            <p className="eyebrow">{isHost ? t("hostControls") : t("sharedWheel")}</p>
            {isHost ? (
              <form
                className="inline-title-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  void command("room.updateTitle", { title });
                }}
              >
                <input
                  aria-label={t("titleLabel")}
                  value={title}
                  maxLength={60}
                  onChange={(event) => setTitle(event.target.value)}
                  onBlur={() => {
                    if (title.trim() && title !== state.title) {
                      void command("room.updateTitle", { title });
                    }
                  }}
                />
                <span className="title-edit-hint" aria-hidden="true">
                  ✎
                </span>
              </form>
            ) : (
              <h1>{state.title}</h1>
            )}
            <p>{isHost ? t("hostLead") : t("guestLead")}</p>
          </div>

          <Wheel
            options={state.options}
            activeSpin={state.activeSpin}
            canceledSpinId={canceledSpinId}
            canSpin={isHost && connected && !isSpinning && state.options.length >= 2}
            onSpin={run}
          />

          <div
            className={`spin-status ${isSpinning ? "spinning" : ""}`}
            aria-live="polite"
          >
            <span className="status-dot" aria-hidden="true" />
            <span>{statusText}</span>
          </div>

          <SaveWheelTemplate
            title={state.title}
            options={state.options.map((option) => option.label)}
            onStatus={setNotice}
          />
        </section>

        <aside className="control-panel room-panel">
          <nav className="panel-tabs" aria-label={t("roomSections")}>
            <TabButton active={tab === "options"} onClick={() => setTab("options")}>
              {isHost ? t("slots") : t("propose")}
            </TabButton>
            {isHost && (
              <TabButton
                active={tab === "proposals"}
                onClick={() => setTab("proposals")}
              >
                {t("ideas")}{" "}
                {state.proposals.length > 0 && <i>{state.proposals.length}</i>}
              </TabButton>
            )}
            <TabButton
              active={tab === "participants"}
              onClick={() => setTab("participants")}
            >
              {t("people")}
            </TabButton>
            <TabButton active={tab === "history"} onClick={() => setTab("history")}>
              {t("history")}
            </TabButton>
            {isHost && (
              <TabButton active={tab === "settings"} onClick={() => setTab("settings")}>
                {t("settings")}
              </TabButton>
            )}
          </nav>

          {tab === "options" &&
            (isHost ? (
              <HostOptions
                state={state}
                disabled={isSpinning}
                connected={connected}
                duration={duration}
                setDuration={setDuration}
                add={(label) => command("option.add", { label })}
                remove={(optionId) => command("option.remove", { optionId })}
                spin={run}
                cancelSpin={cancelSpin}
              />
            ) : (
              <GuestProposal
                connected={connected}
                submit={(label) => command("proposal.create", { label })}
              />
            ))}

          {tab === "proposals" && isHost && (
            <ProposalList
              proposals={state.proposals}
              disabled={isSpinning}
              review={(proposalId, decision) =>
                command("proposal.review", { proposalId, decision })
              }
            />
          )}

          {tab === "participants" && (
            <ParticipantsPanel
              participants={state.participants}
              isHost={isHost}
              connected={connected}
              onKick={(participantId) => command("participant.kick", { participantId })}
            />
          )}

          {tab === "history" && <History state={state} />}

          {tab === "settings" && isHost && (
            <Settings
              hasPassword={state.hasPassword}
              disabled={isSpinning}
              update={(password) => command("room.updatePassword", { password })}
            />
          )}
        </aside>
      </section>
    </main>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button className={active ? "active" : ""} type="button" onClick={onClick}>
      {children}
    </button>
  );
}

function HostOptions({
  state,
  disabled,
  connected,
  duration,
  setDuration,
  add,
  remove,
  spin,
  cancelSpin,
}: {
  state: RoomState;
  disabled: boolean;
  connected: boolean;
  duration: string;
  setDuration: (duration: string) => void;
  add: (label: string) => Promise<unknown>;
  remove: (id: string) => Promise<unknown>;
  spin: () => Promise<void>;
  cancelSpin: () => Promise<void>;
}) {
  const { localeTag, t } = useI18n();
  const [label, setLabel] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!label.trim()) return;
    const result = await add(label);
    if ((result as { ok?: boolean }).ok) setLabel("");
  };
  return (
    <section className="panel-content">
      <div className="panel-title-row">
        <div>
          <p className="step-label">{t("wheelLabel")}</p>
          <h2>{t("choices")}</h2>
        </div>
        <span className="count-badge">{state.options.length}</span>
      </div>
      <form className="add-form" onSubmit={submit}>
        <input
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          maxLength={80}
          placeholder={t("optionExample")}
          disabled={disabled}
          aria-label={t("newSlot")}
        />
        <button className="add-button" disabled={disabled} aria-label={t("addSlot")}>
          +
        </button>
      </form>
      <div className="options-list">
        {state.options.map((option, index) => (
          <div className="option-row" key={option.id}>
            <span className={`option-color color-${index % 7}`} />
            <span className="option-name">{option.label}</span>
            <button
              className="remove-option"
              type="button"
              disabled={disabled}
              onClick={() => void remove(option.id)}
              aria-label={t("removeNamed", { name: option.label })}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <p className="probability">
        {state.options.length
          ? t("probability", {
              value: (100 / state.options.length).toLocaleString(localeTag, {
                maximumFractionDigits: 2,
              }),
            })
          : t("addTwo")}
      </p>
      <div className="panel-divider" />
      <SpinControls
        duration={duration}
        isSpinning={disabled}
        connected={connected}
        hasEnoughOptions={state.options.length >= 2}
        setDuration={setDuration}
        onSpin={() => void spin()}
        onCancel={() => void cancelSpin()}
      />
    </section>
  );
}

function GuestProposal({
  connected,
  submit,
}: {
  connected: boolean;
  submit: (label: string) => Promise<unknown>;
}) {
  const { t } = useI18n();
  const [label, setLabel] = useState("");
  const [sent, setSent] = useState(false);
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!label.trim()) return;
    const result = await submit(label);
    if ((result as { ok?: boolean }).ok) {
      setLabel("");
      setSent(true);
      setTimeout(() => setSent(false), 2_000);
    }
  };
  return (
    <section className="panel-content guest-proposal">
      <p className="step-label">{t("anonymousProposal")}</p>
      <h2>{t("addIdea")}</h2>
      <p className="panel-copy">{t("privacyIntro")}</p>
      <form className="proposal-form" onSubmit={handleSubmit}>
        <label>
          {t("newOption")}
          <input
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            maxLength={80}
            placeholder={t("proposalExample")}
            disabled={!connected}
            required
          />
        </label>
        <button className="primary-button" disabled={!connected}>
          <span>
            {sent ? t("sent") : connected ? t("proposeSlot") : t("reconnecting")}
          </span>
          <span className="button-arrow" aria-hidden="true">
            ↗
          </span>
        </button>
      </form>
      <div className="anonymous-note">
        <span aria-hidden="true">✦</span>
        <p>
          <b>{t("anonymous")}</b>
          <br />
          {t("anonymousCopy")}
        </p>
      </div>
    </section>
  );
}

function ProposalList({
  proposals,
  disabled,
  review,
}: {
  proposals: RoomState["proposals"];
  disabled: boolean;
  review: (id: string, decision: "accept" | "reject") => Promise<unknown>;
}) {
  const { t } = useI18n();
  return (
    <section className="panel-content">
      <div className="panel-title-row">
        <div>
          <p className="step-label">{t("anonymous")}</p>
          <h2>{t("suggestions")}</h2>
        </div>
        <span className="count-badge">{proposals.length}</span>
      </div>
      {proposals.length === 0 ? (
        <div className="panel-empty">
          <span>✦</span>
          <p>{t("noIdeas")}</p>
        </div>
      ) : (
        <div className="proposal-list">
          {proposals.map((proposal) => (
            <article className="proposal-card" key={proposal.id}>
              <p>{proposal.label}</p>
              <div>
                <button
                  className="accept-button"
                  disabled={disabled}
                  onClick={() => void review(proposal.id, "accept")}
                >
                  {t("add")}
                </button>
                <button
                  className="reject-button"
                  disabled={disabled}
                  onClick={() => void review(proposal.id, "reject")}
                  aria-label={t("reject")}
                >
                  ×
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function History({ state }: { state: RoomState }) {
  const { localeTag, t } = useI18n();
  return (
    <section className="panel-content">
      <div className="panel-title-row">
        <div>
          <p className="step-label">{t("lastTen")}</p>
          <h2>{t("history")}</h2>
        </div>
        <span className="count-badge">{state.history.length}</span>
      </div>
      {state.history.length === 0 ? (
        <div className="panel-empty">
          <span>↗</span>
          <p>{t("firstSpin")}</p>
        </div>
      ) : (
        <ol className="history-list">
          {state.history.map((spin, index) => (
            <li key={spin.id}>
              <span className="history-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <b>{spin.winnerLabel}</b>
              <time>
                {new Date(spin.createdAt).toLocaleTimeString(localeTag, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function Settings({
  hasPassword,
  disabled,
  update,
}: {
  hasPassword: boolean;
  disabled: boolean;
  update: (password: string) => Promise<unknown>;
}) {
  const { t } = useI18n();
  const [password, setPassword] = useState("");
  const [saved, setSaved] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const result = await update(password);
    if ((result as { ok?: boolean }).ok) {
      setPassword("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2_000);
    }
  };
  return (
    <section className="panel-content">
      <p className="step-label">{t("access")}</p>
      <h2>{t("roomPasswordTitle")}</h2>
      <p className="panel-copy">{hasPassword ? t("protectedCopy") : t("openCopy")}</p>
      <form className="proposal-form" onSubmit={submit}>
        <label>
          {t("newPassword")}
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            maxLength={72}
            placeholder={hasPassword ? t("enterNewPassword") : t("createPassword")}
            disabled={disabled}
          />
        </label>
        <button className="primary-button" disabled={disabled}>
          <span>
            {saved ? t("saved") : hasPassword ? t("changePassword") : t("setPassword")}
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
    </section>
  );
}
