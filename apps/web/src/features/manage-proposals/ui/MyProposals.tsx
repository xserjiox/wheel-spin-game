import { type FormEvent, useEffect, useState } from "react";
import type { Ack, RoomProposal } from "@/entities/room";
import { useI18n } from "@/shared/lib/i18n";

export function MyProposals({
  proposals,
  connected,
  onUpdate,
  onRemove,
}: {
  proposals: RoomProposal[];
  connected: boolean;
  onUpdate: (proposalId: string, label: string) => Promise<Ack>;
  onRemove: (proposalId: string) => Promise<Ack>;
}) {
  const { t } = useI18n();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (editingId && !proposals.some((proposal) => proposal.id === editingId)) {
      setEditingId(null);
      setDraft("");
    }
  }, [editingId, proposals]);

  const edit = (proposal: RoomProposal) => {
    setEditingId(proposal.id);
    setDraft(proposal.label);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft("");
  };

  const submitEdit = async (event: FormEvent, proposalId: string) => {
    event.preventDefault();
    if (!draft.trim()) return;
    setSaving(true);
    const result = await onUpdate(proposalId, draft);
    setSaving(false);
    if (result.ok) cancelEdit();
  };

  const remove = async (proposalId: string) => {
    setRemovingId(proposalId);
    await onRemove(proposalId);
    setRemovingId(null);
  };

  return (
    <section className="my-proposals">
      <div className="my-proposals-heading">
        <div>
          <p className="step-label">{t("pendingIdeas")}</p>
          <h3>{t("myIdeas")}</h3>
        </div>
        <span className="count-badge">{proposals.length}</span>
      </div>

      {proposals.length === 0 ? (
        <p className="my-proposals-empty">{t("noOwnIdeas")}</p>
      ) : (
        <div className="my-proposals-list">
          {proposals.map((proposal) =>
            editingId === proposal.id ? (
              <form
                className="my-proposal-edit"
                key={proposal.id}
                onSubmit={(event) => void submitEdit(event, proposal.id)}
              >
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  maxLength={80}
                  disabled={!connected || saving}
                  aria-label={t("editIdeaNamed", { idea: proposal.label })}
                  autoFocus
                  required
                />
                <div>
                  <button className="my-proposal-save" disabled={!connected || saving}>
                    {saving ? t("saving") : t("saveIdea")}
                  </button>
                  <button
                    className="my-proposal-cancel"
                    type="button"
                    disabled={saving}
                    onClick={cancelEdit}
                  >
                    {t("cancel")}
                  </button>
                </div>
              </form>
            ) : (
              <article className="my-proposal-card" key={proposal.id}>
                <p>{proposal.label}</p>
                <div>
                  <button
                    type="button"
                    disabled={!connected || removingId !== null}
                    onClick={() => edit(proposal)}
                  >
                    {t("editIdea")}
                  </button>
                  <button
                    className="my-proposal-delete"
                    type="button"
                    disabled={!connected || removingId !== null}
                    onClick={() => void remove(proposal.id)}
                    aria-label={t("deleteIdeaNamed", { idea: proposal.label })}
                  >
                    {removingId === proposal.id ? t("removingIdea") : t("deleteIdea")}
                  </button>
                </div>
              </article>
            ),
          )}
        </div>
      )}
    </section>
  );
}
