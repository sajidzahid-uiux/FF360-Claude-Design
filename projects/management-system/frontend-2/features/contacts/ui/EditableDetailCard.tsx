"use client";

import { type ReactNode, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
} from "@fieldflow360/org-ui";
import { Pencil } from "lucide-react";

export interface EditableDetailCardProps {
  title: string;
  description?: string;
  canEdit?: boolean;
  isSaving?: boolean;
  /** Render the card body; receives whether the card is currently in edit mode. */
  children: (editing: boolean) => ReactNode;
  /** Persist this card's changes. Throw to keep the card in edit mode. */
  onSave: () => Promise<void> | void;
  /** Reset this card's draft back to the saved values. */
  onCancel?: () => void;
}

/**
 * A detail-page section rendered as a card that can be edited in place: a read
 * view with an "Edit" button that swaps to editable fields with Save / Cancel,
 * saving just this section.
 */
export function EditableDetailCard({
  title,
  description,
  canEdit = true,
  isSaving = false,
  children,
  onSave,
  onCancel,
}: EditableDetailCardProps) {
  const [editing, setEditing] = useState(false);

  const handleSave = async () => {
    try {
      await onSave();
      setEditing(false);
    } catch {
      // Keep editing open; the caller surfaces the error (toast/field errors).
    }
  };

  const handleCancel = () => {
    onCancel?.();
    setEditing(false);
  };

  return (
    <section className="border-border-subtle bg-bg-surface-elevated space-y-4 rounded-xl border p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-text-primary text-base font-semibold">{title}</h3>
          {description ? (
            <p className="text-text-muted mt-0.5 text-sm">{description}</p>
          ) : null}
        </div>

        {canEdit ? (
          <div className="flex shrink-0 items-center gap-2">
            {editing ? (
              <>
                <Button
                  aria-label="Cancel"
                  disabled={isSaving}
                  size={ComponentSizeEnum.SM}
                  title="Cancel"
                  variant={ButtonVariantEnum.SURFACE}
                  onClick={handleCancel}
                />
                <Button
                  aria-label="Save"
                  disabled={isSaving}
                  loading={isSaving}
                  size={ComponentSizeEnum.SM}
                  title="Save"
                  onClick={() => void handleSave()}
                />
              </>
            ) : (
              <Button
                aria-label={`Edit ${title}`}
                leftIcon={<Pencil aria-hidden className="h-4 w-4" strokeWidth={2} />}
                size={ComponentSizeEnum.SM}
                title="Edit"
                variant={ButtonVariantEnum.SURFACE}
                onClick={() => setEditing(true)}
              />
            )}
          </div>
        ) : null}
      </div>

      {children(editing)}
    </section>
  );
}
