import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Ack } from "@/entities/room";

export function EditableRoomTitle({
  value,
  label,
  editLabel,
  onSave,
}: {
  value: string;
  label: string;
  editLabel: string;
  onSave: (value: string) => Promise<Ack>;
}) {
  const [draft, setDraft] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const cancelEditRef = useRef(false);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (!isEditing || !editorRef.current) return;
    const editor = editorRef.current;
    editor.focus();
    editor.setSelectionRange(editor.value.length, editor.value.length);
  }, [isEditing]);

  useLayoutEffect(() => {
    if (!isEditing || !editorRef.current) return;
    const editor = editorRef.current;
    editor.style.height = "0";
    editor.style.height = `${editor.scrollHeight}px`;
  }, [draft, isEditing]);

  const finishEditing = async () => {
    const nextTitle = draft.trim();
    setIsEditing(false);

    if (!nextTitle) {
      setDraft(value);
      return;
    }

    setDraft(nextTitle);
    if (nextTitle === value) return;

    const result = await onSave(nextTitle);
    if (!result.ok) setDraft(value);
  };

  if (!isEditing) {
    return (
      <div className="editable-room-title">
        <h1>{draft}</h1>
        <button
          className="title-edit-button"
          type="button"
          aria-label={editLabel}
          title={editLabel}
          onClick={() => {
            setDraft(value);
            setIsEditing(true);
          }}
        >
          <span aria-hidden="true">✎</span>
        </button>
      </div>
    );
  }

  return (
    <form
      className="inline-title-form"
      onSubmit={(event) => {
        event.preventDefault();
        void finishEditing();
      }}
    >
      <textarea
        ref={editorRef}
        aria-label={label}
        value={draft}
        rows={1}
        maxLength={60}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => {
          if (cancelEditRef.current) {
            cancelEditRef.current = false;
            setDraft(value);
            setIsEditing(false);
            return;
          }
          void finishEditing();
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            cancelEditRef.current = true;
            event.currentTarget.blur();
            return;
          }
          if (event.key === "Enter") {
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
          }
        }}
      />
    </form>
  );
}
