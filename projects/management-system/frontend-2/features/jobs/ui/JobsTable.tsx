"use client";

import { useCallback, useMemo } from "react";

import {
  Button,
  type TableBulkAction,
  type TableFilterDefinition,
  type TableFilterValue,
  type TableGridViewConfig,
  type TableKanbanViewConfig,
  type TablePaginationConfig,
  type TableSearchConfig,
  type TableSortRule,
  type TableViewMode,
} from "@fieldflow360/org-ui";
import { Archive, ListTree, PlusCircle, Trash2, Undo2 } from "lucide-react";
import { toast } from "sonner";

import type { DesignRequestStatus, JobType, Status } from "@/api/types";
import { JOB_KANBAN_COLUMN_WIDTH, ViewMode } from "@/constants";
import {
  JobLeadTable,
  filterStateToTableValues,
  tableValuesToFilterState,
  toNumericIds,
} from "@/features/job-lead/ui/JobLeadTable";
import type { JobsPageTab } from "@/features/jobs";
import { JobGridCard } from "@/features/jobs";
import {
  type JobOrgUiColumnHandlers,
  type JobTableRow,
  getJobOrgUiColumns,
  resolveJobItemStatusKey,
} from "@/features/jobs/lib/columns";
import { buildActiveJobOrgUiMobileColumns } from "@/features/jobs/lib/columns/buildActiveJobOrgUiMobileColumns";
import { useIsMobile } from "@/hooks";
import { usePatchJob } from "@/hooks/mutations";
import type { FilterState, FilterType } from "@/shared/ui/common";

export interface JobsTableProps {
  data: JobTableRow[];
  isLoading?: boolean;
  pagination?: TablePaginationConfig;
  organizationId?: string | number | null;
  search: TableSearchConfig;
  filters: FilterState;
  filterType: FilterType;
  onFilterChange: (filters: FilterState) => void;
  sortRules: TableSortRule[];
  onSortRulesChange: (rules: TableSortRule[]) => void;
  view: TableViewMode;
  onViewChange: (view: TableViewMode) => void;
  selectedIds: (string | number)[];
  onSelectChange: (ids: (string | number)[]) => void;
  currentTab: JobsPageTab;
  jobType: JobType;
  statusTypes: Status[];
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canEditSettings: boolean;
  onAddJob: () => void;
  onAddJobStatus: () => void;
  onShowMore: (id: number, isArchived?: boolean) => void;
  onLogs?: (id: number, isArchived?: boolean) => void;
  onTrash: (id: number) => void;
  onUnarchive: (id: number) => void;
  onArchive: (id: number) => void;
  onOnSiteTracking?: (id: number) => void;
  onTrashSelectedJobs: (jobIds: number[]) => void;
  onArchiveSelectedJobs: (jobIds: number[]) => void;
  onUnarchiveSelectedJobs: (jobIds: number[]) => void;
  designRequestStatusMap?: Map<number, DesignRequestStatus>;
}

const JOB_SORTABLE_COLUMNS = [
  { key: "customer_name", label: "Job Name" },
  { key: "last_updated", label: "Last Updated" },
] as const;

