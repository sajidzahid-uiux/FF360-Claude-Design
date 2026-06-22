"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { TableVariantEnum, useTablePreferences } from "@fieldflow360/org-ui";
import { toast } from "sonner";

import type { MachineV2, TrailerV2, VehicleV2 } from "@/api/types";
import { EquipmentType, JobType, LeadType } from "@/constants";
import { useJobAssignedToFilter } from "@/features/jobs/hooks/useJobAssignedToFilter";
import {
  type TrashItem,
  type TrashTableRow,
  buildTrashTableRows,
  getTrashOrgUiColumns,
} from "@/features/org-trash/lib/columns";
import {
  filterTrashByCategories,
  inferTrashItem,
} from "@/features/org-trash/lib/inferTrashItem";
import {
  useOrgTrashPageStore,
  useOrgTrashPageUi,
} from "@/features/org-trash/model/org-trash-page-store";
import { useDialogManager, useEquipmentData } from "@/hooks";
import {
  usePermanentDeleteJob,
  usePermanentDeleteLead,
  useRestoreJob,
  useRestoreLead,
} from "@/hooks/mutations";
import {
  PERMISSION_RESOURCES,
  usePermissionsFromStorage,
  useRoutePermissions,
} from "@/hooks/permissions";
import {
  useAllEquipment,
  useJobsByType,
  useLeadStatuses,
  useLeadsByType,
} from "@/hooks/queries";
import { bulkConfirmationCopy } from "@/shared/lib";
import { parseEntityId } from "@/shared/lib/parseEntityId";
import { type FilterState, FilterType } from "@/shared/ui/common";

