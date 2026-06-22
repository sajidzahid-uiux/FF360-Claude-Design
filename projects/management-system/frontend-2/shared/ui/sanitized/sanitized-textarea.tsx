import { forwardRef } from "react";

import {
  type TextareaProps as OrgUiTextareaProps,
  Textarea,
} from "@fieldflow360/org-ui";

import { sanitizeText, sanitizeTextWithMentions } from "@/utils/validation";

export interface SanitizedTextareaProps extends OrgUiTextareaProps {
  onSanitizedChange?: (sanitized: string, original: string) => void;
  sanitize?: boolean;
  mention?: boolean;
  unstyled?: boolean;
}

export const SanitizedTextarea = forwardRef<
  HTMLTextAreaElement,
  SanitizedTextareaProps
>(
  (
    {
      onChange,
      onSanitizedChange,
      sanitize = true,
      mention = false,
      value,
      unstyled,
      className,
      label,
      helperText,
      error,
      size,
      fullWidth,
      ...props
    },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const original = e.target.value;

      let sanitized: string;

      if (mention) {
        sanitized = sanitizeTextWithMentions(original);
      } else if (sanitize) {
        sanitized = sanitizeText(original);
      } else {
        sanitized = original;
      }

      if (onSanitizedChange) {
        onSanitizedChange(sanitized, original);
      }

      if (onChange) {
        if (sanitized !== original) {
          const modifiedEvent = {
            ...e,
            target: { ...e.target, value: sanitized },
          } as React.ChangeEvent<HTMLTextAreaElement>;
          onChange(modifiedEvent);
        } else {
          onChange(e);
        }
      }
    };

    if (unstyled) {
      return (
        <textarea
          ref={ref}
          className={className}
          value={value}
          onChange={handleChange}
          {...props}
        />
      );
    }

    return (
      <Textarea
        ref={ref}
        className={className}
        error={error}
        fullWidth={fullWidth}
        helperText={helperText}
        label={label}
        size={size}
        value={value}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

SanitizedTextarea.displayName = "SanitizedTextarea";
