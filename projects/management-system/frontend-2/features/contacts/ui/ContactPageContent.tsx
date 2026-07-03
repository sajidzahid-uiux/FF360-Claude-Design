"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { toast } from "sonner";

import type { Contact } from "@/api/types";
import {
  CategoriesTab,
  type ContactPageTab,
  ContactsBreadcrumbToolbar,
  ContactsTable,
} from "@/features/contacts";
import {
  buildContactTableRows,
  contactSortToTableSortRules,
  contactsTableQueryToListParams,
  tableSortRulesToContactSort,
} from "@/features/contacts/lib";
import { useContactsPageUi } from "@/features/contacts/model/contacts-page-store";
import {
  useContactCategories,
  useContactMutations,
  useContacts,
  useDebounceNavigation,
  useDialogManager,
  usePersistentStorage,
  useRouteIds,
} from "@/hooks";
import { useRoutePermissions } from "@/hooks/permissions";
import { bulkConfirmationCopy, bulkDeleteSuccessMessage } from "@/shared/lib";
import {
  createCmsTableStateKey,
  useCmsServerTableQuery,
  useCmsTableQueryActions,
} from "@/shared/lib/table";
import { useModalStack } from "@/shared/model/use-modal-stack";
import { DialogManager, PageRenderer } from "@/shared/ui/common";
import { AccessDeniedView } from "@/shared/ui/permissions";

function toNumericIds(ids: (string | number)[]): number[] {
  return ids
    .map((id) => (typeof id === "string" ? Number.parseInt(id, 10) : id))
    .filter((id) => !Number.isNaN(id));
}

