"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type {
  TableBulkAction,
  TableFilterDefinition,
  TableGridViewConfig,
  TableViewMode,
} from "@fieldflow360/org-ui";
import { TableActions } from "@fieldflow360/org-ui";
import { Archive, Trash2, Undo2 } from "lucide-react";
import { toast } from "sonner";

import type { Job } from "@/api/types";
import {
  JobOrLeadType,
  JobType,
  ViewMode,
  jobTypeToRouteSegment,
} from "@/constants";
import { type TransformedJob, useCompletedPageUi } from "@/features/completed";
import { CompletedPageBreadcrumbToolbar } from "@/features/completed/ui/CompletedPageBreadcrumbToolbar";
import { ClientsAndFarmsCell } from "@/features/contacts";
import { ON_SITE_OPERATIONS_LABEL } from "@/features/contacts/model/constants";
import {
  AssignedToFilterSelect,
  formatMaterialStatusLabel,
} from "@/features/jobs";
import { useJobAssignedToFilter } from "@/features/jobs/hooks/useJobAssignedToFilter";
import { buildCompletedJobOrgUiMobileColumns } from "@/features/jobs/lib/columns/buildCompletedJobOrgUiMobileColumns";
import {
  VIEW_LIST_GRID,
  useDebouncedValue,
  useDialogManager,
  useIsMobile,
  useRouteIds,
  useTeamData,
  useViewPreference,
} from "@/hooks";
import {
  useArchiveJob,
  useTrashAndDeleteJob,
  useUnarchiveJob,
} from "@/hooks/mutations";
import { useCompletedJobPermissions } from "@/hooks/permissions";
import { useAllJobsQuery } from "@/hooks/queries";
import { orgPath, orgUrl } from "@/shared/config/routes";
import { bulkConfirmationCopy } from "@/shared/lib";
import { CMS_DEFAULT_PAGE_SIZE as DEFAULT_PAGE_SIZE } from "@/shared/lib/table";
import { INLINE_TABLE_ROW_ACTIONS_PROPS } from "@/shared/lib/table/columns";
import { mapDropdownItemsToTableActions } from "@/shared/lib/table/org-ui";
import {
  JobOrLeadListNameWithDescriptionCell,
  OrgUiDataTable,
  type OrgUiDataTableColumn,
  filterStateToTableValues,
  tableValuesToFilterState,
} from "@/shared/ui";
import { FilterState, FilterType } from "@/shared/ui/common";
import { buildRowActions } from "@/utils/actions";
import { getErrorMessage } from "@/utils/apiError";

import CompletedJobCard from "./CompletedJobCard";
import { CompletedPageLayout } from "./CompletedPageLayout";

const getJobTypeFromSubclass = (subclass: string): JobType => {
  switch (subclass) {
    case "ExcavationJob":
      return JobType.EXCAVATION;
    case "RepairJob":
      return JobType.REPAIR;
    case "Drainage_TilingJob":
      return JobType.TILING;
    default:
      return JobType.TILING;
  }
};

