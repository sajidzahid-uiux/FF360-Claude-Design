"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { TableViewMode } from "@fieldflow360/org-ui";
import { toast } from "sonner";

import type { Maintenance, RecordEquipment, TeamMember } from "@/api/types";
import { SortOrder } from "@/api/types";
import { type NotKanbanView, ViewMode } from "@/constants";
import {
  EnrichedMaintenanceItem,
  MAINTENANCE_LIST_PAGE_SIZE,
  MaintenanceDetailView,
  MaintenanceTable,
  maintenanceSortOrderToTableSortRules,
  tableSortRulesToMaintenanceSortOrder,
  useOpenAddMaintenanceDialog,
} from "@/features/maintenance";
import { useMaintenancePageUi } from "@/features/maintenance/model/maintenance-page-store";
import {
  VIEW_LIST_GRID,
  useDebouncedValue,
  useDialogManager,
  useMaintenanceData,
  useTeamData,
  useViewPreference,
} from "@/hooks";
import { useMajorRoleAccess } from "@/hooks/permissions";
import { StorageKey, useDataFromStorageByKey } from "@/hooks/storage-data";
import { useRecordEquipment } from "@/hooks/useRecordData";
import { bulkConfirmationCopy } from "@/shared/lib";
import { DialogManager, PageRenderer } from "@/shared/ui/common";
import { AccessDeniedView } from "@/shared/ui/permissions";
import { getErrorMessage } from "@/utils/apiError";

function toNumericIds(ids: (string | number)[]): number[] {
  return ids
    .map((id) => (typeof id === "string" ? Number.parseInt(id, 10) : id))
    .filter((id) => !Number.isNaN(id));
}

