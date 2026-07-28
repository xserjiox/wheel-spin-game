import { type FormEvent, useEffect, useState } from "react";
import { useWheelTemplates, WheelTemplateError } from "@/entities/wheel-template";
import { useI18n } from "@/shared/lib/i18n";

export function SaveWheelTemplate({
  title,
  options,
  onStatus,
}: {
  title: string;
  options: string[];
  onStatus: (message: string) => void;
}) {
  const { create } = useWheelTemplates();
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState(title);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!expanded) setName(title);
  }, [expanded, title]);

  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || saving) return;
    setSaving(true);

    try {
      const template = create(name, options);
      onStatus(t("templateSaved", { name: template.name }));
      setExpanded(false);
    } catch (error) {
      onStatus(
        error instanceof WheelTemplateError && error.code === "TEMPLATE_LIMIT"
          ? t("templateLimitReached")
          : t("templateSaveFailed"),
      );
    } finally {
      setSaving(false);
    }
  };

  if (!expanded) {
    return (
      <button
        className="template-save-trigger"
        type="button"
        disabled={options.length < 2}
        onClick={() => setExpanded(true)}
      >
        <span aria-hidden="true">＋</span>
        {t("saveSlots")}
      </button>
    );
  }

  return (
    <form className="template-save-form" onSubmit={save}>
      <label>
        <span>{t("templateName")}</span>
        <input
          value={name}
          maxLength={60}
          onChange={(event) => setName(event.target.value)}
          autoFocus
          required
        />
      </label>
      <div>
        <button className="template-confirm-button" disabled={saving}>
          {saving ? t("saving") : t("saveTemplate")}
        </button>
        <button
          className="template-cancel-button"
          type="button"
          onClick={() => setExpanded(false)}
        >
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}
