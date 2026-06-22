"use client";

import { FormEvent, ReactNode, useEffect, useRef } from "react";

import { sanitizeObject, sanitizeText } from "@/utils/validation";

export interface SanitizedFormProps {
  children: ReactNode;
  onSubmit: (data: Record<string, unknown>) => void;
  sanitizeFields: string[];
  className?: string;
  id?: string;
  sanitizeOnChange?: boolean;
}

// Form wrapper that auto-sanitizes specified fields on submit
export function SanitizedForm({
  children,
  onSubmit,
  sanitizeFields,
  className,
  id,
  sanitizeOnChange = false,
}: SanitizedFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!sanitizeOnChange || !formRef.current) return;

    const handleInput = (e: Event) => {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement;
      const fieldName = target.name;

      // Only sanitize if this field is in sanitizeFields list
      if (sanitizeFields.includes(fieldName)) {
        const cursorPosition = target.selectionStart;
        const originalValue = target.value;
        const sanitizedValue = sanitizeText(originalValue);

        // Only update if value changed after sanitization
        if (originalValue !== sanitizedValue) {
          target.value = sanitizedValue;

          // Restore cursor position
          if (cursorPosition !== null) {
            target.setSelectionRange(cursorPosition, cursorPosition);
          }
        }
      }
    };

    const form = formRef.current;
    form.addEventListener("input", handleInput);

    return () => {
      form.removeEventListener("input", handleInput);
    };
  }, [sanitizeFields, sanitizeOnChange]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    const sanitized = sanitizeObject(data, sanitizeFields);
    onSubmit(sanitized);
  };

  return (
    <form ref={formRef} className={className} id={id} onSubmit={handleSubmit}>
      {children}
    </form>
  );
}
