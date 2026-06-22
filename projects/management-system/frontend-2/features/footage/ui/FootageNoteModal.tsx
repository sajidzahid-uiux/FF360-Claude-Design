"use client";

import { FormEvent, useEffect, useState } from "react";

import { AppFormModal, cn } from "@fieldflow360/org-ui";

import type { FormattedFootageData } from "@/api/types";
import { NotesMentionTextarea } from "@/shared/ui";

export interface FootageNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  row: FormattedFootageData;
  readOnly?: boolean;
  isSaving?: boolean;
  onSave: (value: string) => void | Promise<void>;
}

export function FootageNoteModal({
  isOpen,
  onClose,
  row,
  readOnly = false,
  isSaving = false,
  onSave,
}: FootageNoteModalProps) {
  const [draft, setDraft] = useState(row.note ?? "");

  useEffect(() => {
    if (isOpen) {
      setDraft(row.note ?? "");
    }
  }, [isOpen, row.note]);

  const title = readOnly ? "View note" : row.note ? "Edit note" : "Add note";

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (readOnly) {
      onClose();
      return;
    }
    void onSave(draft.trim());
  };

  return (
    <AppFormModal
      cancelLabel="Cancel"
      isOpen={isOpen}
      isSubmitting={isSaving}
      showCancel={!readOnly}
      submitDisabled={!readOnly && !draft.trim()}
      submitLabel={readOnly ? "Close" : "Save note"}
      title={title}
      width={560}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <div className="flex min-w-0 flex-col gap-4">
        <p className="text-text-muted text-sm">
          <span className="text-text-primary font-medium">{row.name}</span>
        </p>
        {readOnly ? (
          <p
            className={cn(
              "text-text-primary border-border-subtle bg-bg-app min-h-[120px] rounded-xl border px-4 py-3 text-sm whitespace-pre-wrap",
              !row.note && "text-text-muted italic"
            )}
          >
            {row.note || "No note"}
          </p>
        ) : (
          <div className="bg-bg-app focus-within:border-accent/40 focus-within:ring-accent/20 min-w-0 overflow-hidden rounded-xl shadow-sm focus-within:ring-2">
            <NotesMentionTextarea
              className="px-3 py-3"
              disabled={isSaving}
              placeholder="Add a note for this job…"
              rows={5}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
          </div>
        )}
      </div>
    </AppFormModal>
  );
}
