import { type FormEvent, useEffect, useId, useState } from "react";
import { type WheelTemplate, useWheelTemplates } from "@/entities/wheel-template";
import { useI18n } from "@/shared/lib/i18n";

export function WheelTemplatePicker({
  onTemplateChange,
}: {
  onTemplateChange: (template: WheelTemplate | null) => void;
}) {
  const { templates, rename, remove } = useWheelTemplates();
  const { t } = useI18n();
  const [selectedId, setSelectedId] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const listboxId = useId();
  const selected = templates.find((template) => template.id === selectedId);
  const selectedLabel = selected
    ? `${selected.name} · ${t("slotCount", { count: selected.options.length })}`
    : t("defaultSlots");

  useEffect(() => {
    if (selectedId && !selected) {
      setSelectedId("");
      setRenaming(false);
      onTemplateChange(null);
    }
  }, [onTemplateChange, selected, selectedId]);

  const selectTemplate = (id: string) => {
    setSelectedId(id);
    setRenaming(false);
    setOpen(false);
    onTemplateChange(templates.find((template) => template.id === id) ?? null);
  };

  const submitRename = (event: FormEvent) => {
    event.preventDefault();
    if (!selected || !name.trim()) return;
    rename(selected.id, name);
    setRenaming(false);
  };

  const deleteSelected = () => {
    if (!selected || !window.confirm(t("deleteTemplateConfirm"))) return;
    remove(selected.id);
    setSelectedId("");
    setRenaming(false);
    onTemplateChange(null);
  };

  return (
    <div className="template-picker">
      <div className="field-label-row">
        <span>{t("savedSlots")}</span>
        <span className="optional">{t("optional")}</span>
      </div>
      <div
        className="template-picker-control"
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
      >
        <button
          className="template-picker-trigger"
          type="button"
          role="combobox"
          aria-label={`${t("savedSlots")} ${t("optional")}`}
          aria-controls={listboxId}
          aria-expanded={open}
          aria-haspopup="listbox"
          onClick={() => setOpen((current) => !current)}
        >
          <span>{selectedLabel}</span>
          <svg
            className={`template-picker-chevron ${open ? "open" : ""}`}
            aria-hidden="true"
            viewBox="0 0 16 16"
            focusable="false"
          >
            <path d="m3 5.5 5 5 5-5" />
          </svg>
        </button>
        {open && (
          <div
            id={listboxId}
            className="template-picker-options"
            role="listbox"
            aria-label={t("savedSlots")}
          >
            <button
              className="template-picker-option"
              type="button"
              role="option"
              aria-selected={!selectedId}
              onClick={() => selectTemplate("")}
            >
              <span>{t("defaultSlots")}</span>
              {!selectedId && <span aria-hidden="true">✓</span>}
            </button>
            {templates.map((template) => (
              <button
                className="template-picker-option"
                key={template.id}
                type="button"
                role="option"
                aria-selected={template.id === selectedId}
                onClick={() => selectTemplate(template.id)}
              >
                <span>{template.name}</span>
                <small>{t("slotCount", { count: template.options.length })}</small>
                {template.id === selectedId && <span aria-hidden="true">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && !renaming && (
        <div className="template-picker-actions">
          <button
            type="button"
            onClick={() => {
              setName(selected.name);
              setRenaming(true);
            }}
          >
            {t("renameTemplate")}
          </button>
          <button type="button" onClick={deleteSelected}>
            {t("deleteTemplate")}
          </button>
        </div>
      )}

      {selected && renaming && (
        <form className="template-rename-form" onSubmit={submitRename}>
          <input
            value={name}
            maxLength={60}
            aria-label={t("templateName")}
            onChange={(event) => setName(event.target.value)}
            autoFocus
            required
          />
          <button>{t("saveName")}</button>
          <button type="button" onClick={() => setRenaming(false)}>
            {t("cancel")}
          </button>
        </form>
      )}

      <p>{t("templatesLocalHint")}</p>
    </div>
  );
}
