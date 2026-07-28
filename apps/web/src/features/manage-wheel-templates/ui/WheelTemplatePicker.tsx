import { type FormEvent, useEffect, useState } from "react";
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
  const selected = templates.find((template) => template.id === selectedId);

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
      <label>
        {t("savedSlots")} <span className="optional">{t("optional")}</span>
        <select
          value={selectedId}
          onChange={(event) => selectTemplate(event.target.value)}
        >
          <option value="">{t("defaultSlots")}</option>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name} · {t("slotCount", { count: template.options.length })}
            </option>
          ))}
        </select>
      </label>

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
