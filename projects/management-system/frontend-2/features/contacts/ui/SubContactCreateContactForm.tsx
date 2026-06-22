"use client";

import { useMemo, useState } from "react";

import type { SubContactCreateAndLinkPayload } from "@/api/types";
import { buildContactFormSchema } from "@/features/contacts";
import {
  contactFormDataToSubContactCreateAndLink,
  createDefaultContactDetails,
} from "@/features/contacts/lib";
import {
  type ContactFormData,
  DEFAULT_CONTACT_FORM_DATA,
} from "@/features/contacts/model";
import {
  extractApiErrorPayload,
  mapContactDetailsToFieldErrors,
  parseErrorDetails,
} from "@/features/forms";
import { GenericForm } from "@/features/forms/ui";

/** Wide org-ui Modal so the full two-column contact form fits. */
export const SUB_CONTACT_CREATE_FORM_MODAL_CLASS =
  "max-w-[min(98vw,1440px)] max-h-[96vh]";
export const SUB_CONTACT_CREATE_FORM_DIALOG_CLASS =
  SUB_CONTACT_CREATE_FORM_MODAL_CLASS;

/** Scrollable body under the dialog title when the create form grows (extra contact details). */
export const SUB_CONTACT_CREATE_FORM_BODY_CLASS =
  "flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain [scrollbar-gutter:stable]";

interface SubContactCreateContactFormProps {
  clientCategoryId: number | undefined;
  submitLabel: string;
  isSubmitting?: boolean;
  onBack: () => void;
  onSubmit: (payload: SubContactCreateAndLinkPayload) => void;
}

export function SubContactCreateContactForm({
  clientCategoryId,
  submitLabel,
  isSubmitting = false,
  onBack,
  onSubmit,
}: SubContactCreateContactFormProps) {
  const formSchema = useMemo(
    () =>
      buildContactFormSchema(undefined, {
        hideCategoryField: true,
        disableColumnScroll: true,
        mapHeight: 300,
        inlineActions: true,
        submitLabel,
        onCancel: onBack,
      }),
    [onBack, submitLabel]
  );

  const initialValues = useMemo(
    () => ({
      contactForm: {
        ...DEFAULT_CONTACT_FORM_DATA,
        contact_details: createDefaultContactDetails(),
      } as ContactFormData,
    }),
    []
  );

  const [formMethodsRef, setFormMethodsRef] = useState<{
    setError: (name: string, error: { type: string; message: string }) => void;
  } | null>(null);

  const handleSubmit = async (values: Record<string, unknown>) => {
    if (!clientCategoryId) return;
    const formData = values.contactForm as ContactFormData;
    onSubmit(
      contactFormDataToSubContactCreateAndLink(formData, clientCategoryId)
    );
  };

  const handleError = (error: unknown) => {
    const formMethods = formMethodsRef;
    if (!formMethods) return;

    const errorData = extractApiErrorPayload(error);
    if (!errorData?.details) return;

    const details = parseErrorDetails(errorData.details);
    const fieldErrors = mapContactDetailsToFieldErrors(details);

    Object.entries(fieldErrors).forEach(([field, message]) => {
      formMethods.setError(`contactForm.${field}`, {
        type: "server",
        message,
      });
    });
  };

  if (!clientCategoryId) {
    return (
      <p className="text-text-muted text-sm">Loading contact categories...</p>
    );
  }

  return (
    <GenericForm
      className="min-h-0 w-full"
      initialValues={initialValues}
      isLoading={isSubmitting}
      schema={formSchema}
      showErrorToast={false}
      showModal={false}
      showSuccessToast={false}
      onError={handleError}
      onFormReady={setFormMethodsRef}
      onSubmit={handleSubmit}
    />
  );
}
