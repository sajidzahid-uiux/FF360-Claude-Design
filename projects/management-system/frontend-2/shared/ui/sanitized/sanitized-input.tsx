import { type InputHTMLAttributes, type ReactNode, forwardRef } from "react";

import {
  Input,
  type InputProps as OrgUiInputProps,
} from "@fieldflow360/org-ui";

import { sanitizeText, sanitizeTextWithMentions } from "@/utils/validation";

export interface SanitizedInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "size"
> {
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onSanitizedChange?: (sanitized: string, original: string) => void;
  sanitize?: boolean;
  mention?: boolean;
  unstyled?: boolean;
  label?: OrgUiInputProps["label"];
  helperText?: OrgUiInputProps["helperText"];
  error?: OrgUiInputProps["error"];
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  size?: OrgUiInputProps["size"];
  fullWidth?: OrgUiInputProps["fullWidth"];
}

const SAFE_INPUT_TYPES = [
  "number",
  "checkbox",
  "radio",
  "date",
  "time",
  "datetime-local",
  "color",
  "range",
  "file",
  "password",
];

const RAW_INPUT_TYPES = ["checkbox", "radio"];

export const SanitizedInput = forwardRef<HTMLInputElement, SanitizedInputProps>(
  (
    {
      onChange,
      onSanitizedChange,
      sanitize = true,
      mention = false,
      type,
      value,
      unstyled,
      className,
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      size,
      fullWidth,
      ...props
    },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const original = e.target.value;
      const isSafeType = type && SAFE_INPUT_TYPES.includes(type);
      const shouldSanitize = !isSafeType && sanitize;

      let sanitized: string;

      if (shouldSanitize && mention) {
        sanitized = sanitizeTextWithMentions(original);
      } else if (shouldSanitize) {
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
          } as React.ChangeEvent<HTMLInputElement>;
          onChange(modifiedEvent);
        } else {
          onChange(e);
        }
      }
    };

    if (type && RAW_INPUT_TYPES.includes(type)) {
      return (
        <input
          ref={ref}
          className={className}
          type={type}
          value={value}
          onChange={handleChange}
          {...props}
        />
      );
    }

    if (unstyled) {
      return (
        <input
          ref={ref}
          className={className}
          type={type}
          value={value}
          onChange={handleChange}
          {...props}
        />
      );
    }

    return (
      <Input
        ref={ref}
        className={className}
        error={error}
        fullWidth={fullWidth}
        helperText={helperText}
        label={label}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        size={size}
        type={type}
        value={value}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

SanitizedInput.displayName = "SanitizedInput";
