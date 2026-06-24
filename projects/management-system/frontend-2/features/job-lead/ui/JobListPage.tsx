"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { TableViewMode } from "@fieldflow360/org-ui";
import { toast } from "sonner";

import type { Job, Status } from "@/api/types";
import { JobType, ResourceType, ViewMode } from "@/constants";
import {
  useDesignRequestListRealtimeSync,
  useDesignRequestStatusMap,
} from "@/features/design-request/hooks/useDesignRequestStatusMap";
import { getErrorMessage, getLeadCreateErrorMessage } from "@/features/forms";
import {
  JobStatusModal,
  JobsPageLayout,
  type JobsPageTab,
  JobsTable,
  type StatusFormValues,
  isJobsPageTab,
  useJobPageState,
} from "@/features/jobs";
import {
  useDialogManager,
  useJobLeadListActions,
  useOrganizationStatuses,
  useRouteIds,
} from "@/hooks";
import {
  useCreateDrainageTilingJob,
  useCreateExcavationJob,
  useCreateRepairJob,
} from "@/hooks/mutations";
import { useJobPermissions, useSettingsPermissions } from "@/hooks/permissions";
import { useJobsList } from "@/hooks/queries";
import {
  cmsPaginationSourceFromResponse,
  createCmsTableStateKey,
  useCmsServerTableQuery,
} from "@/shared/lib/table";
import { FilterState } from "@/shared/ui/common";

import { jobLeadPathsFromConfig } from "../lib/jobLeadPaths";
import { jobsTableQueryToListParams } from "../lib/jobs-table-query";
import type { JobCreateSubmitValues } from "../model/jobLeadForm";
import {
  type JobRouteConfig,
  createJobLeadFormProps,
} from "../model/jobLeadRouteConfig";
import { JobLeadForm } from "./JobLeadForm";
import {
  filterStateToTableValues,
  tableValuesToFilterState,
} from "./JobLeadTable";
import { JobsListBreadcrumbToolbar } from "./JobsListBreadcrumbToolbar";

interface JobListPageProps {
  config: JobRouteConfig;
}

type JobListFormValues = JobCreateSubmitValues & {
  designers?: number[];
  crew?: number[];
};

function getRows(data: Job[] | { results?: Job[] } | undefined) {
  return Array.isArray(data) ? data : data?.results || [];
}

