"use client";

import { useCallback } from "react";

import { toast } from "sonner";

import type { Job } from "@/api/types";
import { JobType, LeadType } from "@/api/types";
import { type JobLeadArchiveTab, ResourceType } from "@/constants";
import {
  useArchiveJob,
  useArchiveLead,
  useTrashJob,
  useTrashLead,
  useUnarchiveJob,
  useUnarchiveLead,
} from "@/hooks/mutations";
import { useDebounceNavigation } from "@/hooks/useDebounceNavigation";
import { useDialogManager } from "@/hooks/useDialogManager";
import { useRouteIds } from "@/hooks/useRouteIds";
import { orgPath, orgUrl } from "@/shared/config/routes";
import { bulkActionSuccessMessage, bulkConfirmationCopy } from "@/shared/lib";

const BULK_ACTION_PAST_TENSE = {
  trash: "trashed successfully",
  archive: "archived successfully",
  unarchive: "unarchived successfully",
} as const;

export type JobLeadListEntity = ResourceType;
export type JobLeadListTab = JobLeadArchiveTab;

export type JobLeadListActionItem = Pick<
  Job,
  "id" | "title" | "po_number" | "contact_info"
>;

interface UseJobLeadListActionsBaseParams<TItem extends JobLeadListActionItem> {
  currentTab: JobLeadListTab | "on_hold";
  activeItems: TItem[];
  archivedItems: TItem[];
  onHoldItems?: TItem[];
  detailBasePath: string;
  selectedIds: (string | number)[];
  setSelectedIds: (ids: (string | number)[]) => void;
  dialogManager: ReturnType<typeof useDialogManager>;
  getItemName?: (item: TItem | undefined, id: number) => string;
}

type UseJobLeadListActionsParams<TItem extends JobLeadListActionItem> =
  | (UseJobLeadListActionsBaseParams<TItem> & {
      entity: ResourceType.JOB;
      type: JobType;
      onSiteTrackingBasePath?: string;
    })
  | (UseJobLeadListActionsBaseParams<TItem> & {
      entity: ResourceType.LEAD;
      type: LeadType;
      onSiteTrackingBasePath?: never;
    });

function defaultItemName(
  entity: JobLeadListEntity,
  item: JobLeadListActionItem | undefined,
  id: number
): string {
  return (
    item?.contact_info?.full_name ||
    item?.title ||
    (item?.po_number == null ? undefined : String(item.po_number)) ||
    `${entity === ResourceType.JOB ? "Job" : "Lead"} #${id}`
  );
}

function toNumberIds(ids: (string | number)[]): number[] {
  return ids
    .map((id) => Number(id))
    .filter((id): id is number => Number.isFinite(id));
}

