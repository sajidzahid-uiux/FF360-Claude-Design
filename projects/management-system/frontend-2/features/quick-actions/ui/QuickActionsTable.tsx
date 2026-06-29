"use client";

import { useCallback, useMemo } from "react";

import {
  Button,
  type TableBulkAction,
  TableDataModeEnum,
  type TableFilterDefinition,
  type TableFilterValue,
  type TableGridViewConfig,
  type TablePaginationConfig,
  type TableSearchConfig,
  type TableSortRule,
  TableToolbar,
  type TableViewMode,
  TableVariantEnum,
  useTablePreferences,
} from "@fieldflow360/org-ui";
import { Plus, Trash2 } from "lucide-react";

import type { QuickAction } from "@/api/types";
import { type NotKanbanView, ViewMode } from "@/constants";
import { CONVERSION_TYPES, CONVERSION_TYPE_LABELS } from "@/constants/enums";
import { getQuickActionOrgUiColumns } from "@/features/quick-actions/lib/columns";
import {
  QUICK_ACTION_MODULE_FILTER_ID,
  QUICK_ACTION_UNCONVERTED,
} from "@/features/quick-actions/lib/quickActionModules";
import { QuickActionGridCard } from "@/features/quick-actions/ui/QuickActionGridCard";
import { CmsOrgUiTable } from "@/shared/ui";

export interface QuickActionsTableProps {
  data: QuickAction[];
  organizationId: string | null;
  isLoading?: boolean;
  pagination?: TablePaginationConfig;
  search: TableSearchConfig;
  sortRules: TableSortRule[];
  onSortRulesChange: (rules: TableSortRule[]) => void;
  view: NotKanbanView;
  onViewChange: (view: NotKanbanView) => void;
  filterValues: TableFilterValue[];
  onFilterValuesChange: (values: TableFilterValue[]) => void;
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

/** "Module" facet: the conversion targets plus the unconverted bucket. */
const QUICK_ACTION_FILTER_DEFINITIONS: TableFilterDefinition[] = [
  {
    id: QUICK_ACTION_MODULE_FILTER_ID,
    label: "Module",
    options: [
      ...CONVERSION_TYPES.map((type) => ({
        value: type,
        label: CONVERSION_TYPE_LABELS[type],
      })),
      { value: QUICK_ACTION_UNCONVERTED, label: "Unconverted" },
    ],
  },
];

export function QuickActionsTable({
  data,
  organizationId,
  isLoading,
  pagination,
  search,
  sortRules,
  onSortRulesChange,
  view,
  onViewChange,
  filterValues,
  onFilterValuesChange,
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
  const columnHandlers = useMemo(
    () => ({ onView, onEdit, onDelete, canManage }),
    [canManage, onDelete, onEdit, onView]
  );

  const allColumns = useMemo(
    () => getQuickActionOrgUiColumns(columnHandlers),
    [columnHandlers]
  );

  const handleViewChange = useCallback(
    (nextView: TableViewMode) => {
      if (nextView === ViewMode.KANBAN) return;
      onViewChange(nextView as NotKanbanView);
    },
    [onViewChange]
  );

  const grid = useMemo(
    (): TableGridViewConfig<QuickAction> => ({
      renderCard: (quickAction, context) => (
        <QuickActionGridCard
          handlers={columnHandlers}
          quickAction={quickAction}
          selectable={selectable}
          selected={context.selected}
          onActivate={() => onView(quickAction)}
          onSelectedChange={context.onSelectedChange}
        />
      ),
      minColumnWidth: "minmax(18rem, 1fr)",
    }),
    [columnHandlers, onView, selectable]
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
      grid={grid}
      isLoading={isLoading}
      pagination={pagination}
      selectable={selectable}
      selectedIds={selectedIds}
      sortRules={sortRules}
      toolbar={
        <TableToolbar
          showViewSwitcher
          actions={toolbarActions}
          filters={QUICK_ACTION_FILTER_DEFINITIONS}
          filterValues={filterValues}
          search={{
            ...search,
            placeholder: search.placeholder ?? "Search quick actions…",
          }}
          sortableColumns={[...QUICK_ACTION_SORTABLE_COLUMNS]}
          sortRules={sortRules}
          tableSettings={tablePreferences.tableSettings}
          variant={tablePreferences.variant}
          view={view}
          onFilterValuesChange={onFilterValuesChange}
          onSortRulesChange={onSortRulesChange}
          onViewChange={handleViewChange}
        />
      }
      variant={tablePreferences.variant}
      view={view}
      onRowActivate={(_, quickAction) => onView(quickAction)}
      onSelectChange={onSelectChange}
      onSortRulesChange={onSortRulesChange}
    />
  );
}
