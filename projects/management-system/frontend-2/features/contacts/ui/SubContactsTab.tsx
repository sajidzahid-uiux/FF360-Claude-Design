"use client";
import { useCallback, useMemo, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  type TableBulkAction,
} from "@fieldflow360/org-ui";
import { User } from "lucide-react";

import type { SubContactSummary } from "@/api/types";
import {
  CONTACT_TYPE_LABELS,
  MAX_SUB_CONTACTS,
  SUB_CONTACTS_LINK_DESCRIPTION,
} from "@/features/contacts";
import {
  useDebounceNavigation,
  useDialogManager,
  useRouteIds,
  useSubContactMutations,
  useSubContacts,
} from "@/hooks";
import { useRoutePermissions } from "@/hooks/permissions";
import { OrgUiDataTable, type OrgUiDataTableColumn } from "@/shared/ui";
import { DialogManager } from "@/shared/ui/common";

import AddSubContactDialog from "./AddSubContactDialog";

interface SubContactsTabProps {
  parentContactId: number;
}

function ContactTypeBadge({ subtype }: { subtype?: string }) {
  const label =
    subtype === "farm_management"
      ? CONTACT_TYPE_LABELS.farm_management
      : CONTACT_TYPE_LABELS.standard;
  return (
    <span className="bg-foreground text-background rounded-full px-3 py-1 text-xs font-medium">
      {label}
    </span>
  );
}

function CategoryBadges({
  categories,
}: {
  categories: SubContactSummary["categories"];
}) {
  if (!categories?.length) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {categories.map((cat) => (
        <span
          key={cat.id}
          className="rounded-full px-3 py-1 text-xs font-medium text-white"
          style={{ backgroundColor: cat.color || "#3b82f6" }}
        >
          {cat.name}
        </span>
      ))}
    </div>
  );
}

export default function SubContactsTab({
  parentContactId,
}: SubContactsTabProps) {
  const { navigateTo } = useDebounceNavigation();
  const { orgId } = useRouteIds();
  const dialogManager = useDialogManager();
  const { write: canEditContact } = useRoutePermissions() || {};

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const { subContacts, isLoading, refetch } = useSubContacts(parentContactId);
  const { updateSubContacts } = useSubContactMutations(parentContactId);

  const filteredSubContacts = useMemo(() => {
    if (!searchTerm.trim()) return subContacts;
    const q = searchTerm.toLowerCase();
    return subContacts.filter(
      (s) =>
        s.full_name.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.phone_number?.includes(q)
    );
  }, [subContacts, searchTerm]);

  const linkedIds = useMemo(() => subContacts.map((s) => s.id), [subContacts]);

  const handleViewContact = useCallback(
    (sub: SubContactSummary) => {
      navigateTo(`/${orgId}/contact/${sub.id}`);
    },
    [navigateTo, orgId]
  );

  const handleUnlink = useCallback(
    (sub: SubContactSummary) => {
      dialogManager.openConfirmationDialog({
        title: "Remove Sub-Contact",
        description: `Remove "${sub.full_name}" from this Farm Management Contact? The contact will not be deleted.`,
        variant: "destructive",
        confirmButtonText: "Remove",
        onConfirm: async () => {
          await updateSubContacts.mutateAsync(
            linkedIds.filter((id) => id !== sub.id)
          );
          dialogManager.closeDialog();
          void refetch();
        },
      });
    },
    [dialogManager, updateSubContacts, linkedIds, refetch]
  );

  const handleBulkUnlink = useCallback(() => {
    if (selectedIds.length === 0) return;
    dialogManager.openConfirmationDialog({
      title: `Remove ${selectedIds.length} Sub-Contact(s)`,
      description: "Selected sub-contacts will be unlinked but not deleted.",
      variant: "destructive",
      confirmButtonText: "Remove All",
      onConfirm: async () => {
        const selectedSet = new Set(selectedIds);
        await updateSubContacts.mutateAsync(
          linkedIds.filter((id) => !selectedSet.has(id))
        );
        setSelectedIds([]);
        dialogManager.closeDialog();
        void refetch();
      },
    });
  }, [selectedIds, dialogManager, updateSubContacts, linkedIds, refetch]);

  const columns = useMemo((): OrgUiDataTableColumn<SubContactSummary>[] => {
    const baseColumns: OrgUiDataTableColumn<SubContactSummary>[] = [
      {
        key: "full_name",
        label: "Contact Name",
        render: (sub) => (
          <button
            className="flex items-center gap-2 font-medium hover:underline"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleViewContact(sub);
            }}
          >
            <User className="text-text-muted h-4 w-4" />
            {sub.full_name}
          </button>
        ),
        width: "220px",
      },
      {
        key: "contact_type",
        label: "Contact Type",
        render: () => <ContactTypeBadge subtype="standard" />,
        width: "140px",
      },
      {
        key: "categories",
        label: "Contact Category",
        render: (sub) => <CategoryBadges categories={sub.categories} />,
        width: "200px",
      },
      {
        key: "created_at",
        label: "Created at",
        render: (sub) => {
          const date = sub.created_at ? new Date(sub.created_at) : null;
          return (
            <span className="text-sm">
              {date ? date.toLocaleDateString() : "—"}
            </span>
          );
        },
        width: "120px",
      },
    ];

    if (!canEditContact) return baseColumns;

    return [
      ...baseColumns,
      {
        key: "actions",
        label: "Actions",
        render: (sub) => (
          <Button
            aria-label="Remove"
            size={ComponentSizeEnum.SM}
            title="Remove"
            variant={ButtonVariantEnum.SURFACE}
            onClick={() => handleUnlink(sub)}
          />
        ),
        width: "96px",
      },
    ];
  }, [canEditContact, handleUnlink, handleViewContact]);

  const bulkActions = useMemo((): TableBulkAction[] => {
    if (!canEditContact) return [];

    return [
      {
        id: "remove-selected",
        label: "Remove Selected",
        variant: "danger",
        onClick: handleBulkUnlink,
      },
    ];
  }, [canEditContact, handleBulkUnlink]);

  const canAddMore = !!canEditContact && subContacts.length < MAX_SUB_CONTACTS;

  return (
    <div className="mt-4 space-y-4">
      <p className="text-text-muted text-sm">{SUB_CONTACTS_LINK_DESCRIPTION}</p>

      <OrgUiDataTable
        bulkActions={bulkActions}
        columns={columns}
        data={filteredSubContacts}
        emptyState={{
          title: "No sub-contacts linked yet",
          description: "Link client contacts to this farm management contact.",
        }}
        isLoading={isLoading}
        search={{
          value: searchTerm,
          onChange: setSearchTerm,
          placeholder: "Search Contacts...",
        }}
        selectable={!!canEditContact}
        selectedIds={selectedIds}
        storageKey={`sub-contacts-table:${parentContactId}`}
        toolbarActions={
          canAddMore ? (
            <Button
              aria-label="Add"
              title="Add"
              onClick={() => setShowAddDialog(true)}
            />
          ) : undefined
        }
        onSelectChange={(ids) =>
          setSelectedIds(
            ids
              .map((id) => (typeof id === "string" ? parseInt(id, 10) : id))
              .filter((id) => !Number.isNaN(id))
          )
        }
      />

      {showAddDialog ? (
        <AddSubContactDialog
          linkedSubContactIds={linkedIds}
          open={showAddDialog}
          parentContactId={parentContactId}
          onLinked={() => void refetch()}
          onOpenChange={setShowAddDialog}
        />
      ) : null}

      <DialogManager manager={dialogManager} />
    </div>
  );
}