export function useJobLeadListActions<TItem extends JobLeadListActionItem>(
  params: UseJobLeadListActionsParams<TItem>
) {
  const { navigateTo } = useDebounceNavigation();
  const { orgId } = useRouteIds();
  const archiveJob = useArchiveJob();
  const unarchiveJob = useUnarchiveJob();
  const trashJob = useTrashJob();
  const archiveLead = useArchiveLead();
  const unarchiveLead = useUnarchiveLead();
  const trashLead = useTrashLead();

  const {
    currentTab,
    activeItems,
    archivedItems,
    onHoldItems = [],
    detailBasePath,
    selectedIds,
    setSelectedIds,
    dialogManager,
    getItemName,
  } = params;

  const entityLabel = params.entity === ResourceType.JOB ? "Job" : "Lead";
  const entityLabelLower = entityLabel.toLowerCase();

  const getCurrentItem = useCallback(
    (id: number) => {
      const items =
        currentTab === "active"
          ? activeItems
          : currentTab === "archived"
            ? archivedItems
            : onHoldItems;
      return items.find((item) => item.id === id);
    },
    [activeItems, archivedItems, currentTab, onHoldItems]
  );

  const resolveItemName = useCallback(
    (id: number) =>
      getItemName?.(getCurrentItem(id), id) ||
      defaultItemName(params.entity, getCurrentItem(id), id),
    [getCurrentItem, getItemName, params.entity]
  );

  const archiveItem = useCallback(
    async (id: number, suppressToast = true) => {
      if (params.entity === ResourceType.JOB) {
        await archiveJob.mutateAsync({ id, jobType: params.type });
        return;
      }

      await archiveLead.mutateAsync({
        id,
        leadType: params.type,
        suppressToast,
      });
    },
    [archiveJob, archiveLead, params]
  );

  const unarchiveItem = useCallback(
    async (id: number, suppressToast = true) => {
      if (params.entity === ResourceType.JOB) {
        await unarchiveJob.mutateAsync({ id, jobType: params.type });
        return;
      }

      await unarchiveLead.mutateAsync({
        id,
        leadType: params.type,
        suppressToast,
      });
    },
    [params, unarchiveJob, unarchiveLead]
  );

  const trashItem = useCallback(
    async (id: number, suppressToast = true) => {
      if (params.entity === ResourceType.JOB) {
        await trashJob.mutateAsync({ id, jobType: params.type });
        return;
      }

      await trashLead.mutateAsync({
        id,
        leadType: params.type,
        suppressToast,
      });
    },
    [params, trashJob, trashLead]
  );

  const showMore = useCallback(
    (id: number, isArchived = false) => {
      navigateTo(
        orgUrl(orgId, `${detailBasePath}/${id}`, `archived=${isArchived}`)
      );
    },
    [detailBasePath, navigateTo, orgId]
  );

  const showLogs = useCallback(
    (id: number, isArchived = false) => {
      if (!id || Number.isNaN(id)) return;
      navigateTo(
        orgPath(orgId, `${detailBasePath}/${id}/logs?archived=${isArchived}`)
      );
    },
    [detailBasePath, navigateTo, orgId]
  );

  const showOnSiteTracking = useCallback(
    (id: number) => {
      if (params.entity !== "job" || !params.onSiteTrackingBasePath) return;

      navigateTo(
        orgPath(
          orgId,
          `${params.onSiteTrackingBasePath}/${id}/on-site-tracking${
            currentTab === "archived" ? "?archived=true" : ""
          }`
        )
      );
    },
    [currentTab, navigateTo, orgId, params]
  );

  const trash = useCallback(
    (id: number) => {
      dialogManager.openConfirmationDialog({
        title: "Move to Trash",
        confirmationType: "delete",
        itemTitle: resolveItemName(id),
        trash: true,
        variant: "destructive",
        confirmButtonText: "Move to Trash",
        onConfirm: async () => {
          try {
            await trashItem(id);
            toast.success(`${entityLabel} trashed successfully`);
            dialogManager.closeDialog();
          } catch (error: unknown) {
            console.error(`Failed to trash ${entityLabelLower}:`, error);
            toast.error(`Failed to trash ${entityLabelLower}`);
            dialogManager.setConfirmationProcessing(false);
            throw error;
          }
        },
      });
    },
    [dialogManager, entityLabel, entityLabelLower, resolveItemName, trashItem]
  );

  const archive = useCallback(
    (id: number) => {
      const copy = bulkConfirmationCopy({
        count: 1,
        entitySingular: entityLabelLower,
        entityPlural: `${entityLabelLower}s`,
        action: "archive",
      });
      dialogManager.openConfirmationDialog({
        title: copy.title,
        description: `Are you sure you want to archive "${resolveItemName(id)}"?`,
        confirmButtonText: copy.confirmButtonText,
        variant: "default",
        onConfirm: async () => {
          try {
            await archiveItem(id);
            toast.success(`${entityLabel} archived successfully`);
            dialogManager.closeDialog();
          } catch (error: unknown) {
            console.error(`Failed to archive ${entityLabelLower}:`, error);
            toast.error(`Failed to archive ${entityLabelLower}`);
            dialogManager.setConfirmationProcessing(false);
            throw error;
          }
        },
      });
    },
    [archiveItem, dialogManager, entityLabel, entityLabelLower, resolveItemName]
  );

  const unarchive = useCallback(
    (id: number) => {
      const copy = bulkConfirmationCopy({
        count: 1,
        entitySingular: entityLabelLower,
        entityPlural: `${entityLabelLower}s`,
        action: "unarchive",
      });
      dialogManager.openConfirmationDialog({
        title: copy.title,
        description: `Are you sure you want to unarchive "${resolveItemName(id)}"?`,
        confirmButtonText: copy.confirmButtonText,
        variant: "default",
        onConfirm: async () => {
          try {
            await unarchiveItem(id);
            toast.success(`${entityLabel} unarchived successfully`);
            dialogManager.closeDialog();
          } catch (error: unknown) {
            console.error(`Failed to unarchive ${entityLabelLower}:`, error);
            toast.error(`Failed to unarchive ${entityLabelLower}`);
            dialogManager.setConfirmationProcessing(false);
            throw error;
          }
        },
      });
    },
    [
      dialogManager,
      entityLabel,
      entityLabelLower,
      resolveItemName,
      unarchiveItem,
    ]
  );

  const runBulkAction = useCallback(
    async (
      ids: number[],
      manager: ReturnType<typeof useDialogManager>,
      action: "trash" | "archive" | "unarchive"
    ) => {
      try {
        manager.setConfirmationProcessing(true);
        manager.setConfirmationProgress(0);

        for (let index = 0; index < ids.length; index++) {
          const id = ids[index];

          if (action === "trash") {
            await trashItem(id);
          } else if (action === "archive") {
            await archiveItem(id);
          } else {
            await unarchiveItem(id);
          }

          manager.setConfirmationProgress(
            Math.round(((index + 1) / ids.length) * 100),
            resolveItemName(id)
          );
        }

        toast.success(
          bulkActionSuccessMessage(
            ids.length,
            entityLabelLower,
            `${entityLabelLower}s`,
            BULK_ACTION_PAST_TENSE[action]
          )
        );
        manager.closeDialog();
        setSelectedIds([]);
      } catch (error: unknown) {
        console.error(`Failed to ${action} ${entityLabelLower}s:`, error);
        toast.error(`Failed to ${action} ${entityLabelLower}s`);
      } finally {
        manager.setConfirmationProcessing(false);
        manager.setConfirmationProgress(0);
      }
    },
    [
      archiveItem,
      entityLabelLower,
      resolveItemName,
      setSelectedIds,
      trashItem,
      unarchiveItem,
    ]
  );

  const trashSelected = useCallback(
    (ids: number[] = toNumberIds(selectedIds)) => {
      setSelectedIds(ids);
      const copy = bulkConfirmationCopy({
        count: ids.length,
        entitySingular: entityLabelLower,
        entityPlural: `${entityLabelLower}s`,
        action: "trash",
        confirmSingle: "Trash",
        confirmPlural: "Trash",
      });
      dialogManager.openConfirmationDialog({
        title: copy.title,
        description: copy.description,
        confirmationType: "delete",
        trash: true,
        variant: "destructive",
        confirmButtonText: copy.confirmButtonText,
        onConfirm: async () => runBulkAction(ids, dialogManager, "trash"),
      });
    },
    [
      dialogManager,
      entityLabelLower,
      runBulkAction,
      selectedIds,
      setSelectedIds,
    ]
  );

  const archiveSelected = useCallback(
    (ids: number[] = toNumberIds(selectedIds)) => {
      setSelectedIds(ids);
      const copy = bulkConfirmationCopy({
        count: ids.length,
        entitySingular: entityLabelLower,
        entityPlural: `${entityLabelLower}s`,
        action: "archive",
      });
      dialogManager.openConfirmationDialog({
        title: copy.title,
        description: copy.description,
        variant: "default",
        confirmButtonText: copy.confirmButtonText,
        onConfirm: async () => runBulkAction(ids, dialogManager, "archive"),
      });
    },
    [
      dialogManager,
      entityLabelLower,
      runBulkAction,
      selectedIds,
      setSelectedIds,
    ]
  );

  const unarchiveSelected = useCallback(
    (ids: number[] = toNumberIds(selectedIds)) => {
      setSelectedIds(ids);
      const copy = bulkConfirmationCopy({
        count: ids.length,
        entitySingular: entityLabelLower,
        entityPlural: `${entityLabelLower}s`,
        action: "unarchive",
      });
      dialogManager.openConfirmationDialog({
        title: copy.title,
        description: copy.description,
        variant: "default",
        confirmButtonText: copy.confirmButtonText,
        onConfirm: async () => runBulkAction(ids, dialogManager, "unarchive"),
      });
    },
    [
      dialogManager,
      entityLabelLower,
      runBulkAction,
      selectedIds,
      setSelectedIds,
    ]
  );

  return {
    archive,
    archiveSelected,
    selectedIds,
    showLogs,
    showMore,
    showOnSiteTracking,
    trash,
    trashSelected,
    unarchive,
    unarchiveSelected,
  };
}
