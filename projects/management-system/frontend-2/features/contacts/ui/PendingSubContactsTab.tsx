"use client";
import { useCallback, useMemo, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
} from "@fieldflow360/org-ui";
import { User } from "lucide-react";

import type {
  Contact,
  ContactCategory,
  SubContactCreateAndLinkPayload,
} from "@/api/types";
import {
  CLIENT_CONTACT_CATEGORY_NAME,
  CONTACT_TYPE_LABELS,
  MAX_SUB_CONTACTS,
  type PendingSubContactEntry,
  type PendingSubContactTableRow,
  SUB_CONTACTS_PENDING_DESCRIPTION,
  pendingSubContactCategories,
  pendingSubContactDisplayName,
  pendingSubContactKey,
  toPendingSubContactTableRow,
} from "@/features/contacts/model";
import { useContactCategories } from "@/hooks";
import { useModalStack } from "@/shared/model/use-modal-stack";
import { OrgUiDataTable, type OrgUiDataTableColumn } from "@/shared/ui";

import AddPendingSubContactDialog from "./AddPendingSubContactDialog";

interface PendingSubContactsTabProps {
  pending: PendingSubContactEntry[];
  onChange: (next: PendingSubContactEntry[]) => void;
}

function ContactTypeBadge() {
  return (
    <span className="bg-foreground text-background rounded-full px-3 py-1 text-xs font-medium">
      {CONTACT_TYPE_LABELS.standard}
    </span>
  );
}

function CategoryBadges({ categories }: { categories: ContactCategory[] }) {
  if (!categories.length) return null;
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

function pendingCreatedAt(entry: PendingSubContactEntry): string {
  if (entry.kind === "existing" && entry.contact.created_at) {
    return new Date(entry.contact.created_at).toLocaleDateString();
  }
  return "—";
}

export default function PendingSubContactsTab({
  pending,
  onChange,
}: PendingSubContactsTabProps) {
  const { categories } = useContactCategories();
  const { stack, openModal, closeModalKey } = useModalStack();
  const [searchTerm, setSearchTerm] = useState("");
  const isAddOpen = stack.some((f) => f.key === "add-pending-subcontact");

  const excludedContactIds = useMemo(
    () => pending.filter((p) => p.kind === "existing").map((p) => p.contact.id),
    [pending]
  );

  const filteredPending = useMemo(() => {
    if (!searchTerm.trim()) return pending;
    const q = searchTerm.toLowerCase();
    return pending.filter((entry) => {
      const name = pendingSubContactDisplayName(entry).toLowerCase();
      const email =
        entry.kind === "existing"
          ? entry.contact.email?.toLowerCase()
          : entry.payload.email?.toLowerCase();
      const phone =
        entry.kind === "existing"
          ? entry.contact.phone_number
          : entry.payload.phone_number;
      return name.includes(q) || email?.includes(q) || phone?.includes(q);
    });
  }, [pending, searchTerm]);

  const tableRows = useMemo(
    () => filteredPending.map(toPendingSubContactTableRow),
    [filteredPending]
  );

  const handleRemove = useCallback(
    (key: string) => {
      onChange(pending.filter((entry) => pendingSubContactKey(entry) !== key));
    },
    [onChange, pending]
  );

  const handleLinkExisting = useCallback(
    (contact: Contact) => {
      if (pending.length >= MAX_SUB_CONTACTS) return;
      onChange([...pending, { kind: "existing", contact }]);
    },
    [onChange, pending]
  );

  const handleCreateNew = useCallback(
    (payload: SubContactCreateAndLinkPayload, displayName: string) => {
      if (pending.length >= MAX_SUB_CONTACTS) return;
      const clientCategory = categories?.find(
        (c) =>
          c.name.toLowerCase() === CLIENT_CONTACT_CATEGORY_NAME.toLowerCase()
      );
      onChange([
        ...pending,
        {
          kind: "new",
          tempId: `new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          displayName,
          payload,
          categories: clientCategory ? [clientCategory] : [],
        },
      ]);
    },
    [categories, onChange, pending]
  );

  const columns = useMemo(
    (): OrgUiDataTableColumn<PendingSubContactTableRow>[] => [
      {
        key: "full_name",
        label: "Contact Name",
        render: (row) => (
          <span className="flex items-center gap-2 font-medium">
            <User className="text-text-muted h-4 w-4" />
            {pendingSubContactDisplayName(row)}
          </span>
        ),
        width: "220px",
      },
      {
        key: "contact_type",
        label: "Contact Type",
        render: () => <ContactTypeBadge />,
        width: "140px",
      },
      {
        key: "categories",
        label: "Contact Category",
        render: (row) => (
          <CategoryBadges categories={pendingSubContactCategories(row)} />
        ),
        width: "200px",
      },
      {
        key: "created_at",
        label: "Created at",
        render: (row) => (
          <span className="text-sm">{pendingCreatedAt(row)}</span>
        ),
        width: "120px",
      },
      {
        key: "actions",
        label: "Actions",
        render: (row) => (
          <Button
            aria-label="Remove"
            size={ComponentSizeEnum.SM}
            title="Remove"
            variant={ButtonVariantEnum.SURFACE}
            onClick={() => handleRemove(pendingSubContactKey(row))}
          />
        ),
        width: "96px",
      },
    ],
    [handleRemove]
  );

  const canAddMore = pending.length < MAX_SUB_CONTACTS;

  return (
    <div className="space-y-4">
      <p className="text-text-muted text-sm">
        {SUB_CONTACTS_PENDING_DESCRIPTION}
      </p>

      <OrgUiDataTable
        columns={columns}
        data={tableRows}
        emptyState={{
          title: "No sub-contacts added yet",
          description: "Add sub-contacts before submitting this farm contact.",
        }}
        isLoading={false}
        search={{
          value: searchTerm,
          onChange: setSearchTerm,
          placeholder: "Search Contacts...",
        }}
        storageKey="pending-sub-contacts-table"
        toolbarActions={
          canAddMore ? (
            <Button
              aria-label="Add"
              title="Add"
              onClick={() => openModal("add-pending-subcontact")}
            />
          ) : undefined
        }
      />

      <AddPendingSubContactDialog
        excludedContactIds={excludedContactIds}
        open={isAddOpen}
        pendingCount={pending.length}
        onCreateNew={handleCreateNew}
        onLinkExisting={handleLinkExisting}
        onOpenChange={(o) => {
          if (!o) closeModalKey("add-pending-subcontact");
        }}
      />
    </div>
  );
}
