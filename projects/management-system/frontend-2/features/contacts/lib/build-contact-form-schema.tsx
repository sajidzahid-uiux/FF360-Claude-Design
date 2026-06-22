"use client";

import { useFormContext, useFormState } from "react-hook-form";

import { Button, ButtonVariantEnum } from "@fieldflow360/org-ui";

import type { ContactFormData } from "@/features/contacts/model";
import { AddContactFormFields } from "@/features/contacts/ui/AddContactFormFields";
import { extractFormFieldErrors } from "@/features/forms";
import type { FormSchema } from "@/features/forms/ui";

import { contactFormValidation } from "./contact-form-validation";

interface ContactFormContentProps {
  value: ContactFormData;
  onChange: (value: ContactFormData) => void;
  readOnly?: boolean;
  isSubmitting?: boolean;
  inlineActions?: boolean;
  hideCategoryField?: boolean;
  mapHeight?: number;
  submitLabel?: string;
  onCancel?: () => void;
  onOpenCategoryDialog?: () => void;
}

function ContactFormContent({
  value,
  onChange,
  readOnly = false,
  isSubmitting = false,
  inlineActions = false,
  hideCategoryField = false,
  mapHeight,
  submitLabel = "Submit",
  onCancel,
  onOpenCategoryDialog,
}: ContactFormContentProps) {
  const { control } = useFormContext<Record<string, unknown>>();
  const { errors } = useFormState({ control });
  const fieldErrors = extractFormFieldErrors(errors.contactForm);

  return (
    <>
      <AddContactFormFields
        categoriesMode="pills"
        fieldErrors={fieldErrors}
        hideCategoryField={hideCategoryField}
        layout="detail"
        mapHeight={mapHeight}
        readOnly={readOnly}
        value={value}
        onChange={onChange}
        onOpenCategoryDialog={onOpenCategoryDialog}
      />
      {inlineActions && onCancel ? (
        <div className="mt-6 flex justify-between gap-3">
          <Button
            aria-label="Cancel"
            disabled={isSubmitting}
            title="Cancel"
            variant={ButtonVariantEnum.SURFACE}
            onClick={onCancel}
          />
          <Button
            aria-label={isSubmitting ? "Saving..." : submitLabel}
            disabled={isSubmitting || readOnly}
            loading={isSubmitting}
            title={isSubmitting ? "Saving..." : submitLabel}
            type="submit"
          />
        </div>
      ) : null}
    </>
  );
}

export interface BuildContactFormSchemaOptions {
  isEdit?: boolean;
  hideActionButtons?: boolean;
  inlineActions?: boolean;
  lockedCategoryIds?: number[];
  hideCategoryField?: boolean;
  disableColumnScroll?: boolean;
  mapHeight?: number;
  submitLabel?: string;
  onCancel?: () => void;
  onOpenCategoryDialog?: () => void;
}

export function buildContactFormSchema(
  _initialValues?: Partial<ContactFormData>,
  options?: BuildContactFormSchemaOptions
): FormSchema {
  const isEdit = options?.isEdit ?? false;
  const hideButtons =
    options?.hideActionButtons ?? options?.inlineActions ?? false;
  const inlineActions = options?.inlineActions ?? false;
  const hideCategoryField = options?.hideCategoryField ?? false;
  const mapHeight = options?.mapHeight;
  const submitLabel = options?.submitLabel;
  const onCancel = options?.onCancel;
  const onOpenCategoryDialog = options?.onOpenCategoryDialog;

  return {
    id: "contact-form",
    sections: [
      {
        id: "contact-form-section",
        useCard: false,
        className: "",
        fields: [
          {
            name: "contactForm",
            label: "",
            type: "custom",
            required: true,
            hideLabel: true,
            validation: contactFormValidation,
            customComponent: ({
              disabled: readOnly = false,
              formMethods,
              onChange,
              value,
            }) => (
              <ContactFormContent
                hideCategoryField={hideCategoryField}
                inlineActions={inlineActions}
                isSubmitting={formMethods?.formState?.isSubmitting ?? false}
                mapHeight={mapHeight}
                readOnly={readOnly}
                submitLabel={submitLabel}
                value={value as ContactFormData}
                onCancel={onCancel}
                onChange={onChange as (v: ContactFormData) => void}
                onOpenCategoryDialog={onOpenCategoryDialog}
              />
            ),
          },
        ],
      },
    ],
    submitButton: {
      label: submitLabel ?? (isEdit ? "Save Changes" : "Submit"),
      loadingLabel: isEdit ? "Saving..." : "Creating...",
      show: !hideButtons,
      className: "min-w-[100px]",
    },
    cancelButton: {
      label: "Cancel",
      show: !hideButtons,
      className: "min-w-[100px]",
    },
  };
}
