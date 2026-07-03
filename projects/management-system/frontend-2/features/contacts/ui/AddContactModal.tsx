"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { AppFormModal, Button, ButtonVariantEnum } from "@fieldflow360/org-ui";
import { toast } from "sonner";

import { resolveContactIdFromApiResponse } from "@/api/services/contactsService";
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
import { useModalStack } from "@/shared/model/use-modal-stack";

export interface AddContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddContactModal({ open, onOpenChange }: AddContactModalProps) {
  const { replaceModal } = useModalStack();
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

  // A brand-new contact defaults to "Client Contact" when no category is
  // chosen; offer the "add an on-site operation" shortcut for those.
  const showCreateOperation = useMemo(() => {
    if (formData.category_ids.length === 0) return true;
    const clientContactId = categories?.find(
      (cat) => cat.name.toLowerCase() === "client contact"
    )?.id;
    return clientContactId != null && formData.category_ids.includes(clientContactId);
  }, [categories, formData.category_ids]);

  /** Validate + create. Returns the new contact id (or null if it failed). */
  const createFromForm = async (): Promise<{
    ok: boolean;
    id: number | null;
  }> => {
    const validation = contactFormValidation.safeParse(formData);
    if (!validation.success) {
      setFieldErrors(mapContactFormZodErrors(validation.error));
      toast.error("Please fix the highlighted fields.");
      return { ok: false, id: null };
    }

    try {
      const payload = buildContactCreatePayload(formData, categories);
      const created = await createContact.mutateAsync(payload);
      return { ok: true, id: resolveContactIdFromApiResponse(created) ?? null };
    } catch (error: unknown) {
      const errorData = extractApiErrorPayload(error);
      if (errorData?.details) {
        const details = parseErrorDetails(errorData.details);
        setFieldErrors(mapContactDetailsToFieldErrors(details));
      }
      toast.error("Failed to create contact");
      return { ok: false, id: null };
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const result = await createFromForm();
    if (!result.ok) return;
    toast.success("Contact created successfully");
    onOpenChange(false);
  };

  const handleCreateAndAddOperation = async () => {
    const result = await createFromForm();
    if (!result.ok) return;
    toast.success("Contact created successfully");
    // Swap this modal for the "New On-Site Operation" form, pre-scoped to the
    // contact we just created.
    if (result.id != null) {
      replaceModal("add-onsite-operation", {
        id: String(result.id),
        name: formData.full_name?.trim() || "",
      });
    } else {
      onOpenChange(false);
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
        secondaryAction={
          showCreateOperation ? (
            <Button
              aria-label="Create contact and add an on-site operation"
              disabled={submitDisabled || createContact.isPending}
              title="Create & Add On-Site Operation"
              type="button"
              variant={ButtonVariantEnum.SURFACE}
              onClick={() => void handleCreateAndAddOperation()}
            />
          ) : undefined
        }
        submitDisabled={submitDisabled}
        submitLabel="Create Contact"
        title="Add New Contact"
        width={1280}
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
