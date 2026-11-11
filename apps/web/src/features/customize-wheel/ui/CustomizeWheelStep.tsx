import {
  type ClipboardEvent,
  type KeyboardEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { getWheelPresets } from "@/entities/wheel-template";
import { translateError, useI18n } from "@/shared/lib/i18n";
import {
  cleanOption,
  MAX_OPTION_LENGTH,
  MAX_WHEEL_OPTIONS,
  NO_REPEAT_SUGGESTION_THRESHOLD,
  reviewOptions,
  splitPastedList,
} from "../model/parse-option-list";

export type CustomizeWheelResult = { ok: true } | { ok: false; error: string };

type QuickSet = "names" | "food" | "yesNo" | "tasks";
type Row = { id: number; value: string };
type FocusRequest = { id: number; part: "input" | "remove" };

// Enough empty fields for a small group without making the step look like a long form.
const STARTING_FIELDS = 4;

let nextRowId = 0;
const createRows = (values: string[]): Row[] =>
  values.map((value) => ({ id: nextRowId++, value }));
const emptyRows = () => createRows(Array<string>(STARTING_FIELDS).fill(""));

function focusRow(list: HTMLElement | null, { id, part }: FocusRequest) {
  const field = list?.querySelector<HTMLElement>(
    `[data-row="${id}"] ${part === "input" ? "input" : "button"}`,
  );
  if (!field) return;
  field.focus();
  if (field instanceof HTMLInputElement) {
    field.setSelectionRange(field.value.length, field.value.length);
  }
}

export function CustomizeWheelStep({
  titleId,
  onApply,
  onSkip,
}: {
  titleId: string;
  onApply: (options: string[], noRepeats: boolean) => Promise<CustomizeWheelResult>;
  onSkip: () => void;
}) {
  const { locale, t } = useI18n();
  const listLabelId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const focusRequest = useRef<FocusRequest | null>(null);
  const [rows, setRows] = useState<Row[]>(emptyRows);
  const [truncated, setTruncated] = useState(false);
  const [noRepeats, setNoRepeats] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { options, duplicates, wheelPositions } = useMemo(
    () => reviewOptions(rows.map((row) => row.value)),
    [rows],
  );
  const suggestNoRepeats = options.length >= NO_REPEAT_SUGGESTION_THRESHOLD;
  const sampleNames = t("sampleNames").split("\n");

  // Focus can only move once React has rendered the field it points to.
  useEffect(() => {
    if (!focusRequest.current) return;
    focusRow(listRef.current, focusRequest.current);
    focusRequest.current = null;
  }, [rows]);

  const updateRows = (next: Row[], focus?: FocusRequest) => {
    focusRequest.current = focus ?? null;
    setRows(next);
    setError("");
  };

  const changeRow = (index: number, value: string) =>
    updateRows(
      rows.map((row, position) => (position === index ? { ...row, value } : row)),
    );

  const insertRowAfter = (index: number) => {
    const [row] = createRows([""]);
    updateRows([...rows.slice(0, index + 1), row, ...rows.slice(index + 1)], {
      id: row.id,
      part: "input",
    });
  };

  const removeRow = (index: number, focusPart: FocusRequest["part"]) => {
    if (rows.length === 1) {
      updateRows([{ ...rows[0], value: "" }], { id: rows[0].id, part: "input" });
      return;
    }
    // Backspace walks up the list like in a text editor; the × button hands focus to the next row.
    const neighbour =
      focusPart === "input"
        ? (rows[index - 1] ?? rows[index + 1])
        : (rows[index + 1] ?? rows[index - 1]);
    updateRows(
      rows.filter((_, position) => position !== index),
      { id: neighbour.id, part: focusPart },
    );
  };

  const addRow = () => {
    const last = rows[rows.length - 1];
    if (!last.value.trim()) focusRow(listRef.current, { id: last.id, part: "input" });
    else insertRowAfter(rows.length - 1);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    // Enter also confirms Japanese and Chinese input, which must not create a field.
    if (event.nativeEvent.isComposing) return;
    const row = rows[index];
    if (event.key === "Enter") {
      event.preventDefault();
      const next = rows[index + 1];
      if (next && !next.value.trim())
        focusRow(listRef.current, { id: next.id, part: "input" });
      else if (row.value.trim() && rows.length < MAX_WHEEL_OPTIONS)
        insertRowAfter(index);
      return;
    }
    if (event.key === "Backspace" && !row.value && rows.length > 1) {
      event.preventDefault();
      removeRow(index, "input");
      return;
    }
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      const neighbour = rows[index + (event.key === "ArrowUp" ? -1 : 1)];
      if (!neighbour) return;
      event.preventDefault();
      focusRow(listRef.current, { id: neighbour.id, part: "input" });
    }
  };

  const handlePaste = (index: number, event: ClipboardEvent<HTMLInputElement>) => {
    const text = event.clipboardData.getData("text");
    // A single line pastes natively, so the browser keeps the caret and the length limit.
    if (!/[\r\n\t]/.test(text)) return;
    event.preventDefault();
    const taken = new Set(
      rows.map((row) => cleanOption(row.value).toLocaleLowerCase()).filter(Boolean),
    );
    const pasted = splitPastedList(text).filter((option) => {
      const key = option.toLocaleLowerCase();
      if (taken.has(key)) return false;
      taken.add(key);
      return true;
    });
    if (!pasted.length) return;
    // Empty fields only exist to be typed into, so the pasted list takes their place.
    const filled = (list: Row[]) => list.filter((row) => row.value.trim());
    const before = filled(rows.slice(0, index + 1));
    const merged = [...before, ...createRows(pasted), ...filled(rows.slice(index + 1))];
    const kept = merged.slice(0, MAX_WHEEL_OPTIONS);
    setTruncated(merged.length > MAX_WHEEL_OPTIONS);
    const lastPasted = kept[Math.min(before.length + pasted.length, kept.length) - 1];
    updateRows(kept, { id: lastPasted.id, part: "input" });
  };

  const applyQuickSet = (quickSet: QuickSet) => {
    const lists: Record<QuickSet, string[]> = {
      // Names stay a placeholder example only: the host types or pastes the real ones.
      names: [],
      food:
        getWheelPresets(locale).find((preset) => preset.id === "where-to-eat")
          ?.options ?? [],
      yesNo: t("quickSetYesNoOptions").split("\n"),
      tasks: t("quickSetTasksOptions").split("\n"),
    };
    const next = lists[quickSet].length ? createRows(lists[quickSet]) : emptyRows();
    setTruncated(false);
    updateRows(
      next,
      quickSet === "names" ? { id: next[0].id, part: "input" } : undefined,
    );
  };

  const apply = async () => {
    if (options.length < 2 || busy) return;
    setBusy(true);
    setError("");
    const result = await onApply(options, suggestNoRepeats && noRepeats);
    if (!result.ok) {
      setError(translateError(result.error, t));
      setBusy(false);
    }
  };

  return (
    <div className="customize-step">
      <h2 id={titleId}>{t("customizeTitle")}</h2>
      <p className="invite-description">{t("customizeCopy")}</p>

      <div className="quick-sets" role="group" aria-label={t("quickSets")}>
        {(
          [
            ["names", "quickSetNames"],
            ["food", "quickSetFood"],
            ["yesNo", "quickSetYesNo"],
            ["tasks", "quickSetTasks"],
          ] as const
        ).map(([quickSet, labelKey]) => (
          <button key={quickSet} type="button" onClick={() => applyQuickSet(quickSet)}>
            {t(labelKey)}
          </button>
        ))}
      </div>

      <div className="option-fields" role="group" aria-labelledby={listLabelId}>
        <div className="option-fields-head">
          <span id={listLabelId}>{t("wheelOptionsLabel")}</span>
          <span aria-live="polite">{t("optionsCount", { count: options.length })}</span>
        </div>
        <ul className="option-fields-list" ref={listRef}>
          {rows.map((row, index) => {
            const label = t("optionFieldLabel", { n: index + 1 });
            const duplicate = duplicates[index];
            const position = wheelPositions[index];
            const noteId = `${listLabelId}-repeat-${row.id}`;
            return (
              <li
                key={row.id}
                className={`option-field${duplicate ? " is-duplicate" : ""}`}
                data-row={row.id}
              >
                <span
                  className={`option-color ${position === null ? "is-empty" : `color-${position % 7}`}`}
                  aria-hidden="true"
                />
                <span className="option-field-input">
                  <input
                    type="text"
                    value={row.value}
                    aria-label={label}
                    aria-invalid={duplicate || undefined}
                    aria-describedby={duplicate ? noteId : undefined}
                    placeholder={sampleNames[index] ?? ""}
                    maxLength={MAX_OPTION_LENGTH}
                    enterKeyHint="next"
                    autoComplete="off"
                    onChange={(event) => changeRow(index, event.target.value)}
                    onKeyDown={(event) => handleKeyDown(index, event)}
                    onPaste={(event) => handlePaste(index, event)}
                  />
                  {duplicate && (
                    <span className="option-field-note" id={noteId}>
                      {t("duplicateOption")}
                    </span>
                  )}
                </span>
                <button
                  className="remove-option"
                  type="button"
                  disabled={rows.length === 1 && !row.value}
                  aria-label={t("removeNamed", {
                    name: cleanOption(row.value) || label,
                  })}
                  title={t("removeNamed", { name: cleanOption(row.value) || label })}
                  onClick={() => removeRow(index, "remove")}
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>
        <button
          className="text-button option-fields-add"
          type="button"
          disabled={rows.length >= MAX_WHEEL_OPTIONS}
          onClick={addRow}
        >
          <span aria-hidden="true">+</span> {t("addOptionField")}
        </button>
        <p className="option-fields-hint">
          {t("pasteListHint")}
          {truncated && ` · ${t("optionsLimitNotice", { max: MAX_WHEEL_OPTIONS })}`}
        </p>
      </div>

      {suggestNoRepeats && (
        <label className="password-toggle customize-toggle">
          <input
            type="checkbox"
            checked={noRepeats}
            onChange={(event) => setNoRepeats(event.target.checked)}
          />
          <span className="sound-toggle-track" aria-hidden="true">
            <span />
          </span>
          <span>{t("noRepeatsEachOnce")}</span>
        </label>
      )}

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <button
        className="primary-button"
        type="button"
        disabled={options.length < 2 || busy}
        onClick={() => void apply()}
      >
        <span>{t("customizeDone")}</span>
        <span className="button-arrow" aria-hidden="true">
          ↗
        </span>
      </button>
      <button className="text-button customize-skip" type="button" onClick={onSkip}>
        {t("customizeSkip")}
      </button>
    </div>
  );
}
