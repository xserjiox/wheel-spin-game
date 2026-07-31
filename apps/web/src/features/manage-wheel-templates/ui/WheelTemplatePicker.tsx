import { type FormEvent, useEffect, useId, useMemo, useState } from "react";
import {
  getWheelPresetCategoryLabel,
  getWheelPresets,
  type WheelPreset,
  type WheelSetupSelection,
  type WheelTemplate,
  useWheelTemplates,
} from "@/entities/wheel-template";
import { trackAnalyticsEvent } from "@/shared/lib/analytics";
import { useI18n } from "@/shared/lib/i18n";

type SetupView = "quick" | "scenarios" | "templates";

export function WheelTemplatePicker({
  onTemplateChange,
}: {
  onTemplateChange: (selection: WheelSetupSelection | null) => void;
}) {
  const { templates, rename, remove } = useWheelTemplates();
  const { locale, t } = useI18n();
  const presets = useMemo(() => getWheelPresets(locale), [locale]);
  const headingId = useId();
  const [view, setView] = useState<SetupView>("quick");
  const [selected, setSelected] = useState<{
    source: "preset" | "template";
    id: string;
  } | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    if (!selected) return;

    if (selected.source === "preset") {
      const preset = presets.find((candidate) => candidate.id === selected.id);
      if (preset) onTemplateChange(toPresetSelection(preset));
      return;
    }

    const template = templates.find((candidate) => candidate.id === selected.id);
    if (template) {
      onTemplateChange(toTemplateSelection(template));
    } else {
      setSelected(null);
      setRenamingId(null);
      onTemplateChange(null);
    }
  }, [onTemplateChange, presets, selected, templates]);

  const chooseDefault = () => {
    setSelected(null);
    setRenamingId(null);
    onTemplateChange(null);
  };

  const choosePreset = (preset: WheelPreset) => {
    setSelected({ source: "preset", id: preset.id });
    setRenamingId(null);
    trackAnalyticsEvent("preset_select");
  };

  const chooseTemplate = (template: WheelTemplate) => {
    setSelected({ source: "template", id: template.id });
    setRenamingId(null);
    trackAnalyticsEvent("template_select");
  };

  const submitRename = (event: FormEvent, template: WheelTemplate) => {
    event.preventDefault();
    if (!name.trim()) return;
    rename(template.id, name);
    setRenamingId(null);
  };

  const deleteTemplate = (template: WheelTemplate) => {
    if (!window.confirm(t("deleteTemplateConfirm"))) return;
    remove(template.id);
    if (selected?.source === "template" && selected.id === template.id) {
      chooseDefault();
    }
  };

  return (
    <section className="wheel-setup-picker" aria-labelledby={headingId}>
      <div className="wheel-setup-heading">
        <div>
          <span id={headingId}>{t("wheelSetup")}</span>
          <p>{t("wheelSetupHint")}</p>
        </div>
        <span className="optional">{t("optional")}</span>
      </div>

      <div className="wheel-setup-tabs" role="tablist" aria-label={t("wheelSetup")}>
        <SetupTab active={view === "quick"} onClick={() => setView("quick")}>
          {t("quickSetup")}
        </SetupTab>
        <SetupTab active={view === "scenarios"} onClick={() => setView("scenarios")}>
          {t("readyScenarios")}
        </SetupTab>
        <SetupTab active={view === "templates"} onClick={() => setView("templates")}>
          {t("myTemplates")}
          {templates.length > 0 && <i>{templates.length}</i>}
        </SetupTab>
      </div>

      {view === "quick" && (
        <div className="wheel-setup-content">
          <button
            className={`wheel-setup-card ${selected ? "" : "selected"}`}
            type="button"
            aria-pressed={!selected}
            onClick={chooseDefault}
          >
            <span className="wheel-setup-card-icon" aria-hidden="true">
              ↻
            </span>
            <span>
              <strong>{t("quickWheel")}</strong>
              <small>{t("quickWheelCopy")}</small>
            </span>
            <b>{t("defaultSlots")}</b>
          </button>
        </div>
      )}

      {view === "scenarios" && (
        <div className="wheel-setup-content preset-grid">
          {presets.map((preset) => {
            const isSelected =
              selected?.source === "preset" && selected.id === preset.id;
            return (
              <button
                className={`preset-card ${isSelected ? "selected" : ""}`}
                type="button"
                key={preset.id}
                aria-pressed={isSelected}
                onClick={() => choosePreset(preset)}
              >
                <span className="preset-card-meta">
                  {getWheelPresetCategoryLabel(locale, preset.category)}
                  <i>
                    {preset.selectionMode === "ELIMINATION"
                      ? t("noRepeatsShort")
                      : t("repeatsShort")}
                  </i>
                </span>
                <strong>{preset.name}</strong>
                <small>{preset.description}</small>
                <span className="preset-card-count">
                  {t("choiceCount", { count: preset.options.length })}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {view === "templates" && (
        <div className="wheel-setup-content template-library">
          {templates.length === 0 ? (
            <div className="template-library-empty">
              <strong>{t("noTemplates")}</strong>
              <p>{t("noTemplatesCopy")}</p>
            </div>
          ) : (
            templates.map((template) => {
              const isSelected =
                selected?.source === "template" && selected.id === template.id;
              return (
                <article
                  className={`template-library-card ${isSelected ? "selected" : ""}`}
                  key={template.id}
                >
                  {renamingId === template.id ? (
                    <form onSubmit={(event) => submitRename(event, template)}>
                      <input
                        value={name}
                        maxLength={60}
                        aria-label={t("templateName")}
                        onChange={(event) => setName(event.target.value)}
                        autoFocus
                        required
                      />
                      <button>{t("saveName")}</button>
                      <button type="button" onClick={() => setRenamingId(null)}>
                        {t("cancel")}
                      </button>
                    </form>
                  ) : (
                    <>
                      <button
                        className="template-library-select"
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => chooseTemplate(template)}
                      >
                        <span>
                          <strong>{template.name}</strong>
                          <small>
                            {t("choiceCount", { count: template.options.length })}
                            {" · "}
                            {template.selectionMode === "ELIMINATION"
                              ? t("noRepeatsShort")
                              : t("repeatsShort")}
                          </small>
                        </span>
                        <b aria-hidden="true">{isSelected ? "✓" : "→"}</b>
                      </button>
                      <div className="template-library-actions">
                        <button
                          type="button"
                          onClick={() => {
                            setName(template.name);
                            setRenamingId(template.id);
                          }}
                        >
                          {t("renameTemplate")}
                        </button>
                        <button type="button" onClick={() => deleteTemplate(template)}>
                          {t("deleteTemplate")}
                        </button>
                      </div>
                    </>
                  )}
                </article>
              );
            })
          )}
          <p className="template-local-hint">{t("templatesLocalHint")}</p>
        </div>
      )}
    </section>
  );
}

function SetupTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      className={active ? "active" : ""}
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function toPresetSelection(preset: WheelPreset): WheelSetupSelection {
  return {
    id: preset.id,
    source: "preset",
    name: preset.name,
    roomTitle: preset.name,
    options: preset.options,
    selectionMode: preset.selectionMode,
  };
}

function toTemplateSelection(template: WheelTemplate): WheelSetupSelection {
  return {
    id: template.id,
    source: "template",
    name: template.name,
    roomTitle: template.roomTitle ?? template.name,
    options: template.options,
    selectionMode: template.selectionMode,
  };
}
