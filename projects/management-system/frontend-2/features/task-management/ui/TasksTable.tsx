"use client";

import { useCallback, useMemo } from "react";

import {
  Button,
  type TableBulkAction,
  TableDataModeEnum,
  type TableFilterValue,
  type TableSearchConfig,
  type TableSortRule,
  TableToolbar,
  TableVariantEnum,
  useTablePreferences,
} from "@fieldflow360/org-ui";
import { Plus, Trash2 } from "lucide-react";

import type { Task, TaskStatus, TaskType } from "@/api/types";
import type { TeamMember } from "@/api/types/team";
import { TaskPriority } from "@/constants/enums";
import { getTaskOrgUiColumns } from "@/features/task-management/lib/columns/task-org-ui-columns";
import {
  buildTaskFilterDefinitions,
  filterStateToTableFilterValues,
  mergeTableFilterValuesIntoFilterState,
} from "@/features/task-management/lib/tasks-table-filters";
import { useRouteIds } from "@/hooks";
import { CmsOrgUiTable } from "@/shared/ui";
import { FilterState } from "@/shared/ui/common";

import { TaskDeadlineRangeFilter } from "./TaskDeadlineRangeFilter";

export interface TasksTableProps {
  data: Task[];
  isLoading?: boolean;
  search: TableSearchConfig;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  statusOptions: TaskStatus[];
  taskTypes: TaskType[];
  teamData?: TeamMember[];
  sortRules: TableSortRule[];
  onSortRulesChange: (rules: TableSortRule[]) => void;
  selectable?: boolean;
  selectedIds: (string | number)[];
  onSelectChange: (ids: (string | number)[]) => void;
  canEdit: boolean;
  canEditStatus: boolean;
  canDelete: boolean;
  onAdd?: () => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onBulkDelete: (selectedIds: (string | number)[]) => void;
  onRowDoubleClick?: (task: Task) => void;
  onStatusChange?: (task: Task, newStatusId: number) => void;
  onTypeChange?: (task: Task, newTypeId: number) => void;
  onOpenTaskTypeForm?: (type: TaskType | null) => void;
  onDeleteTypeWithConfirm?: (type: TaskType) => void;
  onPriorityChange?: (task: Task, newPriority: TaskPriority) => void;
  onDateChange?: (
    task: Task,
    field: "created_at" | "deadline",
    newDate: string
  ) => void;
  onAssigneesChange?: (task: Task, assigneeIds: number[]) => void;
}

const TASK_SORTABLE_COLUMNS = [
  { key: "task_name", label: "Task Name" },
  { key: "created_at", label: "Created at" },
  { key: "deadline", label: "Deadline" },
] as const;

export function TasksTable({
  data,
  isLoading,
  search,
  filters,
  onFiltersChange,
  statusOptions,
  taskTypes,
  teamData,
  sortRules,
  onSortRulesChange,
  selectable = false,
  selectedIds,
  onSelectChange,
  canEdit,
  canEditStatus,
  canDelete,
  onAdd,
  onEdit,
  onDelete,
  onBulkDelete,
  onRowDoubleClick,
  onStatusChange,
  onTypeChange,
  onOpenTaskTypeForm,
  onDeleteTypeWithConfirm,
  onPriorityChange,
  onDateChange,
  onAssigneesChange,
}: TasksTableProps) {
  const { orgId } = useRouteIds();

  const filterDefinitions = useMemo(
    () =>
      buildTaskFilterDefinitions({
        taskTypes,
        statusOptions,
        teamData,
      }),
    [statusOptions, taskTypes, teamData]
  );

  const filterValues = useMemo(
    () => filterStateToTableFilterValues(filters),
    [filters]
  );

  const handleFilterValuesChange = useCallback(
    (values: TableFilterValue[]) => {
      onFiltersChange(mergeTableFilterValuesIntoFilterState(filters, values));
    },
    [filters, onFiltersChange]
  );

  const allColumns = useMemo(
    () =>
      getTaskOrgUiColumns({
        canEdit,
        canEditStatus,
        canDelete,
        onEdit,
        onDelete,
        taskStatuses: statusOptions,
        taskTypes,
        teamMembers: teamData,
        onStatusChange,
        onTypeChange,
        onOpenTaskTypeForm,
        onDeleteTypeWithConfirm,
        onPriorityChange,
        onDateChange,
        onAssigneesChange,
        onRowDoubleClick,
      }),
    [
      canDelete,
      canEdit,
      canEditStatus,
      onAssigneesChange,
      onDateChange,
      onDelete,
      onDeleteTypeWithConfirm,
      onEdit,
      onOpenTaskTypeForm,
      onPriorityChange,
      onRowDoubleClick,
      onStatusChange,
      onTypeChange,
      statusOptions,
      taskTypes,
      teamData,
    ]
  );

  const tablePreferences = useTablePreferences(allColumns, {
    storageKey: orgId ? `tasks-table-columns:${orgId}` : undefined,
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

  const toolbarActions = (
    <div className="flex shrink-0 items-center gap-2">
      <TaskDeadlineRangeFilter
        filters={filters}
        onFiltersChange={onFiltersChange}
      />
      {canEdit && onAdd ? (
        <Button
          leftIcon={<Plus aria-hidden className="h-4 w-4" strokeWidth={2} />}
          title="Add New Task"
          onClick={onAdd}
        />
      ) : null}
    </div>
  );

  return (
    <CmsOrgUiTable
      bulkActions={bulkActions}
      columns={columns}
      data={data}
      dataMode={TableDataModeEnum.CLIENT}
      emptyState={{
        title: "No tasks found",
        description: "Try adjusting your search or filters to find tasks.",
      }}
      isLoading={isLoading}
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
            placeholder: search.placeholder ?? "Search tasks…",
          }}
          showViewSwitcher={false}
          sortableColumns={[...TASK_SORTABLE_COLUMNS]}
          sortRules={sortRules}
          tableSettings={tablePreferences.tableSettings}
          variant={tablePreferences.variant}
          onFilterValuesChange={handleFilterValuesChange}
          onSortRulesChange={onSortRulesChange}
        />
      }
      variant={tablePreferences.variant}
      onSelectChange={onSelectChange}
      onSortRulesChange={onSortRulesChange}
    />
  );
}
