"use client";

import { useLayoutEffect, useRef, useState } from "react";

import {
  Avatar,
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  Pencil,
  Trash2,
  cn,
} from "@fieldflow360/org-ui";
import { Send } from "lucide-react";
import { toast } from "sonner";

import type {
  NoteComment,
  NoteCommentPatchPayload,
  TeamMember,
} from "@/api/types";
import { formatRelativeActivityDate } from "@/shared/lib";
import { getErrorMessage } from "@/utils/apiError";

import { MentionSuggestionsList } from "./MentionSuggestionsList";
import { NotesMentionTextarea } from "./NotesMentionTextarea";
import { useMentionTextarea } from "./useMentionTextarea";
import {
  NOTE_SECTION_BADGE_CLASS,
  getCommentAuthorInitials,
  getCommentAuthorName,
  getCommentAvatarUrl,
  getCommentSection,
  getSectionLabel,
} from "./utils";

export interface NotesCommentItemProps {
  comment: NoteComment;
  showSectionBadge: boolean;
  readOnly: boolean;
  members: TeamMember[] | undefined;
  patchComment: (
    id: number,
    payload: NoteCommentPatchPayload
  ) => Promise<NoteComment>;
  deleteComment: (id: number) => Promise<number>;
}

export function NotesCommentItem({
  comment,
  showSectionBadge,
  readOnly,
  members,
  patchComment,
  deleteComment,
}: NotesCommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingText, setEditingText] = useState("");
  const [editedMentionIds, setEditedMentionIds] = useState<number[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const {
    mentioning,
    mentionSuggestions,
    handleTextChange,
    applyMention,
    resetMentions,
  } = useMentionTextarea(members);

  const section = getCommentSection(comment);
  const authorName = getCommentAuthorName(comment);
  const avatarUrl = getCommentAvatarUrl(comment);

  useLayoutEffect(() => {
    if (!isEditing || !textareaRef.current) return;
    const el = textareaRef.current;
    el.style.overflow = "hidden";
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [editingText, isEditing]);

  const startEdit = () => {
    setEditingText(comment.text);
    setEditedMentionIds([]);
    resetMentions();
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingText("");
    setEditedMentionIds([]);
    resetMentions();
  };

  const saveEdit = async () => {
    if (!editingText.trim()) return;
    try {
      await patchComment(comment.id, {
        text: editingText,
        mentionIds: editedMentionIds,
      });
      cancelEdit();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to update comment"));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteComment(comment.id);
      toast.success("Comment deleted");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to delete comment"));
    }
  };

  const showActions = !readOnly && !isEditing;

  return (
    <article className="group flex gap-3">
      <Avatar
        alt={authorName}
        className="border-border-subtle mt-0.5 shrink-0 border shadow-sm"
        fallback={getCommentAuthorInitials(comment)}
        size={40}
        src={avatarUrl}
      />

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div
          className={cn(
            "border-border-subtle bg-bg-surface w-full rounded-xl border px-3.5 py-3 shadow-sm",
            "ring-border-subtle/60 group-hover:ring-accent/15 transition-shadow group-hover:ring-1"
          )}
        >
          <div className="mb-2 flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="text-text-primary truncate text-sm font-semibold">
                {authorName}
              </span>
              {showSectionBadge ? (
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase",
                    NOTE_SECTION_BADGE_CLASS[section]
                  )}
                >
                  {getSectionLabel(section)}
                </span>
              ) : null}
            </div>
            <time
              className="text-text-muted shrink-0 text-xs tabular-nums"
              dateTime={comment.created_at}
            >
              {formatRelativeActivityDate(comment.created_at)}
            </time>
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <div className="relative">
                <NotesMentionTextarea
                  ref={textareaRef}
                  className="min-h-[72px] resize-none"
                  rows={2}
                  value={editingText}
                  onChange={(e) => {
                    setEditingText(e.target.value);
                    handleTextChange(
                      e.target.value,
                      e.target.selectionStart ?? e.target.value.length
                    );
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void saveEdit();
                    }
                    if (e.key === "Escape") cancelEdit();
                  }}
                />
                {mentioning ? (
                  <MentionSuggestionsList
                    placement="below"
                    suggestions={mentionSuggestions}
                    onSelect={(m) => {
                      setEditingText(
                        applyMention(editingText, m.user.username, m.id)
                      );
                      setEditedMentionIds((prev) =>
                        prev.includes(m.id) ? prev : [...prev, m.id]
                      );
                    }}
                  />
                ) : null}
              </div>
              <div className="flex justify-end gap-1">
                <Button
                  aria-label="Cancel"
                  size={ComponentSizeEnum.SM}
                  title="Cancel"
                  variant={ButtonVariantEnum.GHOST}
                  onClick={cancelEdit}
                />
                <Button
                  disabled={!editingText.trim()}
                  leftIcon={<Send aria-hidden className="h-4 w-4" />}
                  size={ComponentSizeEnum.SM}
                  title="Save"
                  onClick={() => void saveEdit()}
                />
              </div>
            </div>
          ) : (
            <p className="text-text-primary text-sm leading-relaxed break-words whitespace-pre-line">
              {comment.text}
            </p>
          )}
        </div>

        {showActions ? (
          <div
            className={cn(
              "flex w-full items-center gap-1 pl-0.5",
              "opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
            )}
          >
            <Button
              leftIcon={<Pencil aria-hidden className="h-3.5 w-3.5" />}
              size={ComponentSizeEnum.SM}
              title="Edit"
              variant={ButtonVariantEnum.GHOST}
              onClick={startEdit}
            />
            <Button
              leftIcon={<Trash2 aria-hidden className="h-3.5 w-3.5" />}
              size={ComponentSizeEnum.SM}
              title="Delete"
              variant={ButtonVariantEnum.GHOST}
              onClick={() => void handleDelete()}
            />
          </div>
        ) : null}
      </div>
    </article>
  );
}
