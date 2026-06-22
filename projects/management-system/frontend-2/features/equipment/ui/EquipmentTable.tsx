"use client";

import { useCallback, useMemo } from "react";

import {
  Button,
  Dropdown,
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
  useTablePreferences,
} from "@fieldflow360/org-ui";
import { Plus, Trash2 } from "lucide-react";

import { EQUIPMENT_TYPE_OPTIONS, EquipmentTypeEnum } from "@/api/types";
import type { EquipmentPageData } from "@/features/equipment";
import {
  type EquipmentOrgUiColumnHandlers,
  getEquipmentOrgUiColumns,
} from "@/features/equipment/lib/columns";
import { EquipmentGridCard } from "@/features/equipment/ui/EquipmentGridCard";
import { useRouteIds } from "@/hooks";
import { CmsOrgUiTable } from "@/shared/ui";

export interface EquipmentTableProps {
  data: EquipmentPageData[];
  isLoading?: boolean;
  pagination?: TablePaginationConfig;
  search: TableSearchConfig;
  filterValues: TableFilterValue[];
  onFilterValuesChange: (values: TableFilterValue[]) => void;
  sortRules: TableSortRule[];
  onSortRulesChange: (rules: TableSortRule[]) => void;
  view: TableViewMode;
  onViewChange: (view: TableViewMode) => void;
  selectable?: boolean;
  selectedIds: (string | number)[];
  onSelectChange: (ids: (string | number)[]) => void;
  canViewEquipment: boolean;
  canEditEquipment: boolean;
  canDeleteEquipment: boolean;
  onAdd: (type: EquipmentTypeEnum) => void;
  onView: (equipment: EquipmentPageData) => void;
  onDelete: (equipment: EquipmentPageData) => void;
  onLogs: (equipment: EquipmentPageData) => void;
  onBulkDelete: (selectedIds: (string | number)[]) => void;
}

const EQUIPMENT_FILTERS: TableFilterDefinition[] = [
  {
    id: "equipment_type",
    label: "Equipment Type",
    options: EQUIPMENT_TYPE_OPTIONS,
    multiple: true,
  },
];

const EQUIPMENT_SORTABLE_COLUMNS = [{ key: "machine_name", label: "Name" }];

export function EquipmentTable({
  data,
  isLoading,
  pagination,
  search,
  filterValues,
  onFilterValuesChange,
  sortRules,
  onSortRulesChange,
  view,
  onViewChange,
  selectable = false,
  selectedIds,
  onSelectChange,
  canViewEquipment,
  canEditEquipment,
  canDeleteEquipment,
  onAdd,
  onView,
  onDelete,
  onLogs,
  onBulkDelete,
}: EquipmentTableProps) {
  const { orgId } = useRouteIds();

  const columnHandlers = useMemo(
    (): EquipmentOrgUiColumnHandlers => ({
      canDeleteEquipment,
      canViewEquipment,
      onDelete,
      onLogs,
      onView,
    }),
    [canDeleteEquipment, canViewEquipment, onDelete, onLogs, onView]
  );

  const allColumns = useMemo(
    () => getEquipmentOrgUiColumns(columnHandlers),
    [columnHandlers]
  );

  const tablePreferences = useTablePreferences(allColumns, {
    storageKey: orgId ? `equipment-table-columns:${orgId}` : undefined,
    defaultVariant: TableVariantEnum.PLAIN,
  });
  const columns = tablePreferences.applyColumns(allColumns);

  const bulkActions = useMemo((): TableBulkAction[] => {
    if (!canDeleteEquipment) return [];

    return [
      {
        id: "trash-selected",
        label: "Trash Selected",
        icon: <Trash2 aria-hidden className="h-4 w-4" strokeWidth={2} />,
        variant: "danger",
        onClick: onBulkDelete,
      },
    ];
  }, [canDeleteEquipment, onBulkDelete]);

  const renderGridCard = useCallback(
    (
      equipment: EquipmentPageData,
      context: {
        selected: boolean;
        onSelectedChange: (selected: boolean) => void;
      }
    ) => (
      <EquipmentGridCard
        equipment={equipment}
        handlers={columnHandlers}
        selectable={selectable}
        selected={context.selected}
        onDoubleClick={() => onView(equipment)}
        onSelectedChange={context.onSelectedChange}
      />
    ),
    [columnHandlers, onView, selectable]
  );

  const grid = useMemo(
    (): TableGridViewConfig<EquipmentPageData> => ({
      renderCard: renderGridCard,
      minColumnWidth: "minmax(18rem, 1fr)",
    }),
    [renderGridCard]
  );

  const toolbarActions = canEditEquipment ? (
    <Dropdown<EquipmentTypeEnum>
      fullWidth={false}
      menuMinWidth={180}
      options={EQUIPMENT_TYPE_OPTIONS}
      placeholder="Add Equipment"
      trigger={() => (
        <Button
          leftIcon={<Plus aria-hidden className="h-4 w-4" strokeWidth={2} />}
          title="Add Equipment"
        />
      )}
      onChange={onAdd}
    />
  ) : null;

  return (
    <CmsOrgUiTable
      bulkActions={bulkActions}
      columns={columns}
      data={data}
      dataMode={TableDataModeEnum.SERVER}
      emptyState={{
        title: "No equipment found",
        description: "Try adjusting your search or filters to find equipment.",
      }}
      grid={grid}
      isLoading={isLoading}
      pagination={pagination}
      selectable={selectable}
      selectedIds={selectedIds}
      showHeaderWhenEmpty={true}
      sortRules={sortRules}
      toolbar={
        <TableToolbar
          actions={toolbarActions}
          filters={EQUIPMENT_FILTERS}
          filterValues={filterValues}
          search={{
            ...search,
            placeholder: search.placeholder ?? "Search equipment…",
          }}
          showKanbanView={false}
          sortableColumns={EQUIPMENT_SORTABLE_COLUMNS}
          sortRules={sortRules}
          tableSettings={tablePreferences.tableSettings}
          variant={tablePreferences.variant}
          view={view}
          onFilterValuesChange={onFilterValuesChange}
          onSortRulesChange={onSortRulesChange}
          onViewChange={onViewChange}
        />
      }
      variant={tablePreferences.variant}
      view={view}
      onSelectChange={onSelectChange}
      onSortRulesChange={onSortRulesChange}
    />
  );
}
