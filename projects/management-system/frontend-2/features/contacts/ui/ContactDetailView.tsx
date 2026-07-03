"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button, ButtonVariantEnum } from "@fieldflow360/org-ui";
import { format } from "date-fns";
import { toast } from "sonner";

import type { Contact } from "@/api/types";
import {
  CONTACT_DETAIL_TAB_CONTACT,
  CONTACT_DETAIL_TAB_FARMS,
  FARM_CONTACT_INFO_TAB,
  SUB_CONTACTS_TAB,
  getContactDetailTabs,
  isFarmManagementContact,
  parseFarmManagementContactRefs,
} from "@/features/contacts/lib";
import { useDialogManager, useRouteIds } from "@/hooks";
import {
  PERMISSION_RESOURCES,
  useContactPermissions,
  usePermissionsFromStorage,
  useRoutePermissions,
} from "@/hooks/permissions";
import { orgPath } from "@/shared/config/routes";
import {
  DetailViewPage,
  DialogManager,
  Dropdown,
  NavBar,
} from "@/shared/ui/common";
import { buildRowActions } from "@/utils/actions";

import { ContactInfoCards } from "./ContactInfoCards";
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

  const [activeTab, setActiveTab] = useState(defaultInfoTab);
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

  const getFullAddress = () => {
    const parts = [
      contact.street_address,
      contact.city,
      contact.state,
      contact.zip_code,
    ].filter(Boolean);
    return parts.join(", ");
  };

  const canViewLogs = Boolean(canReadContact && orgId);

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
    [canDeleteContact, dialogManager, contact, onDelete]
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

  return (
    <DetailViewPage
      actions={
        <>
          {canViewLogs ? (
            <Button
              aria-label="View logs"
              title="View logs"
              variant={ButtonVariantEnum.SURFACE}
              onClick={() =>
                router.push(orgPath(orgId!, `/contact/${contact.id}/logs`))
              }
            />
          ) : null}
          {items.length > 0 ? <Dropdown items={items} /> : null}
        </>
      }
      backLabel="Back to contacts"
      className="flex-1"
      constrainBodyWidth={false}
      contentClassName="pt-5"
      footer={<DialogManager manager={dialogManager} />}
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
      subtitle={
        <>
          {contact.full_name?.trim() || "Unnamed contact"}
          {getFullAddress() ? (
            <span className="text-text-muted mt-0.5 block text-xs font-normal">
              {getFullAddress()}
            </span>
          ) : null}
        </>
      }
      onBack={onBack}
    >
      <NavBar
        activeTab={activeTab}
        className="mb-4"
        setActiveTab={setActiveTab}
        tabs={tabs}
      />

      {isContactInfoTab ? (
        <ContactInfoCards
          canEdit={!!canEditContact}
          contact={contact}
          isFarmManagement={isFarmManagement}
        />
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
