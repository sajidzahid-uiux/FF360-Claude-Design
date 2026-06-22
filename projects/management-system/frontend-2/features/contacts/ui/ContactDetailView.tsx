"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { UseFormReturn } from "react-hook-form";

import { format } from "date-fns";
import { toast } from "sonner";

import type { Contact } from "@/api/types";
import type { ContactFormData, FarmContactFormData } from "@/features/contacts";
import { CategoryDialog, buildContactFormSchema } from "@/features/contacts";
import {
  CONTACT_DETAIL_TAB_CONTACT,
  CONTACT_DETAIL_TAB_FARMS,
  FARM_CONTACT_INFO_TAB,
  SUB_CONTACTS_TAB,
  contactToFarmFormData,
  ensureLockedCategoryIds,
  farmFormDataToUpdatePayload,
  getContactDetailTabs,
  getLockedClientContactCategoryIds,
  hydrateContactDetailsForForm,
  isFarmManagementContact,
  mapContactDetailsToApi,
  parseFarmManagementContactRefs,
  syncLegacyFieldsFromDetails,
} from "@/features/contacts/lib";
import { buildFarmContactFormSchema } from "@/features/contacts/lib/farmContactFormSchema";
import {
  extractApiErrorPayload,
  mapContactDetailsToFieldErrors,
  parseErrorDetails,
} from "@/features/forms";
import { GenericForm } from "@/features/forms/ui";
import {
  useCategoryMutations,
  useContactMutations,
  useDialogManager,
  useRouteIds,
} from "@/hooks";
import {
  PERMISSION_RESOURCES,
  useContactPermissions,
  usePermissionsFromStorage,
  useRoutePermissions,
} from "@/hooks/permissions";
import { orgPath } from "@/shared/config/routes";
import {
  DetailViewEditActions,
  DetailViewPage,
  DialogManager,
  Dropdown,
  NavBar,
} from "@/shared/ui/common";
import { buildRowActions } from "@/utils/actions";

import FarmList from "./FarmList";
import JobHistory from "./JobHistory";
import SubContactsTab from "./SubContactsTab";

interface ContactDetailViewProps {
  contact: Contact;
  onBack: () => void;
  onDelete: (contact: Contact) => void;
}

