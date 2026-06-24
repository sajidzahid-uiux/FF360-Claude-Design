"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { Button, ComponentSizeEnum, cn } from "@fieldflow360/org-ui";
import { Send } from "lucide-react";

import type { TeamMember } from "@/api/types";
import { useIsMobile } from "@/hooks";

import { MentionSuggestionsList } from "./MentionSuggestionsList";
import { NotesMentionTextarea } from "./NotesMentionTextarea";
import { useMentionTextarea } from "./useMentionTextarea";

export interface NotesComposerSubmitPayload {
  text: string;
  mentionIds: number[];
}

export interface NotesComposerProps {
  onSubmit: (payload: NotesComposerSubmitPayload) => void | Promise<void>;
  submitting: boolean;
  readOnly: boolean;
  members: TeamMember[] | undefined;
  placeholder?: string;
  className?: string;
}

export function NotesComposer({
  onSubmit,
  submitting,
  readOnly,
  members,
  placeholder = "Write a note… Use @ to mention someone",
  className,
}: NotesComposerProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();
  const {
    mentioning,
    mentionSuggestions,
    selectedMentionIds,
    handleTextChange,
    applyMention,
    resetMentions,
  } = useMentionTextarea(members);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.overflow = "hidden";
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  if (readOnly) return null;

  const focusTextarea = () => {
    if (!isMobile || !textareaRef.current) return;
    textareaRef.current.focus();
    setTimeout(() => {
      textareaRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 300);
  };

  const handlePost = async () => {
    if (!value.trim() || submitting) return;
    await onSubmit({ text: value, mentionIds: selectedMentionIds });
    setValue("");
    resetMentions();
  };

  return (
    <div
      className={cn(
        "border-border-subtle bg-bg-app focus-within:border-accent/40 focus-within:ring-accent/20 relative min-w-0 overflow-hidden rounded-xl border shadow-sm focus-within:ring-2",
        className
      )}
    >
      <div className="relative min-w-0 overflow-hidden px-3 pt-3 [&_textarea]:w-full [&>div]:w-full [&>div]:space-y-0">
        <NotesMentionTextarea
          ref={textareaRef}
          embedded
          disabled={submitting}
          placeholder={placeholder}
          rows={1}
          value={value}
          onChange={(e) => {
            const next = e.target.value;
            setValue(next);
            handleTextChange(next, e.target.selectionStart ?? next.length);
          }}
          onClick={focusTextarea}
          onFocus={focusTextarea}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handlePost();
            }
          }}
        />
        {mentioning ? (
          <MentionSuggestionsList
            placement="above"
            suggestions={mentionSuggestions}
            onSelect={(m) => {
              setValue(applyMention(value, m.user.username, m.id));
            }}
          />
        ) : null}
      </div>
      <div className="border-border-subtle flex items-center justify-between gap-2 border-t px-3 py-2">
        <Button
          className="ml-auto"
          disabled={submitting || !value.trim()}
          leftIcon={<Send aria-hidden className="h-4 w-4" />}
          loading={submitting}
          size={ComponentSizeEnum.SM}
          title={submitting ? "Posting…" : "Post note"}
          onClick={() => void handlePost()}
        />
      </div>
    </div>
  );
}
