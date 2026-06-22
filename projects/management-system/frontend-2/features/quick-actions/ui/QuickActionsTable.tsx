"use client";

import { useMemo } from "react";

import {
  Button,
  type TableBulkAction,
  TableDataModeEnum,
  type TablePaginationConfig,
  type TableSearchConfig,
  type TableSortRule,
  TableToolbar,
  TableVariantEnum,
  useTablePreferences,
} from "@fieldflow360/org-ui";
import { Plus, Trash2 } from "lucide-react";

import type { QuickAction } from "@/api/types";
import { getQuickActionOrgUiColumns } from "@/features/quick-actions/lib/columns";
import { CmsOrgUiTable } from "@/shared/ui";

export interface QuickActionsTableProps {
  data: QuickAction[];
  organizationId: string | null;
  isLoading?: boolean;
  pagination?: TablePaginationConfig;
  search: TableSearchConfig;
  sortRules: TableSortRule[];
  onSortRulesChange: (rules: TableSortRule[]) => void;
  selectable?: boolean;
  selectedIds: (string | number)[];
  onSelectChange: (ids: (string | number)[]) => void;
  canManage?: boolean;
  onAdd?: () => void;
  onView: (quickAction: QuickAction) => void;
  onEdit: (quickAction: QuickAction) => void;
  onDelete: (quickAction: QuickAction) => void;
  onBulkDelete: (selectedIds: (string | number)[]) => void;
}

const QUICK_ACTION_SORTABLE_COLUMNS = [
  { key: "name", label: "Name" },
  { key: "phone_number", label: "Phone" },
  { key: "email", label: "Email" },
] as const;

export function QuickActionsTable({
  data,
  organizationId,
  isLoading,
  pagination,
  search,
  sortRules,
  onSortRulesChange,
  selectable = false,
  selectedIds,
  onSelectChange,
  canManage = false,
  onAdd,
  onView,
  onEdit,
  onDelete,
  onBulkDelete,
}: QuickActionsTableProps) {
  const allColumns = useMemo(
    () =>
      getQuickActionOrgUiColumns({
        onView,
        onEdit,
        onDelete,
        canManage,
      }),
    [canManage, onDelete, onEdit, onView]
  );

  const tablePreferences = useTablePreferences(allColumns, {
    storageKey: organizationId
      ? `quick-actions-table-columns:${organizationId}`
      : undefined,
    defaultVariant: TableVariantEnum.PLAIN,
  });
  const columns = tablePreferences.applyColumns(allColumns);

  const bulkActions = useMemo((): TableBulkAction[] => {
    if (!canManage) return [];

    return [
      {
        id: "delete-selected",
        label: "Delete Selected",
        icon: <Trash2 aria-hidden className="h-4 w-4" strokeWidth={2} />,
        variant: "danger",
        onClick: onBulkDelete,
      },
    ];
  }, [canManage, onBulkDelete]);

  const toolbarActions =
    canManage && onAdd ? (
      <Button
        leftIcon={<Plus aria-hidden className="h-4 w-4" strokeWidth={2} />}
        title="Add Quick Action"
        onClick={onAdd}
      />
    ) : null;

  return (
    <CmsOrgUiTable
      bulkActions={bulkActions}
      columns={columns}
      data={data}
      dataMode={TableDataModeEnum.CLIENT}
      emptyState={{
        title: "No quick actions found",
        description:
          "There are no quick action items yet. Click Add Quick Action to create one.",
      }}
      isLoading={isLoading}
      pagination={pagination}
      selectable={selectable}
      selectedIds={selectedIds}
      sortRules={sortRules}
      toolbar={
        <TableToolbar
          actions={toolbarActions}
          search={{
            ...search,
            placeholder: search.placeholder ?? "Search quick actions…",
          }}
          showViewSwitcher={false}
          sortableColumns={[...QUICK_ACTION_SORTABLE_COLUMNS]}
          sortRules={sortRules}
          tableSettings={tablePreferences.tableSettings}
          variant={tablePreferences.variant}
          onSortRulesChange={onSortRulesChange}
        />
      }
      variant={tablePreferences.variant}
      onSelectChange={onSelectChange}
      onSortRulesChange={onSortRulesChange}
    />
  );
}
