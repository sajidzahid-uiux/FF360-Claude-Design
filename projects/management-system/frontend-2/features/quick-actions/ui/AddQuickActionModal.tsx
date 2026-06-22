"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { AppFormModal } from "@fieldflow360/org-ui";
import { toast } from "sonner";

import {
  hasQuickActionFormContent,
  isQuickActionFormSubmittable,
  validateQuickActionFormFields,
} from "@/features/quick-actions/lib/quick-action-form-validation";
import {
  DEFAULT_QUICK_ACTION_FORM_VALUES,
  type QuickActionFormValues,
} from "@/features/quick-actions/model/quickActionForm";
import { QuickActionFormFields } from "@/features/quick-actions/ui/QuickActionFormFields";

export interface AddQuickActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: QuickActionFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
}

export function AddQuickActionModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: AddQuickActionModalProps) {
  const [formData, setFormData] = useState<QuickActionFormValues>(
    DEFAULT_QUICK_ACTION_FORM_VALUES
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) {
      setFormData(DEFAULT_QUICK_ACTION_FORM_VALUES);
      setFieldErrors({});
    }
  }, [open]);

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  }, [isSubmitting, onOpenChange]);

  const handleFieldChange = useCallback(
    (field: keyof QuickActionFormValues) => {
      setFieldErrors((current) => {
        if (!current[field]) return current;
        const next = { ...current };
        delete next[field];
        return next;
      });
    },
    []
  );

  const canSubmit = useMemo(
    () => isQuickActionFormSubmittable(formData),
    [formData]
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const errors = validateQuickActionFormFields(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Please fix the highlighted fields.");
      return;
    }

    if (!hasQuickActionFormContent(formData)) {
      toast.error(
        "Please provide at least one of: name, phone, email, description, or file(s)."
      );
      return;
    }

    await onSubmit(formData);
  };

  if (!open) {
    return null;
  }

  return (
    <AppFormModal
      showCancel
      cancelLabel="Cancel"
      isOpen={open}
      isSubmitting={isSubmitting}
      maxHeight="calc(100vh - 4rem)"
      submitDisabled={!canSubmit}
      submitLabel="Submit"
      title="Add Quick Action"
      width={720}
      onClose={handleClose}
      onSubmit={handleSubmit}
    >
      <QuickActionFormFields
        fieldErrors={fieldErrors}
        value={formData}
        onChange={setFormData}
        onFieldChange={handleFieldChange}
      />
    </AppFormModal>
  );
}
