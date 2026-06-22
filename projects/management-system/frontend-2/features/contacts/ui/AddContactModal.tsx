"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { AppFormModal } from "@fieldflow360/org-ui";
import { toast } from "sonner";

import {
  AddContactFormFields,
  CategoryDialog,
  type ContactFormData,
  DEFAULT_CONTACT_FORM_DATA,
} from "@/features/contacts";
import {
  buildContactCreatePayload,
  contactFormValidation,
  isContactFormSubmittable,
  mapContactFormZodErrors,
} from "@/features/contacts/lib";
import {
  extractApiErrorPayload,
  mapContactDetailsToFieldErrors,
  parseErrorDetails,
} from "@/features/forms";
import {
  useCategoryMutations,
  useContactCategories,
  useContactMutations,
} from "@/hooks";

export interface AddContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddContactModal({ open, onOpenChange }: AddContactModalProps) {
  const { categories } = useContactCategories();
  const { create: createContact } = useContactMutations();
  const { create: createCategory } = useCategoryMutations();
  const [formData, setFormData] = useState<ContactFormData>(
    DEFAULT_CONTACT_FORM_DATA
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);

  useEffect(() => {
    if (!open) {
      setFormData(DEFAULT_CONTACT_FORM_DATA);
      setFieldErrors({});
      setShowCategoryDialog(false);
    }
  }, [open]);

  const handleCreateCategory = useCallback(
    async (name: string, color: string) => {
      const newCategory = await createCategory.mutateAsync({ name, color });
      const categoryId = newCategory.id;

      if (typeof categoryId !== "number" || Number.isNaN(categoryId)) {
        throw new Error("Created category did not return a valid id");
      }

      setFormData((current) => ({
        ...current,
        category_ids: current.category_ids.includes(categoryId)
          ? current.category_ids
          : [...current.category_ids, categoryId],
      }));
    },
    [createCategory]
  );

  const handleClose = useCallback(() => {
    if (!createContact.isPending) {
      onOpenChange(false);
    }
  }, [createContact.isPending, onOpenChange]);

  const handleFieldChange = useCallback((field: string) => {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }, []);

  const submitDisabled = useMemo(
    () => !isContactFormSubmittable(formData),
    [formData]
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const validation = contactFormValidation.safeParse(formData);
    if (!validation.success) {
      setFieldErrors(mapContactFormZodErrors(validation.error));
      toast.error("Please fix the highlighted fields.");
      return;
    }

    try {
      const payload = buildContactCreatePayload(formData, categories);
      await createContact.mutateAsync(payload);
      toast.success("Contact created successfully");
      onOpenChange(false);
    } catch (error: unknown) {
      const errorData = extractApiErrorPayload(error);
      if (errorData?.details) {
        const details = parseErrorDetails(errorData.details);
        setFieldErrors(mapContactDetailsToFieldErrors(details));
      }
      toast.error("Failed to create contact");
    }
  };

  if (!open) {
    return null;
  }

  return (
    <>
      <AppFormModal
        showCancel
        isOpen={open}
        isSubmitting={createContact.isPending}
        maxHeight="calc(100vh - 2rem)"
        submitDisabled={submitDisabled}
        submitLabel="Create Contact"
        title="Add New Contact"
        width={920}
        onClose={handleClose}
        onSubmit={handleSubmit}
      >
        <AddContactFormFields
          fieldErrors={fieldErrors}
          value={formData}
          onChange={setFormData}
          onFieldChange={handleFieldChange}
          onOpenCategoryDialog={() => setShowCategoryDialog(true)}
        />
      </AppFormModal>

      <CategoryDialog
        categoryColor=""
        categoryName=""
        open={showCategoryDialog}
        title="Add New Category"
        onOpenChange={setShowCategoryDialog}
        onSave={handleCreateCategory}
      />
    </>
  );
}
