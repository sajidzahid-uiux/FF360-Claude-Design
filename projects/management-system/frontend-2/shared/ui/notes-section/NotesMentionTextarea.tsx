"use client";

import { forwardRef } from "react";

import {
  ComponentSizeEnum,
  Textarea,
  type TextareaProps,
  cn,
} from "@fieldflow360/org-ui";

import { sanitizeTextWithMentions } from "@/utils/validation";

export interface NotesMentionTextareaProps extends TextareaProps {
  embedded?: boolean;
}

export const NotesMentionTextarea = forwardRef<
  HTMLTextAreaElement,
  NotesMentionTextareaProps
>(({ embedded = false, className, onChange, ...props }, ref) => {
  const handleChange: TextareaProps["onChange"] = (event) => {
    const original = event.target.value;
    const sanitized = sanitizeTextWithMentions(original);

    if (sanitized !== original) {
      const modifiedEvent = {
        ...event,
        target: { ...event.target, value: sanitized },
      } as React.ChangeEvent<HTMLTextAreaElement>;
      onChange?.(modifiedEvent);
      return;
    }

    onChange?.(event);
  };

  return (
    <Textarea
      ref={ref}
      fullWidth
      className={cn(
        embedded &&
          "min-h-[44px] resize-none overflow-x-hidden overflow-y-hidden border-0 bg-transparent shadow-none focus:ring-0",
        className
      )}
      size={embedded ? ComponentSizeEnum.SM : ComponentSizeEnum.MD}
      onChange={handleChange}
      {...props}
    />
  );
});

NotesMentionTextarea.displayName = "NotesMentionTextarea";