export function ContactDetailView({
  contact,
  onBack,
  onDelete,
}: ContactDetailViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { orgId } = useRouteIds();
  const { update: patchContact } = useContactMutations();
  const { create: createCategory } = useCategoryMutations();
  const { canRead: canReadContact } = useContactPermissions();
  const { write: canEditContact, delete: canDeleteContact } =
    useRoutePermissions() || {};

  const { permissionCodes: farmsPermCodes } = usePermissionsFromStorage(
    PERMISSION_RESOURCES.CONTACT_FARM_TAB
  );

  const isFarmManagement = isFarmManagementContact(contact);
  const farmManagementParents = useMemo(
    () => parseFarmManagementContactRefs(contact.farm_management_contact_names),
    [contact.farm_management_contact_names]
  );

  const defaultInfoTab = isFarmManagement
    ? FARM_CONTACT_INFO_TAB
    : CONTACT_DETAIL_TAB_CONTACT;

  const [isEditingForm, setIsEditingForm] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultInfoTab);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [formMethodsRef, setFormMethodsRef] = useState<UseFormReturn<
    Record<string, unknown>
  > | null>(null);
  const dialogManager = useDialogManager();

  const contactActionParam = searchParams.get("action");
  const contactFarmIdParam = searchParams.get("farmId");

  useEffect(() => {
    if (contactActionParam === "add" || contactFarmIdParam) {
      setActiveTab(CONTACT_DETAIL_TAB_FARMS);
    }
  }, [contactActionParam, contactFarmIdParam]);

  const handleViewFarmParent = useCallback(
    (farmContactId: number) => {
      if (!orgId) return;
      router.push(orgPath(orgId, `/contact/${farmContactId}`));
    },
    [router, orgId]
  );

  const lockedCategoryIds = useMemo(
    () => getLockedClientContactCategoryIds(contact.categories),
    [contact.categories]
  );

  const formSchema = useMemo(
    () =>
      isFarmManagement
        ? buildFarmContactFormSchema(undefined, {
            isEdit: true,
            hideActionButtons: true,
            lockedCategoryIds,
          })
        : buildContactFormSchema(undefined, {
            isEdit: true,
            hideActionButtons: true,
            lockedCategoryIds,
            onOpenCategoryDialog: () => setShowCategoryDialog(true),
          }),
    [isFarmManagement, lockedCategoryIds]
  );

  const handleCreateCategory = useCallback(
    async (name: string, color: string) => {
      const newCategory = await createCategory.mutateAsync({ name, color });
      const categoryId = newCategory.id;

      if (typeof categoryId !== "number" || Number.isNaN(categoryId)) {
        throw new Error("Created category did not return a valid id");
      }

      const current = formMethodsRef?.getValues("contactForm") as
        | ContactFormData
        | undefined;
      if (!current) return;

      formMethodsRef?.setValue("contactForm", {
        ...current,
        category_ids: current.category_ids.includes(categoryId)
          ? current.category_ids
          : [...current.category_ids, categoryId],
      });
    },
    [createCategory, formMethodsRef]
  );

  const initialValues = useMemo(() => {
    if (isFarmManagement) {
      return { contactForm: contactToFarmFormData(contact) };
    }

    return {
      contactForm: {
        full_name: contact.full_name,
        email: contact.email || "",
        home_phone_number: contact.home_phone_number || "",
        company_name: contact.company_name || "",
        description: contact.description || "",
        website_link: contact.website_link || "",
        street_address: contact.street_address || "",
        city: contact.city || "",
        state: contact.state || "",
        zip_code: contact.zip_code || "",
        mapData: {
          location:
            contact.latitude && contact.longitude
              ? { lat: contact.latitude, lng: contact.longitude }
              : null,
          vertices: Array.isArray(contact.vertices)
            ? contact.vertices.map((v) =>
                Array.isArray(v)
                  ? { lat: v[1], lng: v[0] }
                  : {
                      lat: (v as { lat: number }).lat,
                      lng: (v as { lng: number }).lng,
                    }
              )
            : [],
        },
        category_ids: contact.categories.map((cat) => cat.id),
        contact_details: hydrateContactDetailsForForm(contact.contact_details, {
          full_name: contact.full_name,
          phone_number: contact.phone_number,
        }),
      } as ContactFormData,
    };
  }, [contact, isFarmManagement]);

  const handleSubmit = async (values: Record<string, unknown>) => {
    if (isFarmManagement) {
      const formData = values.contactForm as FarmContactFormData;
      await patchContact.mutateAsync({
        id: contact.id,
        data: farmFormDataToUpdatePayload({
          ...formData,
          category_ids: ensureLockedCategoryIds(
            formData.category_ids,
            lockedCategoryIds
          ),
        }),
      });
    } else {
      const formData = values.contactForm as ContactFormData;
      const legacy = syncLegacyFieldsFromDetails(formData.contact_details);
      await patchContact.mutateAsync({
        id: contact.id,
        data: {
          full_name: legacy.full_name,
          email: formData.email || undefined,
          phone_number: legacy.phone_number || undefined,
          home_phone_number: formData.home_phone_number || undefined,
          company_name: formData.company_name || undefined,
          description: formData.description || undefined,
          website_link: formData.website_link || undefined,
          street_address: formData.street_address || undefined,
          city: formData.city || undefined,
          state: formData.state || undefined,
          zip_code: formData.zip_code || undefined,
          category_ids: ensureLockedCategoryIds(
            formData.category_ids,
            lockedCategoryIds
          ),
          contact_details: mapContactDetailsToApi(formData.contact_details),
          latitude: formData.mapData.location?.lat,
          longitude: formData.mapData.location?.lng,
          vertices:
            formData.mapData.vertices.length > 0
              ? formData.mapData.vertices.map((v) => [v.lng, v.lat])
              : formData.mapData.location
                ? [
                    [
                      formData.mapData.location.lng - 0.001,
                      formData.mapData.location.lat - 0.001,
                    ],
                    [
                      formData.mapData.location.lng + 0.001,
                      formData.mapData.location.lat - 0.001,
                    ],
                    [
                      formData.mapData.location.lng + 0.001,
                      formData.mapData.location.lat + 0.001,
                    ],
                    [
                      formData.mapData.location.lng - 0.001,
                      formData.mapData.location.lat + 0.001,
                    ],
                  ]
                : undefined,
        },
      });
    }
    setIsEditingForm(false);
  };

  const handleError = (error: unknown) => {
    const formMethods = formMethodsRef;
    if (!formMethods) return;

    const errorData = extractApiErrorPayload(error);
    if (!errorData?.details) return;

    const details = parseErrorDetails(errorData.details);
    const fieldErrors = mapContactDetailsToFieldErrors(details);

    Object.entries(fieldErrors).forEach(([field, message]) => {
      if (field === "home_phone_number") {
        toast.error(message);
        return;
      }
      formMethods.setError(`contactForm.${field}`, {
        type: "server",
        message,
      });
    });
  };

  const getFullAddress = () => {
    const parts = [
      contact.street_address,
      contact.city,
      contact.state,
      contact.zip_code,
    ].filter(Boolean);
    return parts.join(", ");
  };

  const items = useMemo(
    () =>
      buildRowActions({
        canView: false,
        canEdit: false,
        canDelete: !!canDeleteContact,
        canTrack: false,
        canArchive: false,
        isArchived: false,
        onView: () => {},
        ...(canReadContact &&
          orgId && {
            onLogs: () =>
              router.push(orgPath(orgId, `/contact/${contact.id}/logs`)),
          }),
        onDelete: () => {
          dialogManager.openConfirmationDialog({
            title: "Delete Contact",
            confirmationType: "delete",
            itemTitle: contact.full_name,
            variant: "destructive",
            confirmButtonText: "Delete",
            onConfirm: async () => {
              try {
                onDelete(contact);
                dialogManager.closeDialog();
              } catch (error: unknown) {
                console.error("Failed to delete contact:", error);
                toast.error("Failed to delete contact");
                dialogManager.setConfirmationProcessing(false);
                throw error;
              }
            },
          });
        },
      }),
    [
      canDeleteContact,
      canReadContact,
      orgId,
      router,
      dialogManager,
      contact,
      onDelete,
    ]
  );

  const tabs = useMemo(
    () =>
      getContactDetailTabs(contact.categories, farmsPermCodes, {
        isFarmManagement,
      }),
    [contact.categories, farmsPermCodes, isFarmManagement]
  );

  const isContactInfoTab =
    activeTab === CONTACT_DETAIL_TAB_CONTACT ||
    activeTab === FARM_CONTACT_INFO_TAB;

  const showContactEditActions = isContactInfoTab && Boolean(canEditContact);

  return (
    <DetailViewPage
      actions={
        <>
          <DetailViewEditActions
            canEdit={showContactEditActions}
            editAriaLabel="Edit contact"
            isEditing={isEditingForm}
            isSaving={patchContact.isPending}
            onCancel={() => {
              formMethodsRef?.reset(initialValues);
              setShowCategoryDialog(false);
              setIsEditingForm(false);
            }}
            onEdit={() => setIsEditingForm(true)}
            onSave={() => {
              void formMethodsRef?.handleSubmit(handleSubmit, () => {
                // Invalid form state is reflected via formState errors.
              })();
            }}
          />
          <Dropdown items={items} />
        </>
      }
      backLabel="Back to contacts"
      className="flex-1"
      constrainBodyWidth={false}
      contentClassName="pt-5"
      footer={
        <>
          <CategoryDialog
            categoryColor=""
            categoryName=""
            open={showCategoryDialog}
            title="Add New Category"
            onOpenChange={setShowCategoryDialog}
            onSave={handleCreateCategory}
          />

          <DialogManager manager={dialogManager} />
        </>
      }
      meta={
        <>
          <p className="text-text-muted text-sm">
            Created {format(new Date(contact.created_at), "dd-MMM-yy, h:mm a")}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {contact.categories.map((category) => (
              <span
                key={category.id}
                className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                style={{ backgroundColor: category.color }}
              >
                {category.name}
              </span>
            ))}
            {farmManagementParents.map((parent, index) =>
              parent.id != null ? (
                <button
                  key={parent.id}
                  className="bg-bg-surface text-text-muted hover:bg-bg-hover/80 rounded-full px-2.5 py-0.5 text-xs font-medium"
                  type="button"
                  onClick={() => handleViewFarmParent(parent.id!)}
                >
                  FM: {parent.full_name}
                </button>
              ) : (
                <span
                  key={`fm-legacy-${index}`}
                  className="bg-bg-surface text-text-muted rounded-full px-2.5 py-0.5 text-xs font-medium"
                >
                  FM: {parent.full_name}
                </span>
              )
            )}
          </div>
        </>
      }
      subtitle={getFullAddress() || "No address provided"}
      onBack={onBack}
    >
      <NavBar
        activeTab={activeTab}
        className="mb-4"
        setActiveTab={setActiveTab}
        tabs={tabs}
      />

      {isContactInfoTab ? (
        <div>
          {isEditingForm ? (
            <p className="text-text-muted mb-4 text-sm">
              {isFarmManagement
                ? "Update Farm Management Contact details below, then save your changes."
                : "Update contact details below, then save your changes."}
            </p>
          ) : (
            <p className="text-text-muted mb-4 text-sm">
              {isFarmManagement
                ? "View and update Farm Management Contact details here."
                : "View and update contact details here."}
            </p>
          )}

          <GenericForm
            initialValues={initialValues}
            isLoading={patchContact.isPending}
            readOnly={!isEditingForm}
            schema={formSchema}
            showErrorToast={false}
            showModal={false}
            showSuccessToast={true}
            successMessage="Contact updated successfully"
            onCancel={() => {
              formMethodsRef?.reset(initialValues);
              setShowCategoryDialog(false);
              setIsEditingForm(false);
            }}
            onError={handleError}
            onFormReady={setFormMethodsRef}
            onSubmit={handleSubmit}
            onSuccess={() => setIsEditingForm(false)}
          />
        </div>
      ) : null}

      {activeTab === CONTACT_DETAIL_TAB_FARMS && !isFarmManagement ? (
        <FarmList
          autoOpenDialog={searchParams.get("action") === "add"}
          contactId={contact.id}
        />
      ) : null}

      {activeTab === SUB_CONTACTS_TAB && isFarmManagement ? (
        <SubContactsTab parentContactId={contact.id} />
      ) : null}

      {activeTab === "Job History" ? (
        <JobHistory contactId={contact.id} />
      ) : null}
    </DetailViewPage>
  );
}
