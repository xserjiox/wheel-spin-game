import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  type Ack,
  deleteOwnData,
  deleteRoomData,
  exportOwnData,
  type RoomState,
  useRoom,
  Wheel,
} from "@/entities/room";
import { readSavedRooms, removeSavedRoom, saveRoom } from "@/entities/saved-room";
import { LanguageSwitcher } from "@/features/change-language";
import { SpinControls } from "@/features/control-spin";
import {
  ParticipantsPanel,
  RemovedFromRoomScreen,
} from "@/features/manage-participants";
import { MyProposals } from "@/features/manage-proposals";
import { SaveRoomPrompt } from "@/features/manage-saved-rooms";
import { SaveWheelTemplate } from "@/features/manage-wheel-templates";
import { ShareRoomButton } from "@/features/share-room";
import { translateError, useI18n } from "@/shared/lib/i18n";
import { Brand } from "@/shared/ui/brand";
import { EditableRoomTitle } from "./EditableRoomTitle";

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
  const { state, connected, error, clearError, canceledSpinId, exitReason, command } =
    useRoom(code, initialState);
  const [tab, setTab] = useState<Tab>("options");
  const [duration, setDuration] = useState("20");
  const [notice, setNotice] = useState("");
  const [isSaved, setIsSaved] = useState(() =>
    readSavedRooms(window.localStorage).some((room) => room.code === code),
  );
  const [savePromptDismissed, setSavePromptDismissed] = useState(false);
  const isHost = state.role === "HOST";
  const isSpinning = state.status === "SPINNING";

  useEffect(() => {
    if (isSaved) saveRoom(window.localStorage, state);
  }, [isSaved, state.code, state.expiresAt, state.role, state.title]);
  useEffect(() => {
    if (exitReason) removeSavedRoom(window.localStorage, code);
  }, [code, exitReason]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 2_500);
    return () => clearTimeout(timer);
  }, [notice]);

  const statusText = useMemo(() => {
    if (!connected) return t("reconnecting");
    if (isSpinning) return t("wheelSpinning");
    return state.canSpin ? t("ready") : t("waitingHost");
  }, [connected, isSpinning, state.canSpin, t]);

  if (exitReason) {
    return <RemovedFromRoomScreen reason={exitReason} onHome={onExit} />;
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
            {(isHost || state.canSpin) && (
              <b>{isHost ? t("hostBadge") : t("spinnerBadge")}</b>
            )}
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

      {!isSaved && !savePromptDismissed && (
        <SaveRoomPrompt
          onSave={() => {
            saveRoom(window.localStorage, state);
            setIsSaved(true);
            setNotice(t("roomSaved"));
          }}
          onDismiss={() => setSavePromptDismissed(true)}
        />
      )}

      <section className="room-workspace">
        <section className="wheel-section">
          <div className="section-heading room-heading">
            <p className="eyebrow">{isHost ? t("hostControls") : t("sharedWheel")}</p>
            {isHost ? (
              <EditableRoomTitle
                value={state.title}
                label={t("titleLabel")}
                editLabel={t("editTitle")}
                onSave={(title) => command("room.updateTitle", { title })}
              />
            ) : (
              <h1>{state.title}</h1>
            )}
            <p>{isHost ? t("hostLead") : t("guestLead")}</p>
          </div>

          <Wheel
            options={state.options}
            activeSpin={state.activeSpin}
            canceledSpinId={canceledSpinId}
            canSpin={
              state.canSpin && connected && !isSpinning && state.options.length >= 2
            }
            canControlSpin={state.canSpin}
            isHost={isHost}
            connected={connected}
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
            <TabButton active={tab === "settings"} onClick={() => setTab("settings")}>
              {t("settings")}
            </TabButton>
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
                proposals={state.myProposals}
                submit={(label) => command("proposal.create", { label })}
                update={(proposalId, label) =>
                  command("proposal.update", { proposalId, label })
                }
                remove={(proposalId) => command("proposal.remove", { proposalId })}
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
              onSetSpinPermission={(participantId, canSpin) =>
                command("participant.spinPermission", {
                  participantId,
                  canSpin,
                })
              }
            />
          )}

          {tab === "history" && <History state={state} />}

          {tab === "settings" && (
            <Settings
              code={state.code}
              isHost={isHost}
              hasPassword={state.hasPassword}
              disabled={isSpinning}
              update={(password) => command("room.updatePassword", { password })}
              onExit={onExit}
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
  proposals,
  submit,
  update,
  remove,
}: {
  connected: boolean;
  proposals: RoomState["myProposals"];
  submit: (label: string) => Promise<Ack>;
  update: (proposalId: string, label: string) => Promise<Ack>;
  remove: (proposalId: string) => Promise<Ack>;
}) {
  const { t } = useI18n();
  const [label, setLabel] = useState("");
  const [sent, setSent] = useState(false);
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!label.trim()) return;
    const result = await submit(label);
    if (result.ok) {
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
        <p className="form-hint privacy-input-hint">{t("privacyInputHint")}</p>
        <button className="primary-button" disabled={!connected}>
          <span>
            {sent ? t("sent") : connected ? t("proposeSlot") : t("reconnecting")}
          </span>
          <span className="button-arrow" aria-hidden="true">
            ↗
          </span>
        </button>
      </form>
      <div className="panel-divider" />
      <MyProposals
        proposals={proposals}
        connected={connected}
        onUpdate={update}
        onRemove={remove}
      />
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
    const confirmationKey = isHost ? "deleteRoomDataConfirm" : "deleteMyDataConfirm";
    if (!window.confirm(t(confirmationKey))) return;

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

  return (
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
                placeholder={hasPassword ? t("enterNewPassword") : t("createPassword")}
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
            onClick={() => void deleteData()}
          >
            {dataAction === "delete"
              ? t("deletingData")
              : t(isHost ? "deleteRoomData" : "deleteMyData")}
          </button>
        </div>
        {dataError && (
          <p className="form-error" role="alert">
            {dataError}
          </p>
        )}
      </div>
    </section>
  );
}
