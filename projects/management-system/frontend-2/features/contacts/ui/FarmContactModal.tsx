"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { AppFormModal, TabsSwitcher, TabsSwitcherViewEnum } from "@fieldflow360/org-ui";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { resolveContactIdFromApiResponse } from "@/api/services/contactsService";
import type { ContactCreatePayload } from "@/api/types";
import {
  CONTACT_SUBTYPE,
  DEFAULT_FARM_CONTACT_FORM_DATA,
  FARM_MANAGEMENT_CONTACT_LABEL,
  type FarmContactFormData,
  type PendingSubContactEntry,
  PendingSubContactsTab,
  getPendingExistingSubContactIds,
} from "@/features/contacts";
import {
  contactToFarmFormData,
  ensureLockedCategoryIds,
  farmFormDataToUpdatePayload,
  getLockedClientContactCategoryIds,
  mapContactDetailsToApi,
  syncLegacyFieldsFromDetails,
} from "@/features/contacts/lib";
import {
  FarmContactFormContent,
  farmContactFormValidation,
} from "@/features/contacts/lib/farmContactFormSchema";
import {
  extractApiErrorPayload,
  mapContactDetailsToFieldErrors,
  parseErrorDetails,
} from "@/features/forms";
import {
  useContact,
  useContactCategories,
  useContactMutations,
  useRouteIds,
} from "@/hooks";
import { invalidateSubContactQueriesForParent } from "@/hooks/queries";

const DETAILS_TAB = "details";
const SUB_CONTACTS_TAB_KEY = "sub-contacts";

export interface FarmContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Provide a contact id to edit an existing Farm Management Contact. */
  contactId?: number | null;
}

function buildVerticesFromMapData(formData: FarmContactFormData) {
  if (formData.mapData.vertices.length > 0) {
    return formData.mapData.vertices.map(
      (v) => [v.lng, v.lat] as [number, number]
    );
  }
  if (formData.mapData.location) {
    const { lng, lat } = formData.mapData.location;
    return [
      [lng - 0.001, lat - 0.001],
      [lng + 0.001, lat - 0.001],
      [lng + 0.001, lat + 0.001],
      [lng - 0.001, lat + 0.001],
    ] as [number, number][];
  }
  return undefined;
}