export function JobListPage({ config }: JobListPageProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { orgId } = useRouteIds();
  const paths = useMemo(() => jobLeadPathsFromConfig(config), [config]);
  const { canAdd, canEdit, canDelete } = useJobPermissions(config.jobType);
  const { canAdd: canAddSettings } = useSettingsPermissions();
  const {
    currentTab,
    selectedIds,
    setCurrentTab,
    setSelectedIds,
    setView,
    view: currentView,
  } = useJobPageState(config.jobType);

  const tableKey = useMemo(
    () =>
      createCmsTableStateKey({
        pathname,
        orgId: orgId ? Number(orgId) : null,
        tabKey: `jobs-${config.segment}-${currentTab}`,
      }) ?? `jobs-${config.segment}-${currentTab}`,
    [config.segment, currentTab, orgId, pathname]
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

  const filters = useMemo(
    () => tableValuesToFilterState<FilterState>(filterValues),
    [filterValues]
  );

  const dialogManager = useDialogManager();
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);
  const [isJobStatusOpen, setIsJobStatusOpen] = useState(false);
  const { data: statusTypes, addStatus } = useOrganizationStatuses({
    jobType: config.apiType,
  });
  const createTilingJob = useCreateDrainageTilingJob();
  const createExcavationJob = useCreateExcavationJob();
  const createRepairJob = useCreateRepairJob();

  const activeParams = useMemo(
    () => jobsTableQueryToListParams(query, config, "active"),
    [config, query]
  );
  const onHoldParams = useMemo(
    () => jobsTableQueryToListParams(query, config, "on_hold"),
    [config, query]
  );
  const archivedParams = useMemo(
    () => jobsTableQueryToListParams(query, config, "archived"),
    [config, query]
  );
  const activeQuery = useJobsList(activeParams);
  const onHoldQuery = useJobsList(onHoldParams);
  const archivedQuery = useJobsList(archivedParams);

  const activeRows = useMemo(
    () => getRows(activeQuery.data),
    [activeQuery.data]
  );
  const onHoldRows = useMemo(
    () => getRows(onHoldQuery.data),
    [onHoldQuery.data]
  );
  const archivedRows = useMemo(
    () => getRows(archivedQuery.data),
    [archivedQuery.data]
  );
  const paginationSource = useMemo(() => {
    const data =
      currentTab === "active"
        ? activeQuery.data
        : currentTab === "on_hold"
          ? onHoldQuery.data
          : archivedQuery.data;
    return cmsPaginationSourceFromResponse(data);
  }, [activeQuery.data, archivedQuery.data, currentTab, onHoldQuery.data]);

  useEffect(() => {
    setLastTotalPages(paginationSource?.total_pages);
  }, [paginationSource?.total_pages]);

  const handleAddJobSubmit = useCallback(
    async (values: JobListFormValues) => {
      try {
        const newStatus = statusTypes?.find((status: Status) =>
          status.title.toLowerCase().includes("new")
        );

        if (!newStatus) {
          toast.error("No default status found. Please contact administrator.");
          return;
        }

        const jobData = {
          description: values.description || "",
          job_status: newStatus.id,
          project_type: values.projectTypeId,
          equipments: values.equipments || [],
          designers: values.designers || [],
          crew: values.crew || [],
          acers: values.acre ? parseFloat(values.acre) : undefined,
          contact: parseInt(values.selectedContact),
          farm_info: null,
          latitude: values.latitude,
          longitude: values.longitude,
          vertices: values.vertices,
        };

        const payload = values.selectedFarm
          ? { ...jobData, farm: parseInt(values.selectedFarm) }
          : jobData;

        if (config.jobType === JobType.TILING) {
          await createTilingJob.mutateAsync(payload);
        } else if (config.jobType === JobType.EXCAVATION) {
          await createExcavationJob.mutateAsync(payload);
        } else {
          await createRepairJob.mutateAsync(payload);
        }

        setIsAddJobOpen(false);
      } catch (error: unknown) {
        console.error("Failed to create job:", error);
        toast.error(getLeadCreateErrorMessage(error, "Failed to create job"));
      }
    },
    [
      config.jobType,
      createExcavationJob,
      createRepairJob,
      createTilingJob,
      statusTypes,
    ]
  );

  const jobLeadFormProps = useMemo(
    () => createJobLeadFormProps(config).props,
    [config]
  );

  const isAddJobSubmitting =
    createTilingJob.isPending ||
    createExcavationJob.isPending ||
    createRepairJob.isPending;

  const openJobForm = useCallback(() => {
    setIsAddJobOpen(true);
  }, []);

  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "add" && statusTypes && statusTypes.length > 0) {
      openJobForm();
    }
  }, [openJobForm, searchParams, statusTypes]);

  const handleFilterChange = useCallback(
    (newFilters: FilterState) => {
      setFilterValues(filterStateToTableValues(newFilters));
    },
    [setFilterValues]
  );

  const handleTabChange = (tab: JobsPageTab) => {
    if (!isJobsPageTab(tab)) return;
    setCurrentTab(tab);
  };

  const handleViewChange = useCallback(
    (nextView: TableViewMode) => setView(nextView as ViewMode),
    [setView]
  );

  const filteredData = useMemo(
    () => ({
      active: activeRows || [],
      on_hold: onHoldRows || [],
      archived: archivedRows || [],
    }),
    [activeRows, archivedRows, onHoldRows]
  );

  const {
    archive: handleArchive,
    archiveSelected: handleArchiveSelectedJobs,
    showLogs: handleJobLogs,
    showMore: handleShowMore,
    showOnSiteTracking: handleOnSiteTracking,
    trash: handleTrash,
    trashSelected: handleTrashSelectedJobs,
    unarchive: handleUnarchive,
    unarchiveSelected: handleUnarchiveSelectedJobs,
  } = useJobLeadListActions({
    entity: ResourceType.JOB,
    type: config.jobType,
    currentTab,
    activeItems: filteredData.active,
    archivedItems: filteredData.archived,
    onHoldItems: filteredData.on_hold,
    detailBasePath: paths.list,
    onSiteTrackingBasePath: paths.list,
    selectedIds,
    setSelectedIds,
    dialogManager,
  });

  const handleAddStatus = async (values: StatusFormValues) => {
    try {
      await addStatus.mutateAsync({
        newStatus: {
          title: values.title,
          color: values.color,
          order: Number(values.number),
        },
        Type: config.apiType,
      });
      setIsJobStatusOpen(false);
      toast.success("Status added successfully");
    } catch (error: unknown) {
      console.error("Failed to add status:", error);
      toast.error(getErrorMessage(error, "Failed to add status"));
    }
  };

  const currentData =
    currentTab === "active"
      ? activeQuery.data
      : currentTab === "on_hold"
        ? onHoldQuery.data
        : archivedQuery.data;
  const isLoading =
    activeQuery.isLoading || onHoldQuery.isLoading || archivedQuery.isLoading;
  const isFetching =
    activeQuery.isFetching ||
    onHoldQuery.isFetching ||
    archivedQuery.isFetching;

  const pagination = useMemo(
    () =>
      buildPagination({
        source: paginationSource,
        itemLabel: "jobs",
        isLoading: isFetching,
      }),
    [buildPagination, isFetching, paginationSource]
  );

  const isTilingList = config.jobType === JobType.TILING;
  const tableRows = useMemo(() => {
    if (currentTab === "active") return filteredData.active;
    if (currentTab === "on_hold") return filteredData.on_hold;
    return filteredData.archived;
  }, [currentTab, filteredData]);
  const visibleJobIds = useMemo(
    () => tableRows.map((row) => row.id),
    [tableRows]
  );

  useDesignRequestListRealtimeSync(orgId ?? undefined, isTilingList);
  const designRequestStatusMap = useDesignRequestStatusMap(
    orgId ?? undefined,
    "job",
    visibleJobIds,
    isTilingList
  );

  return (
    <>
      <JobsListBreadcrumbToolbar
        activeCount={filteredData.active?.length || 0}
        archivedCount={filteredData.archived?.length || 0}
        currentTab={currentTab}
        onHoldCount={filteredData.on_hold?.length || 0}
        onTabChange={handleTabChange}
      />
      <JobsPageLayout
        data={currentData}
        description={config.description}
        emptyState={{
          title: "No jobs found",
          description:
            currentTab === "active"
              ? "Try adjusting your search or filters to find jobs."
              : currentTab === "on_hold"
                ? "No on hold jobs found."
                : "No archived jobs found.",
        }}
        error={
          currentTab === "active"
            ? activeQuery.error
            : currentTab === "on_hold"
              ? onHoldQuery.error
              : archivedQuery.error
        }
        isLoading={isLoading}
        loadingMessage="Loading jobs..."
        permissionCode={config.permissionCode}
        permissionDeniedMessage={`You do not have permission to view ${config.titleLabel} jobs.`}
        table={
          <JobsTable
            canAdd={canAdd}
            canDelete={canDelete}
            canEdit={canEdit}
            canEditSettings={canAddSettings}
            currentTab={currentTab}
            data={
              currentTab === "active"
                ? filteredData.active
                : currentTab === "on_hold"
                  ? filteredData.on_hold
                  : filteredData.archived
            }
            designRequestStatusMap={designRequestStatusMap}
            filters={filters}
            filterType={config.statusFilterType}
            isLoading={isLoading}
            jobType={config.jobType}
            organizationId={orgId}
            pagination={pagination}
            search={{
              ...searchConfig,
              placeholder: "Search jobs...",
            }}
            selectedIds={selectedIds}
            sortRules={sortRules}
            statusTypes={statusTypes || []}
            view={currentView as TableViewMode}
            onAddJob={openJobForm}
            onAddJobStatus={() => setIsJobStatusOpen(true)}
            onArchive={handleArchive}
            onArchiveSelectedJobs={handleArchiveSelectedJobs}
            onFilterChange={handleFilterChange}
            onLogs={handleJobLogs}
            onOnSiteTracking={handleOnSiteTracking}
            onSelectChange={setSelectedIds}
            onShowMore={handleShowMore}
            onSortRulesChange={setSortRules}
            onTrash={handleTrash}
            onTrashSelectedJobs={handleTrashSelectedJobs}
            onUnarchive={handleUnarchive}
            onUnarchiveSelectedJobs={handleUnarchiveSelectedJobs}
            onViewChange={handleViewChange}
          />
        }
        title={config.listTitle}
      />

      <JobLeadForm
        {...jobLeadFormProps}
        isOpen={isAddJobOpen}
        isSubmitting={isAddJobSubmitting}
        requireTypeSelection={searchParams.get("pick") === "1"}
        onCancel={() => setIsAddJobOpen(false)}
        onOpenChange={setIsAddJobOpen}
        onSubmit={handleAddJobSubmit}
      />

      <JobStatusModal
        isSubmitting={addStatus.isPending}
        open={isJobStatusOpen}
        onOpenChange={setIsJobStatusOpen}
        onSubmit={handleAddStatus}
      />
    </>
  );
}