export default function MaintenancePage() {
  const hasMajorRoleAccess = useMajorRoleAccess();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebouncedValue(searchTerm);
  const [sortOrder, setSortOrder] = useState<SortOrder | undefined>(undefined);
  const { view: currentView, setView } = useViewPreference(
    ViewMode.LIST,
    VIEW_LIST_GRID
  );
  const {
    selectedIds,
    showDetailsId,
    setSelectedIds,
    setShowDetailsId,
    clearSelection,
  } = useMaintenancePageUi();
  const searchParams = useSearchParams();
  const equipmentId = searchParams.get("equipment_id");

  const sortRules = useMemo(
    () => maintenanceSortOrderToTableSortRules(sortOrder),
    [sortOrder]
  );

  const handleSortRulesChange = useCallback((rules: typeof sortRules) => {
    setSortOrder(tableSortRulesToMaintenanceSortOrder(rules));
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, sortOrder]);

  const {
    data,
    isError,
    isLoading: maintenanceLoading,
    isFetching: maintenanceFetching,
    deleteMaintenance,
  } = useMaintenanceData({
    page: currentPage,
    page_size: MAINTENANCE_LIST_PAGE_SIZE,
    search: debouncedSearchTerm || undefined,
    exclude_completed: true,
    sort_order: sortOrder,
  });

  const { data: team, isLoading: teamLoading } = useTeamData();

  const userRole = useDataFromStorageByKey(StorageKey.USER_ROLE);
  const isAdmin = userRole?.is_admin === true;

  const dialogManager = useDialogManager();
  const openAddMaintenanceDialog = useOpenAddMaintenanceDialog(dialogManager);
  const equipmentTypeParam = searchParams.get("equipment_type");

  const handleAddMaintenance = useCallback(
    (equipmentIdParam?: string | null) => {
      const id = equipmentIdParam || equipmentId;
      if (!id) return;

      openAddMaintenanceDialog({
        equipmentId: id,
        equipmentType: equipmentTypeParam,
        navigateOnSuccess: false,
      });
    },
    [equipmentId, equipmentTypeParam, openAddMaintenanceDialog]
  );

  useEffect(() => {
    if (equipmentId) {
      handleAddMaintenance(equipmentId);
    }
  }, [equipmentId, handleAddMaintenance]);

  const userMap = useMemo(() => {
    if (!team) return {};
    const teamMembers = team as TeamMember[];
    const map: Record<string | number, TeamMember["user"]> = {};
    for (const member of teamMembers) {
      if (member.user && member.user.id) {
        const memberId = member.id;
        map[memberId] = member.user;
        map[String(memberId)] = member.user;
        map[Number(memberId)] = member.user;
      }
    }
    return map;
  }, [team]);

  const { data: equipment } = useRecordEquipment({ paginate: false }) as {
    data: RecordEquipment[] | undefined;
  };

  const maintenanceData = useMemo((): EnrichedMaintenanceItem[] => {
    if (!data) return [];

    let rawData: Maintenance[];
    if (Array.isArray(data)) {
      rawData = data;
    } else if (data.results) {
      rawData = data.results;
    } else {
      return [];
    }

    return rawData.map((m) => {
      const maintenanceEquipment = equipment?.find(
        (e: RecordEquipment) => e.id === m.equipment
      );
      const equipmentName = maintenanceEquipment?.name || "Unknown Equipment";

      return {
        ...m,
        equipment_name: equipmentName,
        equipment_data: maintenanceEquipment,
      };
    });
  }, [data, equipment]);

  useEffect(() => {
    if (selectedIds.length === 0) return;

    if (maintenanceData.length === 0) {
      clearSelection();
      return;
    }

    const validIds = new Set(maintenanceData.map((item) => item.id));
    const filteredIds = selectedIds.filter((id) => {
      const numId = typeof id === "string" ? Number.parseInt(id, 10) : id;
      return validIds.has(numId);
    });

    if (filteredIds.length !== selectedIds.length) {
      setSelectedIds(filteredIds);
    }
  }, [maintenanceData, selectedIds, clearSelection, setSelectedIds]);

  const paginationInfo = useMemo(() => {
    if (!data || Array.isArray(data)) {
      return {
        total_count: maintenanceData.length,
        total_pages: 1,
      };
    }

    return {
      total_count: data.total_count || 0,
      total_pages:
        data.total_pages ||
        Math.ceil((data.total_count || 0) / MAINTENANCE_LIST_PAGE_SIZE),
    };
  }, [data, maintenanceData.length]);

  const pagination = useMemo(
    () => ({
      currentPage,
      totalPages: paginationInfo.total_pages,
      totalCount: paginationInfo.total_count,
      pageSize: MAINTENANCE_LIST_PAGE_SIZE,
      itemLabel: "maintenance items",
      isLoading: maintenanceFetching,
      onPageChange: setCurrentPage,
    }),
    [
      currentPage,
      maintenanceFetching,
      paginationInfo.total_count,
      paginationInfo.total_pages,
    ]
  );

  const handleRowAction = useCallback(
    async (
      row: number | { id: number } | EnrichedMaintenanceItem,
      action: string
    ) => {
      if (action === "view") {
        const rowId = typeof row === "number" ? row : row.id;
        setShowDetailsId(rowId);
      }
      if (action === "delete") {
        const maintenanceRow = row as EnrichedMaintenanceItem;
        const rowEquipment = equipment?.find(
          (e: RecordEquipment) => e.id === maintenanceRow.equipment
        );
        const jobName =
          rowEquipment?.name || `Maintenance #${maintenanceRow.id}`;

        dialogManager.openConfirmationDialog({
          title: "Delete Maintenance",
          confirmationType: "delete",
          itemTitle: jobName,
          variant: "destructive",
          confirmButtonText: "Delete",
          onConfirm: async () => {
            try {
              dialogManager.setConfirmationProcessing(true);
              dialogManager.setConfirmationProgress(50, jobName);
              await deleteMaintenance.mutateAsync(maintenanceRow.id.toString());
              dialogManager.setConfirmationProgress(100);
              toast.success("Maintenance job deleted successfully");
              setShowDetailsId(null);
              dialogManager.closeDialog();
            } catch (error: unknown) {
              toast.error(
                getErrorMessage(error, "Failed to delete maintenance job")
              );
              dialogManager.setConfirmationProcessing(false);
            }
          },
        });
      }
    },
    [dialogManager, deleteMaintenance, equipment, setShowDetailsId]
  );

  const handleBulkDelete = useCallback(
    (ids: (string | number)[]) => {
      const selectedMaintenance = maintenanceData.filter((maintenance) =>
        ids.some((id) => String(id) === maintenance.id.toString())
      );

      if (selectedMaintenance.length === 0) {
        toast.error("No maintenance items selected");
        return;
      }

      const count = selectedMaintenance.length;
      const { title, description, confirmButtonText } = bulkConfirmationCopy({
        count,
        entitySingular: "maintenance job",
        entityPlural: "maintenance jobs",
        action: "delete",
      });

      dialogManager.openConfirmationDialog({
        title,
        description,
        variant: "destructive",
        confirmButtonText,
        onConfirm: async () => {
          try {
            dialogManager.setConfirmationProcessing(true);
            const totalJobs = ids.length;

            for (let i = 0; i < ids.length; i++) {
              const id = ids[i];
              const maintenanceJob = maintenanceData.find(
                (m) => m.id.toString() === String(id)
              );
              const jobName =
                maintenanceJob?.equipment_name || `Maintenance #${id}`;
              dialogManager.setConfirmationProgress(
                Math.round((i / totalJobs) * 100),
                jobName
              );

              await deleteMaintenance.mutateAsync(String(id));

              dialogManager.setConfirmationProgress(
                Math.round(((i + 1) / totalJobs) * 100),
                jobName
              );
            }

            dialogManager.setConfirmationProgress(100);
            toast.success(
              `${selectedMaintenance.length} maintenance jobs deleted successfully`
            );
            clearSelection();
            dialogManager.closeDialog();
          } catch (error: unknown) {
            toast.error(
              getErrorMessage(error, "Failed to delete maintenance jobs")
            );
            dialogManager.setConfirmationProcessing(false);
          }
        },
      });
    },
    [clearSelection, dialogManager, deleteMaintenance, maintenanceData]
  );

  const handleSelectChange = useCallback(
    (ids: (string | number)[]) => {
      setSelectedIds(toNumericIds(ids));
    },
    [setSelectedIds]
  );

  const handleViewChange = useCallback(
    (view: TableViewMode) => {
      setView(view as NotKanbanView);
    },
    [setView]
  );

  const job = maintenanceData.find((j) => j.id === showDetailsId);

  if (!hasMajorRoleAccess) {
    return (
      <AccessDeniedView message="You do not have permission to view Maintenance." />
    );
  }

  if (job) {
    return (
      <MaintenanceDetailView
        maintenance={job}
        onBack={() => setShowDetailsId(null)}
      />
    );
  }

  const isLoading =
    maintenanceLoading || (teamLoading && Object.keys(userMap).length === 0);

  return (
    <PageRenderer
      renderChildrenWhenEmpty
      data={maintenanceData}
      description="View and manage your maintenance items here."
      emptyState={{
        title: "No maintenance found",
        description:
          "Try adjusting your search or filters to find maintenance items.",
      }}
      error={isError ? new Error("Failed to load maintenance data") : null}
      isLoading={isLoading}
      loadingMessage="Loading maintenance…"
      title="Maintenance"
    >
      {() => (
        <div className="flex min-h-0 flex-1 flex-col">
          <MaintenanceTable
            data={maintenanceData}
            isAdmin={isAdmin}
            isLoading={maintenanceFetching}
            pagination={pagination}
            search={{
              value: searchTerm,
              onChange: setSearchTerm,
            }}
            selectable={isAdmin}
            selectedIds={selectedIds}
            sortRules={sortRules}
            userMap={userMap}
            view={currentView as TableViewMode}
            onAction={handleRowAction}
            onBulkDelete={handleBulkDelete}
            onSelectChange={handleSelectChange}
            onSortRulesChange={handleSortRulesChange}
            onViewChange={handleViewChange}
          />
          <DialogManager manager={dialogManager} />
        </div>
      )}
    </PageRenderer>
  );
}
