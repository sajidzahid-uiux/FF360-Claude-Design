"use client";

import { useMemo, useState } from "react";

import {
  Button,
  Checkbox,
  ComponentSizeEnum,
  type TableBulkAction,
  TableDataModeEnum,
  type TableFilterDefinition,
  type TableFilterValue,
  type TableGridViewConfig,
  type TablePaginationConfig,
  type TableSearchConfig,
  type TableSortRule,
  TableToolbar,
  TableVariantEnum,
  type TableViewMode,
  TableViewModeEnum,
  useTablePreferences,
} from "@fieldflow360/org-ui";
import { Trash2, User } from "lucide-react";

import type { Contact, ContactCategory } from "@/api/types";
import { getContactOrgUiColumns } from "@/features/contacts/lib/columns";
import type { ContactTableRow } from "@/features/contacts/lib/contactTableRows";
import {
  CONTACTS_CATEGORY_FILTER_ID,
  CONTACTS_NAME_SORT_COLUMN_KEY,
  CONTACTS_SUBTYPE_FILTER_ID,
} from "@/features/contacts/lib/contacts-table-query";
import {
  CONTACT_SUBTYPE,
  CONTACT_TYPE_LABELS,
} from "@/features/contacts/model";
import { useRouteIds } from "@/hooks";
import { CmsOrgUiTable } from "@/shared/ui";

import { AddContactToolbar } from "./AddContactToolbar";

export interface ContactsTableProps {
  data: ContactTableRow[];
  categories: ContactCategory[];
  isLoading?: boolean;
  pagination?: TablePaginationConfig;
  search: TableSearchConfig;
  filterValues: TableFilterValue[];
  onFilterValuesChange: (values: TableFilterValue[]) => void;
  sortRules: TableSortRule[];
  onSortRulesChange: (rules: TableSortRule[]) => void;
  selectable?: boolean;
  selectedIds: (string | number)[];
  onSelectChange: (ids: (string | number)[]) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  canView?: boolean;
  onAddStandardContact?: () => void;
  onAddFarmContact?: () => void;
  onDeleteContact: (contact: Contact) => void;
  onViewContact: (contact: Contact) => void;
  onContactLogs: (contact: Contact) => void;
  onNavigateToContact: (contact: Contact) => void;
  onBulkDelete: (selectedIds: (string | number)[]) => void;
  expandedParentIds: Set<number>;
  onToggleExpand: (parentId: number) => void;
}

const CONTACT_SORTABLE_COLUMNS = [
  { key: CONTACTS_NAME_SORT_COLUMN_KEY, label: "Contact Name" },
] as const;