/** Map a zod parse failure onto the flat field-error map the form editor reads. */
function farmZodErrorsToFieldErrors(
  error: ReturnType<typeof farmContactFormValidation.safeParse>
): Record<string, string> {
  if (error.success) return {};
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.error.issues) {
    const key = String(issue.path[0] ?? "general");
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

export function FarmContactModal({
  open,
  onOpenChange,
  contactId,
}: FarmContactModalProps) {
  const isEdit = contactId != null;
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();
  const { categories } = useContactCategories();
  const { create: createContact, update: patchContact } = useContactMutations();
  const { data: editingContact, isLoading: isLoadingContact } = useContact(
    open && isEdit ? contactId : null
  );

  const [activeTab, setActiveTab] = useState<string>(DETAILS_TAB);
  const [formData, setFormData] = useState<FarmContactFormData>({
    ...DEFAULT_FARM_CONTACT_FORM_DATA,
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pendingSubContacts, setPendingSubContacts] = useState<
    PendingSubContactEntry[]
  >([]);
  const [hydratedContactId, setHydratedContactId] = useState<number | null>(
    null
  );

  const lockedCategoryIds = useMemo(
    () =>
      editingContact
        ? getLockedClientContactCategoryIds(editingContact.categories)
        : [],
    [editingContact]
  );

  // Reset when the modal closes so the next open starts clean.
  useEffect(() => {
    if (!open) {
      setActiveTab(DETAILS_TAB);
      setFormData({ ...DEFAULT_FARM_CONTACT_FORM_DATA });
      setFieldErrors({});
      setPendingSubContacts([]);
      setHydratedContactId(null);
    }
  }, [open]);

  // Prefill from the contact being edited (once per contact).
  useEffect(() => {
    if (!open || !isEdit || !editingContact) return;
    if (hydratedContactId === editingContact.id) return;
    setFormData(contactToFarmFormData(editingContact));
    setHydratedContactId(editingContact.id);
  }, [open, isEdit, editingContact, hydratedContactId]);

  const isSubmitting = createContact.isPending || patchContact.isPending;

  const submitDisabled = useMemo(
    () => !formData.contact_details.some((row) => row.name.trim()),
    [formData.contact_details]
  );

  const formMethodsShim = useMemo(() => {
    const shaped: Record<string, { message: string }> = {};
    for (const [key, message] of Object.entries(fieldErrors)) {
      shaped[key] = { message };
    }
    return {
      formState: {
        errors: { contactForm: shaped },
        isSubmitting,
      },
    };
  }, [fieldErrors, isSubmitting]);

  const handleFieldErrorsFromApi = (error: unknown) => {
    const errorData = extractApiErrorPayload(error);
    if (!errorData?.details) return;
    const details = parseErrorDetails(errorData.details);
    setFieldErrors(mapContactDetailsToFieldErrors(details));
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onOpenChange(false);
  };

  const handleCreate = async () => {
    const legacy = syncLegacyFieldsFromDetails(formData.contact_details);

    let finalCategoryIds = formData.category_ids;
    if (formData.category_ids.length === 0) {
      const clientContactCategory = categories?.find(
        (cat) => cat.name.toLowerCase() === "client contact"
      );
      if (clientContactCategory) {
        finalCategoryIds = [clientContactCategory.id];
      }
    }

    const existingSubContactIds =
      getPendingExistingSubContactIds(pendingSubContacts);

    const contactData: ContactCreatePayload = {
      contact_subtype: CONTACT_SUBTYPE.FARM_MANAGEMENT,
      full_name: legacy.full_name,
      phone_number: legacy.phone_number || undefined,
      contact_details: mapContactDetailsToApi(formData.contact_details),
      email: formData.email || undefined,
      company_name: formData.company_name || undefined,
      description: formData.description || undefined,
      website_link: formData.website_link || undefined,
      street_address: formData.street_address || undefined,
      city: formData.city || undefined,
      state: formData.state || undefined,
      zip_code: formData.zip_code || undefined,
      longitude: formData.mapData.location?.lng,
      latitude: formData.mapData.location?.lat,
      vertices: buildVerticesFromMapData(formData),
      category_ids: finalCategoryIds,
      ...(existingSubContactIds.length > 0
        ? { sub_contacts: existingSubContactIds }
        : {}),
    };

    const created = await createContact.mutateAsync(contactData);
    const parentContactId = resolveContactIdFromApiResponse(created);

    if (existingSubContactIds.length > 0 && parentContactId && organizationId) {
      invalidateSubContactQueriesForParent(
        queryClient,
        organizationId,
        parentContactId
      );
    }

    toast.success(`${FARM_MANAGEMENT_CONTACT_LABEL} created successfully`);
    onOpenChange(false);
  };

  const handleUpdate = async () => {
    if (!contactId) return;
    await patchContact.mutateAsync({
      id: contactId,
      data: farmFormDataToUpdatePayload({
        ...formData,
        category_ids: ensureLockedCategoryIds(
          formData.category_ids,
          lockedCategoryIds
        ),
      }),
    });
    toast.success(`${FARM_MANAGEMENT_CONTACT_LABEL} updated successfully`);
    onOpenChange(false);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const validation = farmContactFormValidation.safeParse(formData);
    if (!validation.success) {
      setFieldErrors(farmZodErrorsToFieldErrors(validation));
      setActiveTab(DETAILS_TAB);
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setFieldErrors({});

    try {
      if (isEdit) {
        await handleUpdate();
      } else {
        await handleCreate();
      }
    } catch (error: unknown) {
      handleFieldErrorsFromApi(error);
      toast.error(
        isEdit
          ? "Failed to update contact"
          : "Failed to create contact"
      );
    }
  };

  if (!open) return null;

  const showTabs = !isEdit;
  const showSubContactsTab = showTabs && activeTab === SUB_CONTACTS_TAB_KEY;

  return (
    <AppFormModal
      showCancel
      isOpen={open}
      isSubmitting={isSubmitting}
      maxHeight="calc(100vh - 2rem)"
      submitDisabled={submitDisabled}
      submitLabel={isEdit ? "Save Changes" : `Create ${FARM_MANAGEMENT_CONTACT_LABEL}`}
      title={
        isEdit
          ? `Edit ${FARM_MANAGEMENT_CONTACT_LABEL}`
          : `Add New ${FARM_MANAGEMENT_CONTACT_LABEL}`
      }
      width={1360}
      onClose={handleClose}
      onSubmit={handleSubmit}
    >
      {isEdit && isLoadingContact ? (
        <p className="text-text-muted py-8 text-center text-sm">
          Loading contact...
        </p>
      ) : (
        <div className="space-y-5">
          {showTabs ? (
            <TabsSwitcher
              items={[
                { value: DETAILS_TAB, label: "Details" },
                {
                  value: SUB_CONTACTS_TAB_KEY,
                  label:
                    pendingSubContacts.length > 0
                      ? `Sub Contacts (${pendingSubContacts.length})`
                      : "Sub Contacts",
                },
              ]}
              value={activeTab}
              view={TabsSwitcherViewEnum.UNDERLINED}
              onChange={setActiveTab}
            />
          ) : null}

          <div className={showSubContactsTab ? "hidden" : undefined}>
            <FarmContactFormContent
              formMethods={formMethodsShim}
              lockedCategoryIds={lockedCategoryIds}
              value={formData}
              onChange={(next) => {
                setFormData(next);
                setFieldErrors({});
              }}
            />
          </div>

          {showSubContactsTab ? (
            <PendingSubContactsTab
              pending={pendingSubContacts}
              onChange={setPendingSubContacts}
            />
          ) : null}
        </div>
      )}
    </AppFormModal>
  );
}
