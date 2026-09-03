import {
  type CSSProperties,
  type FormEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  type Ack,
  getOptionChanceMaximum,
  getOptionProbability,
  MIN_OPTION_CHANCE,
  type Option,
  type RoomState,
  useRoom,
  Wheel,
} from "@/entities/room";
import { trackAnalyticsEvent } from "@/shared/lib/analytics";
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
import { useI18n } from "@/shared/lib/i18n";
import { Brand } from "@/shared/ui/brand";
import { EditableRoomTitle } from "./EditableRoomTitle";
import { RoomSettings } from "./RoomSettings";

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
  const availableOptions = useMemo(
    () => state.options.filter((option) => !option.excluded),
    [state.options],
  );

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
    const result = await command("spin.start", {
      requestId: crypto.randomUUID(),
      durationMs: durationSeconds * 1_000,
    });
    if (result.ok) trackAnalyticsEvent("spin_start");
  };

  const cancelSpin = async () => {
    await command("spin.cancel", {});
  };

  const updateSelectionMode = async (selectionMode: RoomState["selectionMode"]) => {
    const result = await command("room.updateSelectionMode", { selectionMode });
    if (result.ok && selectionMode === "ELIMINATION") {
      trackAnalyticsEvent("elimination_enable");
    }
  };

  const resetRound = async () => {
    const result = await command("round.reset", {});
    if (result.ok) trackAnalyticsEvent("round_reset");
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
            onCopied={() => {
              trackAnalyticsEvent("share_room", {
                role: isHost ? "host" : "guest",
                method: "copy_link",
              });
              setNotice(t("copied"));
            }}
            onCopyError={() => {
              trackAnalyticsEvent("share_room_failed", {
                role: isHost ? "host" : "guest",
                method: "copy_link",
              });
              setNotice(t("copyFailed"));
            }}
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
            options={availableOptions}
            activeSpin={state.activeSpin}
            canceledSpinId={canceledSpinId}
            canSpin={
              state.canSpin && connected && !isSpinning && availableOptions.length >= 2
            }
            canControlSpin={state.canSpin}
            isHost={isHost}
            connected={connected}
            onSpin={run}
          />

          {state.selectionMode === "ELIMINATION" && (
            <div className="available-summary" aria-live="polite">
              <span aria-hidden="true">↻</span>
              {t("availableChoices", {
                available: availableOptions.length,
                total: state.options.length,
              })}
            </div>
          )}

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
            selectionMode={state.selectionMode}
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
                updateChance={(optionId, chance) =>
                  command("option.updateChance", { optionId, chance })
                }
                remove={(optionId) => command("option.remove", { optionId })}
                restore={(optionId) => command("option.restore", { optionId })}
                updateSelectionMode={updateSelectionMode}
                resetRound={resetRound}
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
            <RoomSettings
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
  updateChance,
  remove,
  restore,
  updateSelectionMode,
  resetRound,
  spin,
  cancelSpin,
}: {
  state: RoomState;
  disabled: boolean;
  connected: boolean;
  duration: string;
  setDuration: (duration: string) => void;
  add: (label: string) => Promise<unknown>;
  updateChance: (id: string, chance: number) => Promise<unknown>;
  remove: (id: string) => Promise<unknown>;
  restore: (id: string) => Promise<unknown>;
  updateSelectionMode: (mode: RoomState["selectionMode"]) => Promise<void>;
  resetRound: () => Promise<void>;
  spin: () => Promise<void>;
  cancelSpin: () => Promise<void>;
}) {
  const { t } = useI18n();
  const [label, setLabel] = useState("");
  const availableOptions = state.options.filter((option) => !option.excluded);
  const excludedCount = state.options.length - availableOptions.length;
  const choiceCountLabel =
    state.selectionMode === "ELIMINATION"
      ? t("availableChoices", {
          available: availableOptions.length,
          total: state.options.length,
        })
      : t("slotCount", { count: state.options.length });
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
        <span
          className="count-badge"
          aria-label={choiceCountLabel}
          title={choiceCountLabel}
        >
          {state.selectionMode === "ELIMINATION"
            ? `${availableOptions.length}/${state.options.length}`
            : state.options.length}
        </span>
      </div>
      <div className="selection-mode-control">
        <div className="selection-mode-heading">
          <strong>{t("selectionMode")}</strong>
          <span>
            {state.selectionMode === "ELIMINATION"
              ? t("noRepeatsDescription")
              : t("repeatsDescription")}
          </span>
        </div>
        <div
          className="selection-mode-buttons"
          role="group"
          aria-label={t("selectionMode")}
        >
          <button
            className={state.selectionMode === "REPEAT" ? "active" : ""}
            type="button"
            disabled={disabled || !connected}
            aria-pressed={state.selectionMode === "REPEAT"}
            onClick={() => {
              if (state.selectionMode !== "REPEAT") {
                void updateSelectionMode("REPEAT");
              }
            }}
          >
            {t("repeatsShort")}
          </button>
          <button
            className={state.selectionMode === "ELIMINATION" ? "active" : ""}
            type="button"
            disabled={disabled || !connected}
            aria-pressed={state.selectionMode === "ELIMINATION"}
            onClick={() => {
              if (state.selectionMode !== "ELIMINATION") {
                void updateSelectionMode("ELIMINATION");
              }
            }}
          >
            {t("noRepeatsShort")}
          </button>
        </div>
        {state.selectionMode === "ELIMINATION" && excludedCount > 0 && (
          <button
            className="round-reset-button"
            type="button"
            disabled={disabled || !connected}
            onClick={() => void resetRound()}
          >
            <span aria-hidden="true">↺</span>
            {t("startNewRound")}
          </button>
        )}
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
      <p className="weight-chance-hint">
        <span aria-hidden="true">i</span>
        {t("weightChanceHint")}
      </p>
      <div className="options-list">
        {state.options.map((option, index) => {
          const chance = option.excluded
            ? 0
            : getOptionProbability(option, availableOptions);

          return (
            <div
              className={`option-row ${option.excluded ? "excluded" : ""}`}
              key={option.id}
            >
              <span className={`option-color color-${index % 7}`} />
              <div className="option-main">
                <div className="option-heading">
                  <span className="option-name">{option.label}</span>
                </div>
                <OptionChanceControl
                  option={option}
                  chance={chance}
                  maxChance={getOptionChanceMaximum(availableOptions)}
                  equalChance={
                    availableOptions.length > 0 ? 100 / availableOptions.length : 100
                  }
                  disabled={disabled || !connected || availableOptions.length < 2}
                  updateChance={updateChance}
                />
              </div>
              <div className="option-actions">
                {option.excluded && (
                  <button
                    className="restore-option"
                    type="button"
                    disabled={disabled || !connected}
                    onClick={() => void restore(option.id)}
                    aria-label={t("restoreNamed", { name: option.label })}
                    title={t("restoreChoice")}
                  >
                    ↺
                  </button>
                )}
                <button
                  className="remove-option"
                  type="button"
                  disabled={disabled}
                  onClick={() => void remove(option.id)}
                  aria-label={t("removeNamed", { name: option.label })}
                  title={t("removeNamed", { name: option.label })}
                >
                  ×
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {availableOptions.length < 2 && <p className="probability">{t("addTwo")}</p>}
      <div className="panel-divider" />
      <SpinControls
        duration={duration}
        isSpinning={disabled}
        connected={connected}
        hasEnoughOptions={availableOptions.length >= 2}
        setDuration={setDuration}
        onSpin={() => void spin()}
        onCancel={() => void cancelSpin()}
      />
    </section>
  );
}

export function OptionChanceControl({
  option,
  chance,
  maxChance,
  equalChance,
  disabled,
  updateChance,
}: {
  option: Option;
  chance: number;
  maxChance: number;
  equalChance: number;
  disabled: boolean;
  updateChance: (id: string, chance: number) => Promise<unknown>;
}) {
  const { localeTag, t } = useI18n();
  const formatChance = (value: number) =>
    value.toLocaleString(localeTag, { maximumFractionDigits: 1 });
  const roundChance = (value: number) => Math.round(value * 10) / 10;
  const controlsId = useId();
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState(() => formatChance(chance));
  const timerRef = useRef<number | null>(null);
  const chanceDisabled =
    disabled || option.excluded === true || maxChance <= MIN_OPTION_CHANCE;

  useEffect(() => {
    setDraft(formatChance(chance));
  }, [chance, localeTag]);

  useEffect(() => {
    if (option.excluded) setExpanded(false);
  }, [option.excluded]);

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const parseChance = (value: string) => {
    const normalized = value.trim().replace(",", ".");
    if (!/^\d+(?:\.\d{0,1})?$/.test(normalized)) return null;
    const valueAsNumber = Number(normalized);
    return valueAsNumber >= MIN_OPTION_CHANCE && valueAsNumber <= maxChance
      ? roundChance(valueAsNumber)
      : null;
  };

  const commit = async (nextChance: number) => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    setDraft(formatChance(nextChance));
    if (Math.abs(nextChance - chance) < 0.05) return;
    const result = (await updateChance(option.id, nextChance)) as { ok?: boolean };
    if (result.ok === false) setDraft(formatChance(chance));
  };

  const scheduleCommit = (nextChance: number) => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => void commit(nextChance), 180);
  };

  const applySliderChance = (nextChance: number) => {
    const clamped = Math.min(
      maxChance,
      Math.max(MIN_OPTION_CHANCE, roundChance(nextChance)),
    );
    setDraft(formatChance(clamped));
    scheduleCommit(clamped);
  };

  const parsedDraft = parseChance(draft);
  const sliderValue = parsedDraft ?? chance;
  const sliderProgress =
    maxChance === MIN_OPTION_CHANCE
      ? 100
      : ((sliderValue - MIN_OPTION_CHANCE) / (maxChance - MIN_OPTION_CHANCE)) * 100;
  const label = t("chanceFor", {
    name: option.label,
    value: formatChance(chance),
  });
  const isEqualChance = Math.abs(chance - equalChance) < 0.05;

  const chanceInput = (
    <span className="option-chance-value">
      <input
        type="text"
        inputMode="decimal"
        value={draft}
        disabled={chanceDisabled}
        aria-label={label}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => {
          const nextChance = parseChance(draft);
          if (nextChance === null) setDraft(formatChance(chance));
          else void commit(nextChance);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
          if (event.key === "Escape") {
            setDraft(formatChance(chance));
            event.currentTarget.blur();
          }
        }}
      />
      <span aria-hidden="true">%</span>
    </span>
  );

  return (
    <div className={`option-chance-editor ${expanded ? "expanded" : ""}`}>
      {expanded ? (
        <div className="option-chance-direct-editor">
          <label className="option-chance-input">
            <span>{t("chanceShort")}</span>
            {chanceInput}
          </label>
          <button
            className="option-chance-collapse"
            type="button"
            disabled={chanceDisabled}
            aria-expanded="true"
            aria-controls={controlsId}
            aria-label={t("hideWeightEditorFor", { name: option.label })}
            onClick={() => setExpanded(false)}
          >
            <span className="option-chance-chevron" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <button
          className="option-chance-toggle"
          type="button"
          disabled={chanceDisabled}
          aria-expanded="false"
          aria-controls={controlsId}
          aria-label={t("showWeightEditorFor", { name: option.label })}
          onClick={() => setExpanded(true)}
        >
          <span>{t("chanceShort")}</span>
          <strong>{formatChance(chance)}%</strong>
          <span className="option-chance-chevron" aria-hidden="true" />
        </button>
      )}
      {expanded && (
        <div className="option-chance-control" id={controlsId}>
          <input
            className="option-chance-slider"
            type="range"
            min={MIN_OPTION_CHANCE}
            max={maxChance}
            step="0.1"
            value={sliderValue}
            style={
              {
                "--chance-progress": `${sliderProgress}%`,
              } as CSSProperties
            }
            disabled={chanceDisabled}
            aria-label={label}
            onChange={(event) => applySliderChance(Number(event.target.value))}
            onPointerUp={() => {
              const value = parseChance(draft);
              if (value !== null) void commit(value);
            }}
            onKeyDown={(event) => {
              if (
                !["ArrowLeft", "ArrowDown", "ArrowRight", "ArrowUp"].includes(event.key)
              ) {
                return;
              }
              event.preventDefault();
              const direction = ["ArrowRight", "ArrowUp"].includes(event.key) ? 1 : -1;
              const step = event.shiftKey ? 1 : 0.1;
              applySliderChance(sliderValue + direction * step);
            }}
          />
          <div className="option-chance-scale">
            <span>
              {t("chanceMinimum", { value: formatChance(MIN_OPTION_CHANCE) })}
            </span>
            <button
              className="reset-option-chance"
              type="button"
              disabled={chanceDisabled || isEqualChance}
              aria-label={t("resetWeightFor", { name: option.label })}
              title={t("resetWeight")}
              onClick={() => void commit(roundChance(equalChance))}
            >
              {t("equalChanceShort")}
            </button>
            <span>{t("chanceMaximum", { value: formatChance(maxChance) })}</span>
          </div>
        </div>
      )}
    </div>
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