export function useOrgTrashPage() {
  const dialogManager = useDialogManager();
  const {
    filters,
    selectedIds,
    card,
    setFilters,
    setSelectedIds,
    setCard,
    closeCard,
    resetSelection,
  } = useOrgTrashPageUi();
  const [data, setData] = useState<TrashItem[]>([]);

  const { write: trash_write, delete: trash_delete } =
    useRoutePermissions() || {};

  const perms = usePermissionsFromStorage().permissionCodes;
  const {
    assignedTo,
    setAssignedTo,
    filterActive,
    isAdmin,
    memberOptions,
    isPreferenceReady,
  } = useJobAssignedToFilter();

  const { hasEquipmentAccess, hasLeadsAccess, hasJobsAccess } = useMemo(() => {
    const hasEquipmentAccess = perms.includes(
      PERMISSION_RESOURCES.EQUIPMENT_PAGE
    );
    const hasLeadsAccess = perms.includes(PERMISSION_RESOURCES.LEADS_PAGE);
    const hasJobsAccess =
      perms.includes(PERMISSION_RESOURCES.JOBS_EXCAVATION_PAGE) ||
      perms.includes(PERMISSION_RESOURCES.JOBS_REPAIR_PAGE) ||
      perms.includes(PERMISSION_RESOURCES.JOBS_TILING_PAGE);

    return {
      hasEquipmentAccess,
      hasLeadsAccess,
      hasJobsAccess,
    };
  }, [perms]);

  const { data: TrashedRepairJob } = useJobsByType(JobType.REPAIR, {
    trashed: true,
  });
  const { data: TrashedExcavationJob } = useJobsByType(JobType.EXCAVATION, {
    trashed: true,
  });
  const { data: TrashedTilingJob } = useJobsByType(JobType.TILING, {
    trashed: true,
  });

  const permanentDeleteJob = usePermanentDeleteJob();
  const restoreJob = useRestoreJob();

  const { data: trashedEquipmentData } = useAllEquipment({
    trashed: true,
  });

  const { data: TrashedRepairLead } = useLeadsByType(LeadType.REPAIR, {
    trashed: true,
  });
  const { data: TrashedExcavationLead } = useLeadsByType(LeadType.EXCAVATION, {
    trashed: true,
  });
  const { data: TrashedTilingLead } = useLeadsByType(LeadType.TILING, {
    trashed: true,
  });

  const permanentDeleteLead = usePermanentDeleteLead();
  const restoreLead = useRestoreLead();

  const { deleteEquipment: deleteMachine, restoreEquipment: restoreMachine } =
    useEquipmentData(EquipmentType.MACHINES);
  const { deleteEquipment: deleteVehicle, restoreEquipment: restoreVehicle } =
    useEquipmentData(EquipmentType.VEHICLES);
  const { deleteEquipment: deleteTrailer, restoreEquipment: restoreTrailer } =
    useEquipmentData(EquipmentType.TRAILERS);

  const { data: leadStatuses } = useLeadStatuses();

  const tableRows = useMemo(() => buildTrashTableRows(data), [data]);

  useEffect(() => {
    let combined = [
      ...(TrashedRepairJob || [])
        .map((job) => ({ ...job, job_type: JobType.REPAIR }))
        .map(inferTrashItem),
      ...(TrashedExcavationJob || [])
        .map((job) => ({ ...job, job_type: JobType.EXCAVATION }))
        .map(inferTrashItem),
      ...(TrashedTilingJob || [])
        .map((job) => ({ ...job, job_type: JobType.TILING }))
        .map(inferTrashItem),
      ...(TrashedRepairLead || [])
        .map((lead) => ({ ...lead, lead_object_subclass: "RepairLead" }))
        .map(inferTrashItem),
      ...(TrashedExcavationLead || [])
        .map((lead) => ({ ...lead, lead_object_subclass: "ExcavationLead" }))
        .map(inferTrashItem),
      ...(TrashedTilingLead || [])
        .map((lead) => ({
          ...lead,
          lead_object_subclass: "Drainage_TilingLead",
        }))
        .map(inferTrashItem),
      ...(
        (trashedEquipmentData as (MachineV2 | VehicleV2 | TrailerV2)[]) || []
      ).map((item) =>
        inferTrashItem(item as unknown as Record<string, unknown>)
      ),
    ];

    const selectedCategories = Array.isArray(
      filters[FilterType.TRASH_CATEGORIES]
    )
      ? filters[FilterType.TRASH_CATEGORIES]
      : [];

    combined = filterTrashByCategories(combined, selectedCategories);

    setData(combined);
    resetSelection();
  }, [
    TrashedRepairJob,
    TrashedExcavationJob,
    TrashedTilingJob,
    TrashedRepairLead,
    TrashedExcavationLead,
    TrashedTilingLead,
    trashedEquipmentData,
    filters,
    resetSelection,
  ]);

  const handleDelete = useCallback(
    async (item: TrashItem): Promise<void> => {
      if ("job_object_subclass" in item) {
        if (
          item.job_object_subclass === "RepairJob" ||
          item.job_object_subclass === "RepairFarmerJob"
        ) {
          await permanentDeleteJob.mutateAsync({
            id: parseEntityId(item.id),
            jobType: JobType.REPAIR,
          });
        } else if (
          item.job_object_subclass === "ExcavationJob" ||
          item.job_object_subclass === "ExcavationFarmerJob"
        ) {
          await permanentDeleteJob.mutateAsync({
            id: parseEntityId(item.id),
            jobType: JobType.EXCAVATION,
          });
        } else if (
          item.job_object_subclass === "Drainage_TilingJob" ||
          item.job_object_subclass === "Drainage_TilingFarmerJob"
        ) {
          await permanentDeleteJob.mutateAsync({
            id: parseEntityId(item.id),
            jobType: JobType.TILING,
          });
        }
      }

      if ("lead_object_subclass" in item) {
        if (item.lead_object_subclass === "RepairLead") {
          await permanentDeleteLead.mutateAsync({
            id: parseEntityId(item.id),
            leadType: LeadType.REPAIR,
          });
        } else if (item.lead_object_subclass === "ExcavationLead") {
          await permanentDeleteLead.mutateAsync({
            id: parseEntityId(item.id),
            leadType: LeadType.EXCAVATION,
          });
        } else if (item.lead_object_subclass === "Drainage_TilingLead") {
          await permanentDeleteLead.mutateAsync({
            id: parseEntityId(item.id),
            leadType: LeadType.TILING,
          });
        }
      }

      if ("current_hours" in item) {
        await deleteMachine.mutateAsync({
          id: parseEntityId(item.id),
          equipmentType: EquipmentType.MACHINES,
        });
      } else if ("current_miles" in item) {
        await deleteVehicle.mutateAsync({
          id: parseEntityId(item.id),
          equipmentType: EquipmentType.VEHICLES,
        });
      } else if ("license_plate" in item && !("current_miles" in item)) {
        await deleteTrailer.mutateAsync({
          id: parseEntityId(item.id),
          equipmentType: EquipmentType.TRAILERS,
        });
      }

      setCard(undefined);
    },
    [
      permanentDeleteJob,
      permanentDeleteLead,
      deleteMachine,
      deleteVehicle,
      deleteTrailer,
      setCard,
    ]
  );

  const promptDelete = useCallback(
    (item: TrashItem): void => {
      const itemName =
        item?.title ||
        item?.machine_name ||
        item?.contact_info?.full_name ||
        "item";
      dialogManager.openConfirmationDialog({
        title: "Delete Item",
        confirmationType: "delete",
        itemTitle: itemName,
        variant: "destructive",
        confirmButtonText: "Delete",
        onConfirm: async () => {
          try {
            dialogManager.setConfirmationProcessing(true);
            await handleDelete(item);
            toast.success("Item deleted successfully");
            dialogManager.closeDialog();
          } catch (error: unknown) {
            console.error("Failed to delete item:", error);
            toast.error("Failed to delete item");
            dialogManager.setConfirmationProcessing(false);
            throw error;
          }
        },
      });
    },
    [dialogManager, handleDelete]
  );

  const handleRestore = useCallback(
    (item: TrashItem): void => {
      if ("job_object_subclass" in item) {
        if (
          item.job_object_subclass === "RepairJob" ||
          item.job_object_subclass === "RepairFarmerJob"
        ) {
          restoreJob.mutate({
            id: parseEntityId(item.id),
            jobType: JobType.REPAIR,
          });
        } else if (
          item.job_object_subclass === "ExcavationJob" ||
          item.job_object_subclass === "ExcavationFarmerJob"
        ) {
          restoreJob.mutate({
            id: parseEntityId(item.id),
            jobType: JobType.EXCAVATION,
          });
        } else if (
          item.job_object_subclass === "Drainage_TilingJob" ||
          item.job_object_subclass === "Drainage_TilingFarmerJob"
        ) {
          restoreJob.mutate({
            id: parseEntityId(item.id),
            jobType: JobType.TILING,
          });
        }
      }

      if ("lead_object_subclass" in item) {
        if (item.lead_object_subclass === "RepairLead") {
          restoreLead.mutate({
            id: parseEntityId(item.id),
            leadType: LeadType.REPAIR,
          });
        } else if (item.lead_object_subclass === "ExcavationLead") {
          restoreLead.mutate({
            id: parseEntityId(item.id),
            leadType: LeadType.EXCAVATION,
          });
        } else if (item.lead_object_subclass === "Drainage_TilingLead") {
          restoreLead.mutate({
            id: parseEntityId(item.id),
            leadType: LeadType.TILING,
          });
        }
      }

      if ("current_hours" in item) {
        restoreMachine.mutate({
          id: parseEntityId(item.id),
          type: EquipmentType.MACHINES,
        });
      } else if ("current_miles" in item) {
        restoreVehicle.mutate({
          id: parseEntityId(item.id),
          type: EquipmentType.VEHICLES,
        });
      } else if ("license_plate" in item && !("current_miles" in item)) {
        restoreTrailer.mutate({
          id: parseEntityId(item.id),
          type: EquipmentType.TRAILERS,
        });
      }

      setCard(undefined);
    },
    [
      restoreJob,
      restoreLead,
      restoreMachine,
      restoreVehicle,
      restoreTrailer,
      setCard,
    ]
  );

  const openTrashItem = useCallback(
    (row: TrashTableRow) => {
      setCard(row.source);
    },
    [setCard]
  );

  const promptDeleteRow = useCallback(
    (row: TrashTableRow): void => {
      promptDelete(row.source);
    },
    [promptDelete]
  );

  const handleRestoreRow = useCallback(
    (row: TrashTableRow): void => {
      handleRestore(row.source);
    },
    [handleRestore]
  );

  const resolveSelectedItems = useCallback(
    (ids: (string | number)[]) => {
      const idSet = new Set(ids.map(String));
      return tableRows
        .filter((row) => idSet.has(row.id))
        .map((row) => row.source);
    },
    [tableRows]
  );

  const handleRestoreAll = useCallback(
    (ids: (string | number)[]) => {
      resolveSelectedItems(ids).forEach((item) => {
        handleRestore(item);
      });
      resetSelection();
    },
    [handleRestore, resetSelection, resolveSelectedItems]
  );

  const promptDeleteAll = useCallback(
    (ids: (string | number)[]) => {
      const itemsToDelete = resolveSelectedItems(ids);
      if (itemsToDelete.length === 0) {
        toast.error("No items selected");
        return;
      }
      const count = itemsToDelete.length;
      const { title, description, confirmButtonText } = bulkConfirmationCopy({
        count,
        entitySingular: "item",
        entityPlural: "items",
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
            let successCount = 0;
            let errorCount = 0;
            const totalItems = itemsToDelete.length;

            for (let i = 0; i < itemsToDelete.length; i++) {
              const item = itemsToDelete[i];
              const itemName =
                item?.title ||
                item?.machine_name ||
                item?.contact_info?.full_name ||
                `Item #${item.id}`;
              dialogManager.setConfirmationProgress(
                Math.round((i / totalItems) * 100),
                itemName
              );

              try {
                await handleDelete(item);
                successCount++;
              } catch (error) {
                console.error(`Failed to delete item ${item.id}:`, error);
                errorCount++;
              }

              dialogManager.setConfirmationProgress(
                Math.round(((i + 1) / totalItems) * 100),
                itemName
              );
            }

            dialogManager.setConfirmationProgress(100);
            if (successCount > 0) {
              toast.success(`${successCount} item(s) deleted successfully`);
            }
            if (errorCount > 0) {
              toast.error(`${errorCount} item(s) failed to delete`);
            }

            resetSelection();
            dialogManager.closeDialog();
          } catch (error: unknown) {
            console.error("Failed to delete items:", error);
            toast.error("Failed to delete items");
            dialogManager.setConfirmationProcessing(false);
            throw error;
          }
        },
      });
    },
    [dialogManager, handleDelete, resolveSelectedItems, resetSelection]
  );

  const canViewTrash = useRoutePermissions()?.read ?? false;
  const canSelectRows = Boolean(trash_write || trash_delete);

  const columns = useMemo(
    () =>
      getTrashOrgUiColumns({
        canRestore: Boolean(trash_write),
        canDelete: Boolean(trash_delete),
        onView: openTrashItem,
        onRestore: handleRestoreRow,
        onDelete: promptDeleteRow,
      }),
    [
      trash_write,
      trash_delete,
      openTrashItem,
      handleRestoreRow,
      promptDeleteRow,
    ]
  );

  const tablePreferences = useTablePreferences(columns, {
    defaultVariant: TableVariantEnum.PLAIN,
  });
  const visibleColumns = tablePreferences.applyColumns(columns);

  const categoryFilterItems = useMemo(() => {
    const items = [];
    if (hasLeadsAccess) {
      items.push({ id: "leads", name: "Leads" });
    }
    if (hasJobsAccess) {
      items.push({ id: "jobs", name: "Jobs" });
    }
    if (hasEquipmentAccess) {
      items.push({ id: "equipment", name: "Equipment" });
    }
    return items;
  }, [hasLeadsAccess, hasJobsAccess, hasEquipmentAccess]);

  const assignedToFilterItems = useMemo(() => {
    const items = [{ id: "me", name: "Assigned to me" }];
    if (isAdmin && memberOptions.length > 0) {
      for (const member of memberOptions) {
        items.push({ id: String(member.id), name: member.label });
      }
    }
    return items;
  }, [isAdmin, memberOptions]);

  useEffect(() => {
    if (!isPreferenceReady || assignedTo === null) return;

    const assignedFilterValue = assignedTo === "all" ? [] : [assignedTo];
    const currentFilters = useOrgTrashPageStore.getState().filters;
    const currentAssigned = currentFilters[FilterType.TRASH_ASSIGNED_TO];

    if (
      Array.isArray(currentAssigned) &&
      JSON.stringify(currentAssigned) === JSON.stringify(assignedFilterValue)
    ) {
      return;
    }

    setFilters({
      ...currentFilters,
      [FilterType.TRASH_ASSIGNED_TO]: assignedFilterValue,
    });
  }, [assignedTo, isPreferenceReady, setFilters]);

  const handleFiltersChange = useCallback(
    (nextFilters: FilterState) => {
      setFilters(nextFilters);

      const assignedSelection = nextFilters[FilterType.TRASH_ASSIGNED_TO];
      if (!Array.isArray(assignedSelection)) return;

      const nextAssigned = assignedSelection[0] ?? "all";
      if (nextAssigned !== assignedTo) {
        setAssignedTo(nextAssigned);
      }
    },
    [assignedTo, setAssignedTo, setFilters]
  );

  const getActiveFilterLabel = useMemo(() => {
    const selectedCategories = Array.isArray(
      filters[FilterType.TRASH_CATEGORIES]
    )
      ? filters[FilterType.TRASH_CATEGORIES]
      : [];

    const selectedAssigned = Array.isArray(
      filters[FilterType.TRASH_ASSIGNED_TO]
    )
      ? filters[FilterType.TRASH_ASSIGNED_TO]
      : [];

    const categoryLabel = (() => {
      if (selectedCategories.length === 0) return null;
      if (selectedCategories.length === 1) {
        const category = categoryFilterItems.find(
          (item) => item.id === selectedCategories[0]
        );
        return category ? category.name : null;
      }
      return `${selectedCategories.length} categories`;
    })();

    const assignedLabel = (() => {
      if (selectedAssigned.length === 0) return null;
      const owner = assignedToFilterItems.find(
        (item) => item.id === selectedAssigned[0]
      );
      return owner ? owner.name : null;
    })();

    const parts = [categoryLabel, assignedLabel].filter(Boolean);
    if (parts.length === 0) return "All";
    return parts.join(" · ");
  }, [assignedToFilterItems, categoryFilterItems, filters]);

  const trashCategoryIncludesJobs = useMemo(() => {
    const selected = Array.isArray(filters[FilterType.TRASH_CATEGORIES])
      ? (filters[FilterType.TRASH_CATEGORIES] as string[])
      : [];
    if (selected.length === 0) return true;
    return selected.includes("jobs");
  }, [filters]);

  const trashEmptyDescription =
    filterActive && hasJobsAccess && trashCategoryIncludesJobs
      ? "No jobs found for the selected filter in trash."
      : "Deleted items will appear here.";

  return {
    dialogManager,
    data,
    card,
    closeCard,
    setCard,
    filters,
    setFilters,
    selectedIds,
    setSelectedIds,
    trash_write,
    trash_delete,
    leadStatuses,
    canViewTrash,
    canSelectRows,
    tableRows,
    visibleColumns,
    tablePreferences,
    categoryFilterItems,
    assignedToFilterItems,
    getActiveFilterLabel,
    handleFiltersChange,
    trashEmptyDescription,
    hasJobsAccess,
    hasEquipmentAccess,
    hasLeadsAccess,
    promptDelete,
    handleRestore,
    handleRestoreAll,
    promptDeleteAll,
    openTrashItem,
  };
}