export default function OrgContactPage() {
  const {
    read: canViewContact,
    write: canEditContact,
    delete: canDeleteContact,
  } = useRoutePermissions() || {};

  const pathname = usePathname();
  const { navigateTo } = useDebounceNavigation();
  const searchParams = useSearchParams();
  const {
    tab,
    expandedParentIds,
    selectedContactIds,
    setTab,
    toggleExpandedParentId,
    setSelectedContactIds,
    clearSelectedContactIds,
    setExpandedParentIds,
  } = useContactsPageUi();

  const dialogManager = useDialogManager();
  const { openModal, stack: modalStack } = useModalStack();
  const isAddContactOpen = modalStack.some((f) => f.key === "add-contact");
  const storage = usePersistentStorage();
  const { orgId: organizationId } = useRouteIds();
  const { resetSlice: resetTableSlice } = useCmsTableQueryActions();

  const isContactsTab = tab === "Contacts";

  const tableKey = useMemo(
    () =>
      createCmsTableStateKey({
        pathname,
        orgId: organizationId ? Number(organizationId) : null,
        tabKey: "contacts",
      }) ?? "contacts_pending",
    [pathname, organizationId]
  );

  const [lastTotalPages, setLastTotalPages] = useState<number | undefined>();

  const {
    query,
    searchConfig,
    filterValues,
    setFilterValues,
    sortRules,
    setSortRules,
    buildPagination,
  } = useCmsServerTableQuery({
    tableKey,
    onQueryChange: () => {},
    totalPages: lastTotalPages,
  });

  useEffect(() => {
    if (!organizationId || sortRules.length > 0) return;

    const key = `contact_sort_org_${organizationId}`;
    const stored = storage.getItem(key);
    if (stored !== "az" && stored !== "za") return;

    setSortRules(contactSortToTableSortRules(stored));
  }, [organizationId, setSortRules, sortRules.length, storage]);

  const handleSortRulesChange = useCallback(
    (rules: typeof sortRules) => {
      setSortRules(rules);

      if (!organizationId) return;

      const key = `contact_sort_org_${organizationId}`;
      const sort = tableSortRulesToContactSort(rules);

      if (sort === "az") {
        storage.setItem(key, "az");
      } else if (sort === "za") {
        storage.setItem(key, "za");
      } else {
        storage.removeItem(key);
      }
    },
    [organizationId, setSortRules, storage]
  );

  const contactListParams = useMemo(
    () => contactsTableQueryToListParams(query),
    [query]
  );

  const {
    contacts,
    pagination: paginationInfo,
    isFetching: contactsFetching,
    isLoading,
    isError,
  } = useContacts(contactListParams, isContactsTab && Boolean(organizationId));

  const tableRows = useMemo(
    () => buildContactTableRows(contacts ?? [], expandedParentIds),
    [contacts, expandedParentIds]
  );

  useEffect(() => {
    setLastTotalPages(paginationInfo?.totalPages);
  }, [paginationInfo?.totalPages]);

  const pagination = useMemo(
    () =>
      buildPagination({
        source: paginationInfo,
        itemLabel: "contacts",
        isLoading: contactsFetching,
      }),
    [buildPagination, contactsFetching, paginationInfo]
  );

  const { remove: deleteContact, bulkDelete: deleteSelectedContacts } =
    useContactMutations();
  const { categories, isLoading: categoriesLoading } = useContactCategories();

  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "add" && !isAddContactOpen) {
      openModal("add-contact");
    }
  }, [searchParams, isAddContactOpen, openModal]);

  const handleTabChange = useCallback(
    (newTab: ContactPageTab) => {
      setTab(newTab);
      if (newTab !== "Contacts") {
        resetTableSlice(tableKey);
        clearSelectedContactIds();
        setExpandedParentIds(new Set());
      }
    },
    [
      clearSelectedContactIds,
      resetTableSlice,
      setExpandedParentIds,
      setTab,
      tableKey,
    ]
  );

  const handleToggleExpand = useCallback(
    (parentId: number) => {
      toggleExpandedParentId(parentId);
    },
    [toggleExpandedParentId]
  );

  const handleBulkDelete = useCallback(
    (selectedIds: (string | number)[]) => {
      const numericIds = toNumericIds(selectedIds);
      if (numericIds.length === 0) return;

      const count = numericIds.length;
      const { title, description, confirmButtonText } = bulkConfirmationCopy({
        count,
        entitySingular: "contact",
        entityPlural: "contacts",
        action: "delete",
      });

      dialogManager.openConfirmationDialog({
        title,
        description,
        variant: "destructive",
        confirmButtonText,
        onConfirm: async () => {
          try {
            await deleteSelectedContacts.mutateAsync(numericIds);
            toast.success(
              bulkDeleteSuccessMessage(count, "contact", "contacts", {
                pastTense: "deleted successfully",
              })
            );
            dialogManager.closeDialog();
            setSelectedContactIds([]);
          } catch (error: unknown) {
            console.error("Failed to delete contacts:", error);
            toast.error("Failed to delete contacts");
            dialogManager.setConfirmationProcessing(false);
          }
        },
      });
    },
    [dialogManager, deleteSelectedContacts, setSelectedContactIds]
  );

  const handleSelectChange = useCallback(
    (ids: (string | number)[]) => {
      setSelectedContactIds(toNumericIds(ids));
    },
    [setSelectedContactIds]
  );

  const handleNavigateToContact = useCallback(
    (contact: Contact) => {
      navigateTo(`/organizations/${organizationId}/contact/${contact.id}`);
    },
    [navigateTo, organizationId]
  );

  const handleDeleteContact = useCallback(
    (contact: Contact) => {
      dialogManager.openConfirmationDialog({
        title: "Delete Contact",
        confirmationType: "delete",
        itemTitle: contact.full_name || `Contact #${contact.id}`,
        variant: "destructive",
        confirmButtonText: "Delete",
        onConfirm: async () => {
          try {
            await deleteContact.mutateAsync(contact.id);
            toast.success("Contact deleted successfully");
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
    [dialogManager, deleteContact]
  );

  const handleContactLogs = useCallback(
    (contact: Contact) => {
      navigateTo(`/organizations/${organizationId}/contact/${contact.id}/logs`);
    },
    [navigateTo, organizationId]
  );

  return (
    <>
      {canViewContact ? (
        <ContactsBreadcrumbToolbar
          currentTab={tab}
          onTabChange={handleTabChange}
        />
      ) : null}
      <PageRenderer
        data={isContactsTab ? tableRows : []}
        description="Manage your organization's contacts."
        emptyState={{
          title: "No contacts found",
          description: "Try adjusting your search or filters to find contacts.",
        }}
        error={isError ? new Error("Failed to load contacts") : null}
        isLoading={isLoading || false}
        loadingMessage="Loading contacts..."
        renderChildrenWhenEmpty={true}
        title="Contact Information"
      >
        {() => {
          if (!canViewContact) {
            return (
              <AccessDeniedView message="You do not have permission to view contacts." />
            );
          }

          return (
            <>
              {isContactsTab ? (
                <ContactsTable
                  canDelete={!!canDeleteContact}
                  canEdit={!!canEditContact}
                  canView={!!canViewContact}
                  categories={categories || []}
                  data={tableRows}
                  expandedParentIds={expandedParentIds}
                  filterValues={filterValues}
                  isLoading={contactsFetching}
                  pagination={pagination}
                  search={searchConfig}
                  selectable={!!canDeleteContact}
                  selectedIds={selectedContactIds}
                  sortRules={sortRules}
                  onAddFarmContact={() => openModal("add-farm-contact")}
                  onAddStandardContact={() => openModal("add-contact")}
                  onBulkDelete={handleBulkDelete}
                  onContactLogs={handleContactLogs}
                  onDeleteContact={handleDeleteContact}
                  onFilterValuesChange={setFilterValues}
                  onNavigateToContact={handleNavigateToContact}
                  onSelectChange={handleSelectChange}
                  onSortRulesChange={handleSortRulesChange}
                  onToggleExpand={handleToggleExpand}
                  onViewContact={handleNavigateToContact}
                />
              ) : null}

              {!isContactsTab ? (
                <CategoriesTab
                  canDelete={!!canDeleteContact}
                  canEdit={!!canEditContact}
                  categories={categories || []}
                  isLoading={categoriesLoading}
                />
              ) : null}

              <DialogManager manager={dialogManager} />
            </>
          );
        }}
      </PageRenderer>
    </>
  );
}
