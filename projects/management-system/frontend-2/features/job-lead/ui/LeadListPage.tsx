"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { toast } from "sonner";

import type { Lead, PaginatedResponse } from "@/api/types";
import { LeadType, PermissionCode, ResourceType } from "@/constants";
import { getFarmManagementIdFromFilters } from "@/features/contacts";
import {
  useDesignRequestListRealtimeSync,
  useDesignRequestStatusMap,
} from "@/features/design-request/hooks/useDesignRequestStatusMap";
import { getErrorMessage, getLeadCreateErrorMessage } from "@/features/forms";
import {
  LeadSourceModal,
  type LeadTypeFormValues,
  LeadsPageLayout,
  LeadsTable,
  useLeadPageState,
} from "@/features/leads";
import {
  useDialogManager,
  useHasPermission,
  useJobLeadListActions,
  useLeadStatuses,
  useLeadTypes,
  useLeadTypesSettings,
  useRouteIds,
  useTeamData,
} from "@/hooks";
import {
  useCreateDrainageTilingLead,
  useCreateExcavationLead,
  useCreateRepairLead,
} from "@/hooks/mutations";
import { useRoutePermissions } from "@/hooks/permissions";
import { useLeadsList } from "@/hooks/queries";
import {
  cmsPaginationSourceFromResponse,
  createCmsTableStateKey,
  useCmsServerTableQuery,
} from "@/shared/lib/table";
import { FilterState } from "@/shared/ui/common";

import { jobLeadPathsFromConfig } from "../lib/jobLeadPaths";
import { leadsTableQueryToListParams } from "../lib/leads-table-query";
import type { LeadCreateSubmitValues } from "../model/jobLeadForm";
import {
  type LeadRouteConfig,
  createJobLeadFormProps,
} from "../model/jobLeadRouteConfig";
import { JobLeadArchiveBreadcrumbToolbar } from "./JobLeadArchiveBreadcrumbToolbar";
import { JobLeadForm } from "./JobLeadForm";
import {
  filterStateToTableValues,
  tableValuesToFilterState,
} from "./JobLeadTable";

interface LeadListPageProps {
  config: LeadRouteConfig;
}

function getLeadRows(data: PaginatedResponse<Lead> | Lead[] | undefined) {
  return Array.isArray(data) ? data : data?.results || [];
}

