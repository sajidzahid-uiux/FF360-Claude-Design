"use client";

import { useCallback, useState } from "react";

import { Button, ButtonVariantEnum, Textarea } from "@fieldflow360/org-ui";
import { useQueryClient } from "@tanstack/react-query";
import { formatDate } from "date-fns";
import { Pencil, Send, Trash2, X } from "lucide-react";

import { DesignRequestService } from "@/api/services";
import type { DesignRequestThreadItem } from "@/api/types/designRequest";
import { QUERY_KEYS } from "@/constants";

import { useDesignRequestPanelRequestId } from "../../../hooks/useDesignRequestPanelRequestId";
import { isDesignRequestThreadReadOnly } from "../../../lib/design-request-status";
import { validateNoteInput } from "../../../lib/validate-design-request-form";
import { useDesignRequestPanelScope } from "../../../model/design-request-panel-store";

export interface DesignRequestChatTabProps {
  notes: DesignRequestThreadItem[];
  canPost: boolean;
  requestStatus: string;
  loading: boolean;
}

export function DesignRequestChatTab({
  notes,
  canPost,
  requestStatus,
  loading,
}: DesignRequestChatTabProps) {
  const scope = useDesignRequestPanelScope();
  const queryClient = useQueryClient();
  const organizationId = scope?.organizationId;
  const requestId = useDesignRequestPanelRequestId();

  const [message, setMessage] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<number | null>(null);

  const readOnly = isDesignRequestThreadReadOnly(requestStatus);

  const refreshNotes = useCallback(() => {
    if (!organizationId || requestId == null) return;
    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.DESIGN_REQUEST_NOTES, organizationId, requestId],
    });
  }, [organizationId, queryClient, requestId]);

  const handleSend = useCallback(async () => {
    if (!organizationId || requestId == null) return;
    const validationError = validateNoteInput(message, null);
    if (validationError) {
      setError(validationError);
      return;
    }
    setPosting(true);
    setError(null);
    try {
      await DesignRequestService.createNote(organizationId, requestId, {
        body: message,
      });
      setMessage("");
      refreshNotes();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setPosting(false);
    }
  }, [message, organizationId, refreshNotes, requestId]);

  const handleStartEdit = useCallback((note: DesignRequestThreadItem) => {
    if (note.id == null) return;
    setEditingNoteId(note.id);
    setEditDraft(note.body);
    setError(null);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingNoteId(null);
    setEditDraft("");
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!organizationId || requestId == null || editingNoteId == null) return;
    const validationError = validateNoteInput(editDraft, null);
    if (validationError) {
      setError(validationError);
      return;
    }
    setSavingEdit(true);
    setError(null);
    try {
      await DesignRequestService.updateNote(
        organizationId,
        requestId,
        editingNoteId,
        editDraft
      );
      setEditingNoteId(null);
      setEditDraft("");
      refreshNotes();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update note.");
    } finally {
      setSavingEdit(false);
    }
  }, [editDraft, editingNoteId, organizationId, refreshNotes, requestId]);

  const handleDelete = useCallback(
    async (noteId: number) => {
      if (!organizationId || requestId == null) return;
      setDeletingNoteId(noteId);
      setError(null);
      try {
        await DesignRequestService.deleteNote(
          organizationId,
          requestId,
          noteId
        );
        if (editingNoteId === noteId) {
          handleCancelEdit();
        }
        refreshNotes();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to delete note.");
      } finally {
        setDeletingNoteId(null);
      }
    },
    [editingNoteId, handleCancelEdit, organizationId, refreshNotes, requestId]
  );

  const canSend = message.trim().length > 0;

  return (
    <div className="flex h-full min-h-[20rem] flex-col gap-4">
      <div className="bg-bg-surface border-border-subtle flex flex-1 flex-col gap-3 overflow-y-auto rounded-xl border p-3">
        {loading ? (
          <p className="text-text-muted text-sm">Loading messages…</p>
        ) : null}
        {!loading && notes.length === 0 ? (
          <p className="text-text-muted text-sm">No messages yet.</p>
        ) : null}
        {notes.map((note, index) => {
          const isCms = note.source === "cms";
          const key = note.id ?? `initial-${index}`;
          const isEditing = note.id != null && editingNoteId === note.id;

          const bubbleTone = isCms
            ? "border-accent/25 bg-accent/12 text-text-primary"
            : note.is_initial
              ? "border-border-subtle-strong bg-bg-surface text-text-primary border-dashed"
              : "border-border-subtle bg-bg-surface text-text-primary";

          return (
            <div
              key={key}
              className={`flex ${isCms ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl border px-4 py-2 text-sm ${bubbleTone}`}
              >
                {!isCms ? (
                  <p className="mb-1 text-[10px] font-medium opacity-80">
                    {note.posted_by_name}
                  </p>
                ) : null}
                {note.is_initial ? (
                  <p className="mb-1 text-[10px] font-semibold uppercase opacity-70">
                    Initial request
                  </p>
                ) : null}
                {isEditing ? (
                  <div className="space-y-2">
                    <Textarea
                      className="bg-bg-app text-text-primary min-h-[4rem]"
                      value={editDraft}
                      onChange={(e) => setEditDraft(e.target.value)}
                    />
                    <div className="flex justify-end gap-1">
                      <Button
                        iconOnly
                        aria-label="Cancel edit"
                        leftIcon={<X aria-hidden className="h-4 w-4" />}
                        variant={ButtonVariantEnum.GHOST}
                        onClick={handleCancelEdit}
                      />
                      <Button
                        iconOnly
                        aria-label="Save edit"
                        disabled={savingEdit}
                        leftIcon={<Send aria-hidden className="h-4 w-4" />}
                        loading={savingEdit}
                        variant={ButtonVariantEnum.ACCENT}
                        onClick={() => void handleSaveEdit()}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    {note.body ? (
                      <p className="whitespace-pre-wrap">{note.body}</p>
                    ) : null}
                    {note.file ? (
                      note.file.download_url ? (
                        <a
                          className="mt-1 block text-xs underline"
                          href={note.file.download_url}
                          rel="noreferrer"
                          target="_blank"
                        >
                          {note.file.original_filename}
                        </a>
                      ) : (
                        <span className="mt-1 block text-xs">
                          {note.file.original_filename}
                        </span>
                      )
                    ) : null}
                  </>
                )}
                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className="text-[10px] opacity-70">
                    {formatDate(new Date(note.created_at), "p")}
                    {note.is_edited ? " · edited" : ""}
                  </p>
                  {!isEditing && note.id != null ? (
                    <div className="flex gap-1">
                      {note.can_edit && note.body ? (
                        <button
                          aria-label="Edit note"
                          className="rounded p-0.5 opacity-70 hover:opacity-100"
                          type="button"
                          onClick={() => handleStartEdit(note)}
                        >
                          <Pencil aria-hidden className="h-3.5 w-3.5" />
                        </button>
                      ) : null}
                      {note.can_delete ? (
                        <button
                          aria-label="Delete note"
                          className="rounded p-0.5 opacity-70 hover:opacity-100 disabled:opacity-40"
                          disabled={deletingNoteId === note.id}
                          type="button"
                          onClick={() => void handleDelete(note.id!)}
                        >
                          <Trash2 aria-hidden className="h-3.5 w-3.5" />
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {canPost ? (
        <div className="bg-bg-surface border-border-subtle mt-auto flex items-center gap-2 rounded-xl border p-2">
          <Textarea
            className="min-h-[2.75rem] flex-1"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (error) setError(null);
            }}
          />
          <Button
            iconOnly
            aria-label="Send message"
            disabled={posting || !canSend}
            leftIcon={<Send aria-hidden className="h-4 w-4" />}
            loading={posting}
            variant={ButtonVariantEnum.ACCENT}
            onClick={() => void handleSend()}
          />
        </div>
      ) : readOnly ? (
        <p className="text-text-muted text-sm">
          This request is read-only. Existing notes and files remain available,
          but new posts are disabled.
        </p>
      ) : null}
    </div>
  );
}