export function JobsTable({
  data,
  isLoading,
  pagination,
  organizationId,
  search,
  filters,
  filterType,
  onFilterChange,
  sortRules,
  onSortRulesChange,
  view,
  onViewChange,
  selectedIds,
  onSelectChange,
  currentTab,
  jobType,
  statusTypes,
  canAdd,
  canEdit,
  canDelete,
  canEditSettings,
  onAddJob,
  onAddJobStatus,
  onShowMore,
  onLogs,
  onTrash,
  onUnarchive,
  onArchive,
  onOnSiteTracking,
  onTrashSelectedJobs,
  onArchiveSelectedJobs,
  onUnarchiveSelectedJobs,
  designRequestStatusMap,
}: JobsTableProps) {
  const isArchived = currentTab === "archived";
  const isOnHold = currentTab === "on_hold";
  const isMobile = useIsMobile();
  const patchJob = usePatchJob();
  const showKanbanView = currentTab === "active";

  const columnHandlers = useMemo(
    (): JobOrgUiColumnHandlers => ({
      isArchived,
      jobType,
      statusTypes,
      getDesignRequestStatus: designRequestStatusMap
        ? (jobId) => designRequestStatusMap.get(jobId)
        : undefined,
      onShowMore,
      onLogs,
      onTrash,
      onUnarchive,
      onArchive,
      onOnSiteTracking,
      designRequestStatusMap,
    }),
    [
      designRequestStatusMap,
      isArchived,
      jobType,
      onArchive,
      onLogs,
      onOnSiteTracking,
      onShowMore,
      onTrash,
      onUnarchive,
      statusTypes,
    ]
  );

  const resolvedView =
    (isArchived || isOnHold) && view === ViewMode.KANBAN ? ViewMode.LIST : view;

  const allColumns = useMemo(() => {
    if (isMobile && resolvedView !== ViewMode.KANBAN) {
      return buildActiveJobOrgUiMobileColumns(columnHandlers);
    }
    return getJobOrgUiColumns(columnHandlers);
  }, [columnHandlers, isMobile, resolvedView]);

  const filterDefinitions = useMemo(
    (): TableFilterDefinition[] => [
      {
        id: filterType,
        label: "Status",
        options: statusTypes.map((status) => ({
          value: String(status.id),
          label: status.title,
        })),
      },
    ],
    [filterType, statusTypes]
  );

  const filterValues = useMemo(
    () => filterStateToTableValues(filters),
    [filters]
  );

  const handleFilterValuesChange = useCallback(
    (values: TableFilterValue[]) => {
      onFilterChange(tableValuesToFilterState<FilterState>(values));
    },
    [onFilterChange]
  );

  const canSelectRows = canEdit || canDelete;

  const bulkActions = useMemo((): TableBulkAction[] => {
    const actions: TableBulkAction[] = [];

    if (!isArchived && canDelete) {
      actions.push({
        id: "trash-selected",
        label: "Trash Selected",
        icon: <Trash2 aria-hidden className="h-4 w-4" strokeWidth={2} />,
        variant: "danger",
        onClick: (ids) => onTrashSelectedJobs(toNumericIds(ids)),
      });
    }

    if (canEdit) {
      if (isArchived) {
        actions.push({
          id: "unarchive-selected",
          label: "Unarchive Selected",
          icon: <Undo2 aria-hidden className="h-4 w-4" strokeWidth={2} />,
          onClick: (ids) => onUnarchiveSelectedJobs(toNumericIds(ids)),
        });
      } else {
        actions.push({
          id: "archive-selected",
          label: "Archive Selected",
          icon: <Archive aria-hidden className="h-4 w-4" strokeWidth={2} />,
          onClick: (ids) => onArchiveSelectedJobs(toNumericIds(ids)),
        });
      }
    }

    return actions;
  }, [
    canDelete,
    canEdit,
    isArchived,
    onArchiveSelectedJobs,
    onTrashSelectedJobs,
    onUnarchiveSelectedJobs,
  ]);

  const renderCollectionCard = useCallback(
    (
      job: JobTableRow,
      context: {
        selected: boolean;
        onSelectedChange: (selected: boolean) => void;
      }
    ) => (
      <JobGridCard
        handlers={columnHandlers}
        job={job}
        selectable={canSelectRows}
        selected={context.selected}
        statusTypes={statusTypes}
        onDoubleClick={() => onShowMore(job.id, isArchived)}
        onSelectedChange={context.onSelectedChange}
      />
    ),
    [canSelectRows, columnHandlers, isArchived, onShowMore, statusTypes]
  );

  const grid = useMemo(
    (): TableGridViewConfig<JobTableRow> => ({
      renderCard: renderCollectionCard,
      minColumnWidth: "minmax(18rem, 1fr)",
    }),
    [renderCollectionCard]
  );

  const kanban = useMemo((): TableKanbanViewConfig<JobTableRow> | undefined => {
    if (isArchived || isOnHold) return undefined;

    return {
      columns: statusTypes.map((status) => ({
        key: String(status.id),
        label: status.title,
        color: status.color,
      })),
      getItemStatus: resolveJobItemStatusKey,
      renderCard: renderCollectionCard,
      draggable: canEdit,
      columnMinWidth: `min(${JOB_KANBAN_COLUMN_WIDTH}, 85vw)`,
      onItemMove: async (event) => {
        if (event.fromColumnKey === event.toColumnKey) return;

        const nextStatus = statusTypes.find(
          (status) => String(status.id) === event.toColumnKey
        );
        const statusId = parseInt(event.toColumnKey, 10);
        if (Number.isNaN(statusId)) {
          toast.error("Invalid job status");
          return;
        }

        try {
          await patchJob.mutateAsync({
            id: event.item.id,
            updatedJob: { job_status: statusId },
            jobType,
          });
          toast.success(
            nextStatus
              ? `Job moved to ${nextStatus.title}`
              : "Job status updated"
          );
        } catch {
          // usePatchJob surfaces API errors via toast
        }
      },
    };
  }, [
    canEdit,
    isArchived,
    isOnHold,
    jobType,
    patchJob,
    renderCollectionCard,
    statusTypes,
  ]);

  const toolbarActions = (
    <div className="flex shrink-0 items-center gap-2">
      {canAdd ? (
        <Button
          leftIcon={<PlusCircle aria-hidden className="h-4 w-4" />}
          title="Add Job"
          onClick={onAddJob}
        />
      ) : null}
      {canEditSettings ? (
        <Button
          leftIcon={<ListTree aria-hidden className="h-4 w-4" />}
          title="Add Job Status"
          onClick={onAddJobStatus}
        />
      ) : null}
    </div>
  );

  return (
    <JobLeadTable
      bulkActions={bulkActions}
      columns={allColumns}
      data={data}
      emptyState={{
        title: "No jobs found",
        description: isArchived
          ? "No archived jobs found."
          : "Try adjusting your search or filters to find jobs.",
      }}
      filterDefinitions={filterDefinitions}
      filterValues={filterValues}
      grid={grid}
      isLoading={isLoading}
      kanban={kanban}
      organizationId={organizationId}
      pagination={pagination}
      search={search}
      selectable={canSelectRows}
      selectedIds={selectedIds}
      showKanbanView={showKanbanView}
      sortableColumns={[...JOB_SORTABLE_COLUMNS]}
      sortRules={sortRules}
      storageKeyPrefix="jobs"
      toolbarActions={toolbarActions}
      view={resolvedView}
      onFilterValuesChange={handleFilterValuesChange}
      onSelectChange={onSelectChange}
      onSortRulesChange={onSortRulesChange}
      onViewChange={onViewChange}
    />
  );
}