export function LeadListPage({ config }: LeadListPageProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { orgId } = useRouteIds();
  const paths = useMemo(() => jobLeadPathsFromConfig(config), [config]);
  const {
    currentTab,
    selectedIds: selectedLeadIds,
    setCurrentTab,
    setSelectedIds,
    setView,
    view: currentView,
  } = useLeadPageState(config.leadType);
  const canEdit = useRoutePermissions()?.write;
  const { hasPermission: hasSettingsPermission } = useHasPermission(
    PermissionCode.SETTINGS_PAGE_READ
  );

  const tableKey = useMemo(
    () =>
      createCmsTableStateKey({
        pathname,
        orgId: orgId ? Number(orgId) : null,
        tabKey: `leads-${config.segment}-${currentTab}`,
      }) ?? `leads-${config.segment}-${currentTab}`,
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
  const { data: leadTypes } = useLeadTypes();
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [isLeadSourceOpen, setIsLeadSourceOpen] = useState(false);
  const { addLeadType } = useLeadTypesSettings({
    enabled: hasSettingsPermission(),
  });
  const { data: leadStatuses } = useLeadStatuses();
  const { data: teamData } = useTeamData();
  const createTilingLead = useCreateDrainageTilingLead();
  const createExcavationLead = useCreateExcavationLead();
  const createRepairLead = useCreateRepairLead();

  const farmManagementId =
    config.leadType === LeadType.REPAIR
      ? getFarmManagementIdFromFilters(filters)
      : undefined;

  const activeParams = useMemo(
    () =>
      leadsTableQueryToListParams(query, config, {
        archived: false,
        farmManagementId,
      }),
    [config, farmManagementId, query]
  );
  const archivedParams = useMemo(
    () =>
      leadsTableQueryToListParams(query, config, {
        archived: true,
        farmManagementId,
      }),
    [config, farmManagementId, query]
  );

  const activeQuery = useLeadsList(activeParams);
  const archivedQuery = useLeadsList(archivedParams);

  const activeRows = useMemo(
    () => getLeadRows(activeQuery.data),
    [activeQuery.data]
  );
  const archivedRows = useMemo(
    () => getLeadRows(archivedQuery.data),
    [archivedQuery.data]
  );
  const paginationSource = useMemo(
    () =>
      cmsPaginationSourceFromResponse(
        currentTab === "active" ? activeQuery.data : archivedQuery.data
      ),
    [activeQuery.data, archivedQuery.data, currentTab]
  );

  useEffect(() => {
    setLastTotalPages(paginationSource?.total_pages);
  }, [paginationSource?.total_pages]);

  const handleAddLeadSubmit = useCallback(
    async (values: LeadCreateSubmitValues) => {
      try {
        const newStatus = leadStatuses?.find((status) =>
          status.title.toLowerCase().includes("new")
        );
        if (!newStatus) {
          toast.error("No default status found. Please contact administrator.");
          return;
        }

        const leadData = {
          name: values.selectedContact
            ? `Lead for Contact ${values.selectedContact}`
            : "New Lead",
          lead_type: values.lead_type || 1,
          lead_status: newStatus.id,
          contact: values.selectedContact
            ? parseInt(values.selectedContact)
            : undefined,
          farm_info: null,
          description: values.description || "",
          latitude: values.latitude,
          longitude: values.longitude,
          vertices: values.vertices,
          acre: values.acre,
          designers: values.designers || [],
        };

        const payload = values.selectedFarm
          ? { ...leadData, farm: parseInt(values.selectedFarm) }
          : leadData;

        if (config.leadType === LeadType.TILING) {
          await createTilingLead.mutateAsync(payload);
        } else if (config.leadType === LeadType.EXCAVATION) {
          await createExcavationLead.mutateAsync(payload);
        } else {
          await createRepairLead.mutateAsync(payload);
        }

        setIsAddLeadOpen(false);
      } catch (error: unknown) {
        console.error("Failed to create lead:", error);
        toast.error(getLeadCreateErrorMessage(error, "Failed to create lead"));
      }
    },
    [
      config.leadType,
      createExcavationLead,
      createRepairLead,
      createTilingLead,
      leadStatuses,
    ]
  );

  const jobLeadFormProps = useMemo(
    () => createJobLeadFormProps(config).props,
    [config]
  );

  const isAddLeadSubmitting =
    createTilingLead.isPending ||
    createExcavationLead.isPending ||
    createRepairLead.isPending;

  const openLeadForm = useCallback(() => {
    setIsAddLeadOpen(true);
  }, []);

  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "add" && leadStatuses && leadStatuses.length > 0) {
      openLeadForm();
    }
  }, [leadStatuses, openLeadForm, searchParams]);

  const handleFilterChange = useCallback(
    (newFilters: FilterState) => {
      setFilterValues(filterStateToTableValues(newFilters));
    },
    [setFilterValues]
  );

  const handleTabChange = (tab: "active" | "archived") => {
    setCurrentTab(tab);
  };

  const filteredData = useMemo(
    () => ({
      active: activeRows || [],
      archived: archivedRows || [],
    }),
    [activeRows, archivedRows]
  );

  const {
    archive: handleArchive,
    archiveSelected: handleArchiveSelectedLeads,
    showLogs: handleLeadLogs,
    showMore: handleShowMore,
    trash: handleTrash,
    trashSelected: handleTrashSelectedLeads,
    unarchive: handleUnarchive,
    unarchiveSelected: handleUnarchiveSelectedLeads,
  } = useJobLeadListActions({
    entity: ResourceType.LEAD,
    type: config.leadType,
    currentTab,
    activeItems: filteredData.active,
    archivedItems: filteredData.archived,
    detailBasePath: paths.list,
    selectedIds: selectedLeadIds,
    setSelectedIds,
    dialogManager,
  });

  const handleAddLeadTypeSubmit = async (values: LeadTypeFormValues) => {
    try {
      await addLeadType.mutateAsync({
        title: values.title,
        color: values.color,
      });
      setIsLeadSourceOpen(false);
      toast.success("Lead source added successfully");
    } catch (error: unknown) {
      console.error("Failed to add lead source:", error);
      toast.error(getErrorMessage(error, "Failed to add lead source"));
    }
  };

  const { data: activeData, error: activeError, isLoading } = activeQuery;
  const {
    data: archivedData,
    error: archivedError,
    isLoading: archivedLoading,
  } = archivedQuery;

  const isLoadingData =
    isLoading || archivedLoading || !leadStatuses || !leadTypes;
  const isFetching = activeQuery.isFetching || archivedQuery.isFetching;
  const currentData = currentTab === "active" ? activeData : archivedData;

  const pagination = useMemo(
    () =>
      buildPagination({
        source: paginationSource,
        itemLabel: "leads",
        isLoading: isFetching,
      }),
    [buildPagination, isFetching, paginationSource]
  );

  const isTilingList = config.leadType === LeadType.TILING;
  const tableRows =
    currentTab === "active" ? filteredData.active : filteredData.archived;
  const visibleLeadIds = useMemo(
    () => tableRows.map((row) => row.id),
    [tableRows]
  );

  useDesignRequestListRealtimeSync(orgId!, isTilingList);
  const designRequestStatusMap = useDesignRequestStatusMap(
    orgId!,
    "lead",
    visibleLeadIds,
    isTilingList
  );

  return (
    <>
      <JobLeadArchiveBreadcrumbToolbar
        activeCount={filteredData.active?.length || 0}
        archivedCount={filteredData.archived?.length || 0}
        currentTab={currentTab}
        onTabChange={handleTabChange}
      />
      <LeadsPageLayout
        data={currentData}
        description={config.description}
        emptyState={{
          title: "No leads found",
          description:
            currentTab === "active"
              ? "Try adjusting your search or filters to find leads."
              : "No archived leads found.",
        }}
        error={currentTab === "active" ? activeError : archivedError}
        isLoading={isLoadingData}
        loadingMessage="Loading leads..."
        permissionCode={config.permissionCode}
        table={
          <LeadsTable
            canEdit={Boolean(canEdit)}
            canEditSettings={hasSettingsPermission()}
            currentTab={currentTab}
            data={
              currentTab === "active"
                ? filteredData.active
                : filteredData.archived
            }
            designRequestStatusMap={designRequestStatusMap}
            filters={filters}
            isLoading={isLoadingData}
            leadStatuses={leadStatuses || []}
            leadType={config.leadType}
            leadTypes={leadTypes || []}
            organizationId={orgId}
            pagination={pagination}
            search={{
              ...searchConfig,
              placeholder: "Search leads...",
            }}
            selectedIds={selectedLeadIds}
            sortRules={sortRules}
            teamData={teamData}
            view={currentView}
            onAddLead={openLeadForm}
            onAddLeadType={() => setIsLeadSourceOpen(true)}
            onArchive={handleArchive}
            onArchiveSelectedLeads={handleArchiveSelectedLeads}
            onFilterChange={handleFilterChange}
            onLogs={handleLeadLogs}
            onSelectChange={setSelectedIds}
            onShowMore={handleShowMore}
            onSortRulesChange={setSortRules}
            onTrash={handleTrash}
            onTrashSelectedLeads={handleTrashSelectedLeads}
            onUnarchive={handleUnarchive}
            onUnarchiveSelectedLeads={handleUnarchiveSelectedLeads}
            onViewChange={setView}
          />
        }
        title={config.listTitle}
      />

      <JobLeadForm
        {...jobLeadFormProps}
        isOpen={isAddLeadOpen}
        isSubmitting={isAddLeadSubmitting}
        requireTypeSelection={searchParams.get("pick") === "1"}
        onCancel={() => setIsAddLeadOpen(false)}
        onOpenChange={setIsAddLeadOpen}
        onSubmit={handleAddLeadSubmit}
      />

      <LeadSourceModal
        isSubmitting={addLeadType.isPending}
        open={isLeadSourceOpen}
        onOpenChange={setIsLeadSourceOpen}
        onSubmit={handleAddLeadTypeSubmit}
      />
    </>
  );
}