function memberIdFromJobLastUpdatedBy(
  value: Job["last_updated_by"] | undefined
): number | undefined {
  if (value === undefined || value === "") return undefined;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export default function CompletedJobsPage() {
  const router = useRouter();
  const { orgId: organizationId } = useRouteIds();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearchQuery = useDebouncedValue(searchQuery);

  // Get combined permissions for completed jobs page
  const { getJobPermissions, canViewPage, hasAnyWritePermission } =
    useCompletedJobPermissions();
  const isMobile = useIsMobile();

  const {
    data: jobs,
    isLoading: jobsLoading,
    error: jobsError,
  } = useAllJobsQuery({
    params: {
      not_coordination: true,
      completedPage: true,
      ...(debouncedSearchQuery ? { search: debouncedSearchQuery } : {}),
    },
  });

  const {
    data: archivedJobs,
    isLoading: archivedJobsLoading,
    error: archivedJobsError,
  } = useAllJobsQuery({
    params: {
      not_coordination: true,
      archived: true,
      completedPage: true,
      ...(debouncedSearchQuery ? { search: debouncedSearchQuery } : {}),
    },
  });

  const dialogManager = useDialogManager();
  const { filterActive, assignedTo } = useJobAssignedToFilter();

  const { data: teamData } = useTeamData();
  const archiveJob = useArchiveJob();
  const unarchiveJob = useUnarchiveJob();
  const trashAndDeleteJob = useTrashAndDeleteJob();

  const transformedJobs = ((jobs || []) as Job[]).map((job) => {
    const memberId = memberIdFromJobLastUpdatedBy(job.last_updated_by);
    return {
      ...job,
      last_updated_by:
        memberId === undefined
          ? undefined
          : teamData?.find((t) => t.id === memberId)?.user?.username,
      permissions: getJobPermissions(job.job_object_subclass ?? ""),
    };
  }) as TransformedJob[];

  const transformedArchivedJobs = ((archivedJobs || []) as Job[]).map((job) => {
    const memberId = memberIdFromJobLastUpdatedBy(job.last_updated_by);
    return {
      ...job,
      last_updated_by:
        memberId === undefined
          ? undefined
          : teamData?.find((t) => t.id === memberId)?.user?.username,
      permissions: getJobPermissions(job.job_object_subclass ?? ""),
    };
  }) as TransformedJob[];

  // Filter jobs for "Cancelled" and "Completed" statuses
  const filteredJobs = transformedJobs.filter(
    (job) => job.cancelled === true || job.job_status?.title === "Completed"
  );
  const filteredArchivedJobs = transformedArchivedJobs.filter(
    (job) => job.cancelled === true || job.job_status?.title === "Completed"
  );

  const {
    currentTab,
    selectedIds,
    setCurrentTab,
    setSelectedIds,
    clearSelection,
  } = useCompletedPageUi();
  const { view: currentView, setView } = useViewPreference(
    ViewMode.LIST,
    VIEW_LIST_GRID
  );
  const [filters, setFilters] = useState<FilterState>({
    [FilterType.STATUS]: [],
  });

  // Pagination ref for API calls (updated by pagination component callback)
  const currentPageRef = useRef<number>(1);
  const [, forceUpdate] = useState({});

  // Helper function to get short job type for URL
  const getJobTypeShort = (subclass: string): JobOrLeadType => {
    if (subclass === "RepairJob") return JobOrLeadType.REPAIR;
    if (subclass === "ExcavationJob") return JobOrLeadType.EXCAVATION;
    if (subclass === "Drainage_TilingJob") return JobOrLeadType.TILING;
    return JobOrLeadType.TILING; // default to Tiling
  };

  const handleRowAction = useCallback(
    (row: { id: number; job_object_subclass: string }) => {
      const jobType = getJobTypeShort(row.job_object_subclass);

      // Navigate to the job detail page
      const isArchived =
        archivedJobs?.some((job: { id: number }) => job.id === row.id) || false;
      router.push(
        `${orgUrl(organizationId, `/completed/${row.id}`, `archived=${isArchived}&fromCompleted=true&type=${jobType}`)}`
      );
    },
    [archivedJobs, router, organizationId]
  );

  const handleJobLogs = useCallback(
    (row: { id: number; job_object_subclass: string }, isArchived: boolean) => {
      const jobType = getJobTypeFromSubclass(
        row.job_object_subclass
      ) as JobType;
      const pathSegment = jobTypeToRouteSegment(jobType);
      const typeShort = getJobTypeShort(row.job_object_subclass);

      router.push(
        orgPath(
          organizationId,
          `/jobs/${pathSegment}/${row.id}/logs?archived=${isArchived}&fromCompleted=true&type=${typeShort}`
        )
      );
    },
    [router, organizationId]
  );

  // Handle row double click
  const handleRowDoubleClick = useCallback(
    (row: { id: number; job_object_subclass: string }) => {
      handleRowAction(row);
    },
    [handleRowAction]
  );

  // Archive/unarchive job
  const handleArchiveJob = useCallback(
    async ({ id }: { id: number }) => {
      // Find the job in either filteredJobs or filteredArchivedJobs
      const job = [...filteredJobs, ...filteredArchivedJobs].find(
        (j) => j.id === id
      );

      if (!job) return;

      const isArchived = archivedJobs?.some((j: { id: number }) => j.id === id);

      try {
        if (isArchived) {
          await unarchiveJob.mutateAsync({
            id,
            jobType: getJobTypeFromSubclass(job.job_object_subclass),
          });
        } else {
          await archiveJob.mutateAsync({
            id,
            jobType: getJobTypeFromSubclass(job.job_object_subclass),
          });
        }
      } catch (error) {
        console.error("Failed to archive/unarchive job:", error);
        toast.error("Failed to archive/unarchive job");
      }
    },
    [filteredJobs, filteredArchivedJobs, archivedJobs, archiveJob, unarchiveJob]
  );

  const handleDeleteJob = useCallback(
    async (job: {
      id: number;
      title?: string;
      job_number?: string;
      job_object_subclass: string;
      contact_info?: { full_name?: string };
      po_number?: string;
    }) => {
      const jobName =
        job?.contact_info?.full_name ||
        job?.title ||
        job?.job_number ||
        job?.po_number ||
        `Job #${job.id}`;
      dialogManager.openConfirmationDialog({
        title: "Delete Job",
        confirmationType: "delete",
        itemTitle: jobName,
        variant: "destructive",
        confirmButtonText: "Delete",
        onConfirm: async () => {
          try {
            await trashAndDeleteJob.mutateAsync({
              id: job.id,
              jobType: getJobTypeFromSubclass(job.job_object_subclass),
            });
            toast.success("Job trashed successfully");
            dialogManager.closeDialog();
          } catch (error: unknown) {
            console.error("Failed to trash job:", error);
            toast.error(getErrorMessage(error, "Failed to trash job"));
            dialogManager.setConfirmationProcessing(false);
            throw error;
          }
        },
      });
    },
    [dialogManager, trashAndDeleteJob]
  );

  const handleArchiveAll = useCallback(
    (ids: (string | number)[] = selectedIds) => {
      const normalizedSelectedIds = ids
        .map((id) => (typeof id === "string" ? parseInt(id, 10) : id))
        .filter((id) => !isNaN(id as number));
      const currentJobs =
        currentTab === "active" ? filteredJobs : filteredArchivedJobs;
      const selectedJobsFromIds = currentJobs.filter((job: TransformedJob) =>
        normalizedSelectedIds.includes(
          typeof job.id === "string" ? parseInt(job.id, 10) : job.id
        )
      );
      const validRows = selectedJobsFromIds.filter(
        (row) => row.permissions?.canEdit
      );
      const jobsToArchive = [...validRows];

      if (jobsToArchive.length === 0) {
        toast.error("No jobs with edit permission selected");
        return;
      }

      const archiveCount = jobsToArchive.length;
      const archiveCopy = bulkConfirmationCopy({
        count: archiveCount,
        entitySingular: "job",
        entityPlural: "jobs",
        action: currentTab === "archived" ? "unarchive" : "archive",
      });

      dialogManager.openConfirmationDialog({
        title: archiveCopy.title,
        description: archiveCopy.description,
        variant: "default",
        confirmButtonText: archiveCopy.confirmButtonText,
        onConfirm: async () => {
          try {
            dialogManager.setConfirmationProcessing(true);
            let successCount = 0;
            let errorCount = 0;
            const totalJobs = jobsToArchive.length;

            for (let i = 0; i < jobsToArchive.length; i++) {
              const job = jobsToArchive[i];

              // Find the job name to show in progress
              const jobName =
                job?.contact_info?.full_name ||
                job?.title ||
                job?.po_number ||
                `Job #${job.id}`;
              dialogManager.setConfirmationProgress(
                Math.round((i / totalJobs) * 100),
                jobName
              );

              try {
                const isArchived = archivedJobs?.some(
                  (archivedJob: { id: number }) => archivedJob.id === job.id
                );

                if (isArchived) {
                  await unarchiveJob.mutateAsync({
                    id: job.id,
                    jobType: getJobTypeFromSubclass(job.job_object_subclass),
                  });
                } else {
                  await archiveJob.mutateAsync({
                    id: job.id,
                    jobType: getJobTypeFromSubclass(job.job_object_subclass),
                  });
                }
                successCount++;
              } catch (error) {
                console.error(`Failed to process job ${job.id}:`, error);
                errorCount++;
              }

              dialogManager.setConfirmationProgress(
                Math.round(((i + 1) / totalJobs) * 100),
                jobName
              );
            }

            dialogManager.setConfirmationProgress(100);
            if (successCount > 0) {
              toast.success(`${successCount} job(s) processed successfully`);
            }
            if (errorCount > 0) {
              toast.error(`${errorCount} job(s) failed to process`);
            }

            clearSelection();
            dialogManager.closeDialog();
          } catch (error: unknown) {
            console.error("Failed to archive jobs:", error);
            toast.error(getErrorMessage(error, "Failed to archive jobs"));
            dialogManager.setConfirmationProcessing(false);
            throw error;
          }
        },
      });
    },
    [
      archiveJob,
      archivedJobs,
      currentTab,
      dialogManager,
      filteredArchivedJobs,
      filteredJobs,
      clearSelection,
      selectedIds,
      unarchiveJob,
    ]
  );

  const handleDeleteAll = useCallback(
    (ids: (string | number)[] = selectedIds) => {
      const normalizedSelectedIds = ids
        .map((id) => (typeof id === "string" ? parseInt(id, 10) : id))
        .filter((id) => !isNaN(id as number));
      const currentJobs =
        currentTab === "active" ? filteredJobs : filteredArchivedJobs;
      const selectedJobsFromIds = currentJobs.filter((job: TransformedJob) =>
        normalizedSelectedIds.includes(
          typeof job.id === "string" ? parseInt(job.id, 10) : job.id
        )
      );
      const validRows = selectedJobsFromIds.filter(
        (row) => row.permissions?.canDelete
      );
      const jobsToDelete = [...validRows];

      if (jobsToDelete.length === 0) {
        toast.error("No jobs with delete permission selected");
        return;
      }

      const deleteCount = jobsToDelete.length;
      const deleteCopy = bulkConfirmationCopy({
        count: deleteCount,
        entitySingular: "job",
        entityPlural: "jobs",
        action: "delete",
      });

      dialogManager.openConfirmationDialog({
        title: deleteCopy.title,
        description: deleteCopy.description,
        variant: "destructive",
        confirmButtonText: deleteCopy.confirmButtonText,
        onConfirm: async () => {
          try {
            dialogManager.setConfirmationProcessing(true);
            let successCount = 0;
            let errorCount = 0;
            const totalJobs = jobsToDelete.length;

            for (let i = 0; i < jobsToDelete.length; i++) {
              const job = jobsToDelete[i];

              // Find the job name to show in progress
              const jobName =
                job?.contact_info?.full_name ||
                job?.title ||
                job?.po_number ||
                `Job #${job.id}`;
              dialogManager.setConfirmationProgress(
                Math.round((i / totalJobs) * 100),
                jobName
              );

              try {
                await trashAndDeleteJob.mutateAsync({
                  id: job.id,
                  jobType: getJobTypeFromSubclass(job.job_object_subclass),
                });

                successCount++;
              } catch (error) {
                console.error(`Failed to delete job ${job.id}:`, error);
                errorCount++;
              }

              dialogManager.setConfirmationProgress(
                Math.round(((i + 1) / totalJobs) * 100),
                jobName
              );
            }

            dialogManager.setConfirmationProgress(100);
            if (successCount > 0) {
              toast.success(`${successCount} job(s) deleted successfully`);
            }
            if (errorCount > 0) {
              toast.error(`${errorCount} job(s) failed to delete`);
            }

            clearSelection();
            dialogManager.closeDialog();
          } catch (error: unknown) {
            console.error("Failed to delete jobs:", error);
            toast.error(getErrorMessage(error, "Failed to delete jobs"));
            dialogManager.setConfirmationProcessing(false);
            throw error;
          }
        },
      });
    },
    [
      currentTab,
      dialogManager,
      filteredArchivedJobs,
      filteredJobs,
      clearSelection,
      selectedIds,
      trashAndDeleteJob,
    ]
  );

  const statusFilters = useMemo(
    () => (filters[FilterType.STATUS] || []) as string[],
    [filters]
  );

  // Helper function to apply status filtering
  const applyStatusFilter = useCallback(
    (jobs: TransformedJob[]) => {
      if (Array.isArray(statusFilters) && statusFilters.length > 0) {
        return jobs.filter((job) => {
          if (job.cancelled && statusFilters.includes("Cancelled")) {
            return true;
          }
          if (
            job.job_status?.title === "Completed" &&
            statusFilters.includes("Completed")
          ) {
            return true;
          }
          return false;
        });
      }
      return jobs;
    },
    [statusFilters]
  );

  // Create status-filtered datasets for active and archived separately
  const statusFilteredActiveJobs = useMemo(() => {
    return applyStatusFilter(filteredJobs);
  }, [filteredJobs, applyStatusFilter]);

  const statusFilteredArchivedJobs = useMemo(() => {
    return applyStatusFilter(filteredArchivedJobs);
  }, [filteredArchivedJobs, applyStatusFilter]);

  const filteredActiveData = statusFilteredActiveJobs;
  const filteredArchivedData = statusFilteredArchivedJobs;

  const filteredData = useMemo(
    () => (currentTab === "active" ? filteredActiveData : filteredArchivedData),
    [currentTab, filteredActiveData, filteredArchivedData]
  );

  // Pagination info
  const paginationInfo = useMemo(() => {
    const totalCount = filteredData.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / DEFAULT_PAGE_SIZE));
    return {
      totalPages,
      totalCount,
      DEFAULT_PAGE_SIZE,
    };
  }, [filteredData.length]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPageRef.current - 1) * DEFAULT_PAGE_SIZE;
    const endIndex = startIndex + DEFAULT_PAGE_SIZE;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData]);

  // Reset page when search or filters change
  useEffect(() => {
    currentPageRef.current = 1;
    clearSelection();
    forceUpdate({});
  }, [assignedTo, clearSelection, currentTab, debouncedSearchQuery, filters]);

  // Handle page change from pagination component
  const handlePageChange = useCallback((page: number) => {
    currentPageRef.current = page;
    forceUpdate({});
  }, []);

  const desktopColumns = useMemo(
    (): OrgUiDataTableColumn<TransformedJob>[] => [
      {
        key: "title",
        label: "Job Name",
        render: (job) => (
          <JobOrLeadListNameWithDescriptionCell row={job} typeLabel="Job" />
        ),
      },
      {
        key: "clients_and_farms",
        label: `Clients and ${ON_SITE_OPERATIONS_LABEL}`,
        render: (job) => (
          <ClientsAndFarmsCell
            contactInfo={job.contact_info}
            farmName={job.farm_name}
          />
        ),
      },
      {
        key: "progress_bar",
        label: "Job Progress",
        render: (job) => String(job.progress_bar ?? "0/1"),
      },
      {
        key: "job_object_subclass",
        label: "Job Type",
        render: (job) =>
          job.job_object_subclass === "Drainage_TilingJob"
            ? "Tile Job"
            : job.job_object_subclass,
      },
      {
        key: "material_status",
        label: "Material Status",
        render: (job) =>
          job.job_object_subclass === "Drainage_TilingJob"
            ? formatMaterialStatusLabel(job.material_status) || null
            : null,
      },
      {
        key: "job_status",
        label: "Job Status",
        render: (job) => {
          const status = job.cancelled ? "Cancelled" : "Completed";
          return (
            <span
              className="rounded px-2 py-1 text-xs font-semibold text-white"
              style={{
                backgroundColor: status === "Cancelled" ? "#ef4444" : "#22c55e",
              }}
            >
              {status}
            </span>
          );
        },
      },
      {
        key: "last_updated",
        label: "Date",
        render: (job) => {
          const created = job.created_at
            ? new Date(job.created_at).toLocaleDateString()
            : "-";
          return `${created} - ${job.last_updated_by || ""}`;
        },
      },
      {
        key: "actions",
        label: "Actions",
        render: (job) => {
          const isArchived = currentTab === "archived";
          const canEdit = Boolean(job.permissions?.canEdit);
          const canDelete = Boolean(job.permissions?.canDelete);
          const canRead = Boolean(job.permissions?.canRead);
          const items = buildRowActions({
            canView: canRead,
            canEdit: canEdit && !isArchived,
            canDelete: canDelete && !isArchived,
            canArchive: canEdit,
            canTrack: false,
            isArchived,
            onView: () => handleRowAction(job),
            onLogs: () => handleJobLogs(job, isArchived),
            onArchive: () => handleArchiveJob({ id: job.id }),
            onUnarchive: () => handleArchiveJob({ id: job.id }),
            onDelete: () => handleDeleteJob(job),
          });
          const actions = mapDropdownItemsToTableActions<TransformedJob>({
            items,
          });
          return (
            <TableActions
              actions={actions}
              item={job}
              {...INLINE_TABLE_ROW_ACTIONS_PROPS}
            />
          );
        },
        width: "72px",
      },
    ],
    [
      currentTab,
      handleArchiveJob,
      handleDeleteJob,
      handleJobLogs,
      handleRowAction,
    ]
  );

  const completedMobileCallbacks = useMemo(
    () => ({
      onAction: handleRowAction,
      isArchiving: currentTab === "archived",
      handleArchiveJob,
      handleDeleteJob,
      handleJobLogs,
    }),
    [
      currentTab,
      handleArchiveJob,
      handleDeleteJob,
      handleJobLogs,
      handleRowAction,
    ]
  );

  const columns = useMemo(() => {
    if (isMobile) {
      return buildCompletedJobOrgUiMobileColumns(completedMobileCallbacks);
    }
    return desktopColumns;
  }, [completedMobileCallbacks, desktopColumns, isMobile]);

  const filterDefinitions = useMemo(
    (): TableFilterDefinition[] => [
      {
        id: FilterType.STATUS,
        label: "Status",
        options: [
          { value: "Completed", label: "Completed" },
          { value: "Cancelled", label: "Cancelled" },
        ],
      },
    ],
    []
  );

  const bulkActions = useMemo((): TableBulkAction[] => {
    if (!hasAnyWritePermission) return [];

    const archiveAction =
      currentTab === "archived"
        ? {
            id: "unarchive-selected",
            label: "Unarchive Selected",
            icon: <Undo2 aria-hidden className="h-4 w-4" />,
            onClick: (ids: (string | number)[]) => {
              setSelectedIds(ids);
              handleArchiveAll(ids);
            },
          }
        : {
            id: "archive-selected",
            label: "Archive Selected",
            icon: <Archive aria-hidden className="h-4 w-4" />,
            onClick: (ids: (string | number)[]) => {
              setSelectedIds(ids);
              handleArchiveAll(ids);
            },
          };

    if (currentTab === "archived") return [archiveAction];

    return [
      archiveAction,
      {
        id: "delete-selected",
        label: "Delete Selected",
        icon: <Trash2 aria-hidden className="h-4 w-4" />,
        variant: "danger",
        onClick: (ids) => {
          setSelectedIds(ids);
          handleDeleteAll(ids);
        },
      },
    ];
  }, [
    currentTab,
    handleArchiveAll,
    handleDeleteAll,
    hasAnyWritePermission,
    setSelectedIds,
  ]);

  const grid = useMemo(
    (): TableGridViewConfig<TransformedJob> => ({
      minColumnWidth: "minmax(18rem, 1fr)",
      renderCard: (job, context) => (
        <CompletedJobCard
          key={job.id}
          job={job}
          selected={context.selected}
          toggleArchive={currentTab === "archived"}
          onAction={(action) => {
            if (action === "view") handleRowAction(job);
          }}
          onArchiveJob={handleArchiveJob}
          onDeleteJob={handleDeleteJob}
          onLogsJob={handleJobLogs}
          onSelect={(checked) => context.onSelectedChange(checked)}
        />
      ),
    }),
    [
      currentTab,
      handleArchiveJob,
      handleDeleteJob,
      handleJobLogs,
      handleRowAction,
    ]
  );

  const isListView = currentView === ViewMode.LIST;
  const tableData = isListView ? paginatedData : filteredData;

  return (
    <>
      <CompletedPageBreadcrumbToolbar
        activeCount={filteredJobs.length}
        archivedCount={filteredArchivedJobs.length}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
      />
      <CompletedPageLayout
        canViewPage={canViewPage !== false}
        data={filteredData}
        description="View and manage your completed jobs here."
        emptyState={{
          title: "No completed jobs found",
          description: filterActive
            ? "No jobs found for the selected filter."
            : "There are no completed or cancelled jobs available at this time.",
        }}
        error={
          jobsError || archivedJobsError
            ? new Error(
                (jobsError && jobsError.message) ||
                  (archivedJobsError && archivedJobsError.message) ||
                  "Failed to load completed jobs"
              )
            : null
        }
        isLoading={
          (jobsLoading || archivedJobsLoading) && !jobs && !archivedJobs
        }
        loadingMessage="Loading completed jobs..."
        table={
          <OrgUiDataTable
            bulkActions={bulkActions}
            columns={columns}
            data={tableData}
            emptyState={{
              title: "No completed jobs found",
              description: filterActive
                ? "No jobs found for the selected filter."
                : "There are no completed or cancelled jobs available at this time.",
            }}
            filterDefinitions={filterDefinitions}
            filterValues={filterStateToTableValues(filters)}
            grid={grid}
            isLoading={false}
            pagination={
              isListView
                ? {
                    currentPage: currentPageRef.current,
                    isLoading: false,
                    itemLabel: "jobs",
                    onPageChange: handlePageChange,
                    pageSize: DEFAULT_PAGE_SIZE,
                    totalCount: paginationInfo.totalCount,
                    totalPages: paginationInfo.totalPages,
                  }
                : undefined
            }
            search={{
              value: searchQuery,
              onChange: setSearchQuery,
              placeholder: "Search completed jobs...",
            }}
            selectable={hasAnyWritePermission}
            selectedIds={selectedIds}
            storageKey={`completed-jobs-table:${organizationId ?? "unknown"}`}
            toolbarActions={<AssignedToFilterSelect compact />}
            view={currentView as TableViewMode}
            onFilterValuesChange={(values) =>
              setFilters(tableValuesToFilterState<FilterState>(values))
            }
            onRowDoubleClick={handleRowDoubleClick}
            onSelectChange={setSelectedIds}
            onViewChange={(view) => {
              setView(view as ViewMode);
              clearSelection();
            }}
          />
        }
        title="Completed and Cancelled Jobs"
      />
    </>
  );
}
