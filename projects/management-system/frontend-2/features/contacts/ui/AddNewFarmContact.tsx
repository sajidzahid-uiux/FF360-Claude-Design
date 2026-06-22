"use client";
import { useCallback, useMemo, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import {
  ContactsService,
  resolveContactIdFromApiResponse,
} from "@/api/services/contactsService";
import type { ContactCreatePayload } from "@/api/types";
import {
  ADD_FARM_CONTACT_TITLE,
  CONTACT_SUBTYPE,
  DEFAULT_FARM_CONTACT_FORM_DATA,
  FARM_CONTACT_BADGE_LABEL,
  FARM_CONTACT_INFO_TAB,
  type FarmContactFormData,
  type PendingSubContactEntry,
  PendingSubContactsTab,
  SUB_CONTACTS_TAB,
  getPendingExistingSubContactIds,
  getPendingNewSubContactEntries,
  mapContactDetailsToApi,
  syncLegacyFieldsFromDetails,
} from "@/features/contacts";
import { buildFarmContactFormSchema } from "@/features/contacts/lib/farmContactFormSchema";
import {
  extractApiErrorPayload,
  mapContactDetailsToFieldErrors,
  parseErrorDetails,
} from "@/features/forms";
import { GenericForm } from "@/features/forms/ui";
import {
  useContactCategories,
  useContactMutations,
  useRouteIds,
} from "@/hooks";
import { invalidateSubContactQueriesForParent } from "@/hooks/queries";
import { NavBar } from "@/shared/ui/common";
import { Badge } from "@/shared/ui/primitives";

interface AddNewFarmContactProps {
  onBack: () => void;
  onSuccess?: () => void;
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

async function createAndLinkPendingNewSubContacts(
  organizationId: string,
  parentContactId: number,
  pending: PendingSubContactEntry[]
) {
  const newEntries = getPendingNewSubContactEntries(pending);

  for (const entry of newEntries) {
    await ContactsService.createAndLinkSubContact(
      organizationId,
      parentContactId,
      entry.payload
    );
  }
}

export default function AddNewFarmContact({
  onBack,
  onSuccess,
}: AddNewFarmContactProps) {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();
  const { categories } = useContactCategories();
  const { create: createContact } = useContactMutations();
  const [activeTab, setActiveTab] = useState(FARM_CONTACT_INFO_TAB);
  const [pendingSubContacts, setPendingSubContacts] = useState<
    PendingSubContactEntry[]
  >([]);
  const [formMethodsRef, setFormMethodsRef] = useState<{
    setError: (name: string, error: { type: string; message: string }) => void;
  } | null>(null);

  const formSchema = useMemo(
    () =>
      buildFarmContactFormSchema(undefined, {
        inlineActions: true,
        onCancel: onBack,
      }),
    [onBack]
  );

  const initialValues = useMemo(
    () => ({
      contactForm: { ...DEFAULT_FARM_CONTACT_FORM_DATA },
    }),
    []
  );

  const tabs = useMemo(() => [FARM_CONTACT_INFO_TAB, SUB_CONTACTS_TAB], []);

  const handleSubmit = async (values: Record<string, unknown>) => {
    const formData = values.contactForm as FarmContactFormData;
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
    const hasNewSubContacts =
      getPendingNewSubContactEntries(pendingSubContacts).length > 0;

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

    if (hasNewSubContacts && organizationId) {
      if (!parentContactId) {
        toast.error(
          "Farm Management Contact was created, but new sub-contacts could not be added (missing contact id). Open the contact to finish linking."
        );
        onSuccess?.();
        return;
      }
      try {
        await createAndLinkPendingNewSubContacts(
          organizationId,
          parentContactId,
          pendingSubContacts
        );
        invalidateSubContactQueriesForParent(
          queryClient,
          organizationId,
          parentContactId
        );
      } catch {
        toast.error(
          "Farm Management Contact was created, but some new sub-contacts could not be added. Open the contact to finish linking."
        );
        onSuccess?.();
        return;
      }
    } else if (
      existingSubContactIds.length > 0 &&
      parentContactId &&
      organizationId
    ) {
      invalidateSubContactQueriesForParent(
        queryClient,
        organizationId,
        parentContactId
      );
    }

    onSuccess?.();
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

  const handlePendingChange = useCallback((next: PendingSubContactEntry[]) => {
    setPendingSubContacts(next);
  }, []);

  return (
    <div className="bg-bg-app min-h-0 p-4 sm:p-6">
      <div className="mb-4 flex items-center gap-4">
        <ArrowLeft
          className="h-8 shrink-0 cursor-pointer"
          role="button"
          tabIndex={0}
          onClick={onBack}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onBack();
          }}
        />
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-text-primary text-2xl leading-7 font-bold sm:text-4xl">
            {ADD_FARM_CONTACT_TITLE}
          </h1>
          <Badge
            className="rounded-full px-3 py-1 text-sm font-medium"
            variant="secondary"
          >
            {FARM_CONTACT_BADGE_LABEL}
          </Badge>
        </div>
      </div>

      <NavBar
        activeTab={activeTab}
        className="mt-0 mb-4"
        setActiveTab={setActiveTab}
        tabs={tabs}
      />

      <div
        className={activeTab === FARM_CONTACT_INFO_TAB ? undefined : "hidden"}
      >
        <GenericForm
          initialValues={initialValues}
          isLoading={createContact.isPending}
          schema={formSchema}
          showErrorToast={false}
          showModal={false}
          showSuccessToast={true}
          successMessage="Farm Management Contact created successfully"
          onCancel={onBack}
          onError={handleError}
          onFormReady={setFormMethodsRef}
          onSubmit={handleSubmit}
        />
      </div>

      {activeTab === SUB_CONTACTS_TAB ? (
        <PendingSubContactsTab
          pending={pendingSubContacts}
          onChange={handlePendingChange}
        />
      ) : null}
    </div>
  );
}