function ContactGridCard({
  row,
  selectable,
  selected,
  onSelectedChange,
  onOpen,
}: {
  row: ContactTableRow;
  selectable: boolean;
  selected: boolean;
  onSelectedChange: (selected: boolean) => void;
  onOpen: () => void;
}) {
  const typeLabel =
    row.contact_subtype === CONTACT_SUBTYPE.FARM_MANAGEMENT
      ? CONTACT_TYPE_LABELS.farm_management
      : CONTACT_TYPE_LABELS.standard;
  const phone = row.phone_number || row.home_phone_number;
  const cats = row.categories ?? [];

  return (
    <div
      className="border-border-subtle bg-bg-surface-elevated hover:bg-bg-hover/40 flex h-full cursor-pointer flex-col gap-3 rounded-xl border p-4 transition-colors"
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpen();
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <User aria-hidden className="text-text-muted h-4 w-4 shrink-0" />
          <span className="text-text-primary truncate font-semibold">
            {row.full_name}
          </span>
        </div>
        {selectable ? (
          <span
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <Checkbox
              aria-label={`Select ${row.full_name}`}
              checked={selected}
              size={ComponentSizeEnum.MD}
              onChange={(e) => onSelectedChange(e.target.checked)}
            />
          </span>
        ) : null}
      </div>

      <span className="bg-foreground text-background w-fit rounded-full px-2.5 py-0.5 text-xs font-medium">
        {typeLabel}
      </span>

      {phone ? (
        <span className="text-text-muted text-sm">{phone}</span>
      ) : null}

      {cats.length > 0 ? (
        <div className="mt-auto flex flex-wrap gap-1.5">
          {cats.map((cat) => (
            <span
              key={cat.id}
              className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
              style={{ backgroundColor: cat.color || "#3b82f6" }}
            >
              {cat.name}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ContactsTable({
  data,
  categories,
  isLoading,
  pagination,
  search,
  filterValues,
  onFilterValuesChange,
  sortRules,
  onSortRulesChange,
  selectable = false,
  selectedIds,
  onSelectChange,
  canEdit,
  canDelete,
  canView = false,
  onAddStandardContact,
  onAddFarmContact,
  onDeleteContact,
  onViewContact,
  onContactLogs,
  onNavigateToContact,
  onBulkDelete,
  expandedParentIds,
  onToggleExpand,
}: ContactsTableProps) {
  const { orgId } = useRouteIds();
  const [view, setView] = useState<TableViewMode>(TableViewModeEnum.LIST);

  const grid = useMemo(
    (): TableGridViewConfig<ContactTableRow> => ({
      minColumnWidth: "minmax(17rem, 1fr)",
      renderCard: (row, ctx) => (
        <ContactGridCard
          row={row}
          selectable={!!selectable}
          selected={ctx.selected}
          onOpen={() => onNavigateToContact(row)}
          onSelectedChange={ctx.onSelectedChange}
        />
      ),
    }),
    [selectable, onNavigateToContact]
  );

  const filterDefinitions = useMemo((): TableFilterDefinition[] => {
    const definitions: TableFilterDefinition[] = [
      {
        id: CONTACTS_SUBTYPE_FILTER_ID,
        label: "Contact Type",
        multiple: false,
        options: [
          {
            value: CONTACT_SUBTYPE.STANDARD,
            label: CONTACT_TYPE_LABELS.standard,
          },
          {
            value: CONTACT_SUBTYPE.FARM_MANAGEMENT,
            label: CONTACT_TYPE_LABELS.farm_management,
          },
        ],
      },
    ];

    if (categories.length > 0) {
      definitions.push({
        id: CONTACTS_CATEGORY_FILTER_ID,
        label: "Category",
        multiple: true,
        options: categories.map((category) => ({
          value: String(category.id),
          label: category.name,
        })),
      });
    }

    return definitions;
  }, [categories]);

  const allColumns = useMemo(
    () =>
      getContactOrgUiColumns({
        onDeleteContact,
        onViewContact,
        onContactLogs,
        onNavigateToContact,
        canDeleteContacts: canDelete,
        canReadContacts: canView,
        expandedParentIds,
        onToggleExpand,
      }),
    [
      canDelete,
      canView,
      expandedParentIds,
      onContactLogs,
      onDeleteContact,
      onNavigateToContact,
      onToggleExpand,
      onViewContact,
    ]
  );

  const tablePreferences = useTablePreferences(allColumns, {
    storageKey: orgId ? `contacts-table-columns:${orgId}` : undefined,
    defaultVariant: TableVariantEnum.PLAIN,
  });
  const columns = tablePreferences.applyColumns(allColumns);

  const bulkActions = useMemo((): TableBulkAction[] => {
    if (!canDelete) return [];

    return [
      {
        id: "delete-selected",
        label: "Delete Selected",
        icon: <Trash2 aria-hidden className="h-4 w-4" strokeWidth={2} />,
        variant: "danger",
        onClick: onBulkDelete,
      },
    ];
  }, [canDelete, onBulkDelete]);

  const toolbarActions =
    canEdit && onAddStandardContact && onAddFarmContact ? (
      <AddContactToolbar
        onAddFarmContact={onAddFarmContact}
        onAddStandardContact={onAddStandardContact}
      />
    ) : canEdit && onAddStandardContact ? (
      <Button
        aria-label="Add Contact"
        title="Add Contact"
        onClick={onAddStandardContact}
      />
    ) : null;

  return (
    <CmsOrgUiTable
      bulkActions={bulkActions}
      columns={columns}
      data={data}
      dataMode={TableDataModeEnum.SERVER}
      emptyState={{
        title: "No contacts found",
        description: "Try adjusting your search or filters to find contacts.",
      }}
      grid={grid}
      isLoading={isLoading}
      pagination={pagination}
      selectable={selectable}
      selectedIds={selectedIds}
      sortRules={sortRules}
      toolbar={
        <TableToolbar
          actions={toolbarActions}
          filters={filterDefinitions}
          filterValues={filterValues}
          search={{
            ...search,
            placeholder: search.placeholder ?? "Search Contacts…",
          }}
          sortableColumns={[...CONTACT_SORTABLE_COLUMNS]}
          sortRules={sortRules}
          tableSettings={tablePreferences.tableSettings}
          variant={tablePreferences.variant}
          view={view}
          onFilterValuesChange={onFilterValuesChange}
          onSortRulesChange={onSortRulesChange}
          onViewChange={setView}
        />
      }
      variant={tablePreferences.variant}
      view={view}
      onSelectChange={onSelectChange}
      onSortRulesChange={onSortRulesChange}
    />
  );
}
