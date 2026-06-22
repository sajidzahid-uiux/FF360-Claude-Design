"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  Modal,
  TabsSwitcher,
} from "@fieldflow360/org-ui";

import type {
  InstalledFootageLogEntry,
  InstalledFootageLogType,
  UpdateInstalledFootageLogBody,
} from "@/api/types/installedFootageLogs";
import { installedFootageLogsTotalCount } from "@/api/types/installedFootageLogs";
import {
  INSTALLED_FOOTAGE_LOGS_MODAL_PAGE_SIZE,
  useDialogManager,
  useInstalledFootageLogMutations,
  useInstalledFootageLogsPage,
} from "@/hooks";
import { DialogManager } from "@/shared/ui/common";

import { EditInstalledFootageLogDialog } from "./EditInstalledFootageLogDialog";
import { LateralFootageTable } from "./LateralFootageTable";
import { MainFootageTable } from "./MainFootageTable";
import { RaisersFootageTable } from "./RaisersFootageTable";

const FOOTAGE_LOG_TABS = [
  { value: "main" as const, label: "Main Lines" },
  { value: "lateral" as const, label: "Lateral Lines" },
  { value: "raisers" as const, label: "Raisers" },
];

export interface InstalledFootageLogsAllModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  jobId: number;
  disabled?: boolean;
  canUpdateInstalledFootage: boolean;
  canUpdateInstalledRaisers: boolean;
  onLogsChanged?: () => void;
  /** Tab to select when the dialog opens */
  initialTab?: InstalledFootageLogType;
}

export function InstalledFootageLogsAllModal({
  open = true,
  onOpenChange,
  jobId,
  disabled = false,
  canUpdateInstalledFootage,
  canUpdateInstalledRaisers,
  onLogsChanged,
  initialTab = "main",
}: InstalledFootageLogsAllModalProps) {
  const dialogManager = useDialogManager();
  const [tab, setTab] = useState<InstalledFootageLogType>(initialTab);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (open) {
      setTab(initialTab);
      setPage(1);
    }
  }, [open, initialTab, jobId]);

  const { data, isLoading, isError, isFetching } = useInstalledFootageLogsPage(
    jobId,
    tab,
    page,
    open
  );

  const rows = data?.results ?? [];
  const totalCount = installedFootageLogsTotalCount(data);
  const pageSizeForTotal =
    data?.page_size ?? INSTALLED_FOOTAGE_LOGS_MODAL_PAGE_SIZE;
  const totalPages = useMemo(() => {
    if (data?.total_pages != null && data.total_pages > 0) {
      return data.total_pages;
    }
    return Math.max(1, Math.ceil(totalCount / Math.max(1, pageSizeForTotal)));
  }, [data?.total_pages, pageSizeForTotal, totalCount]);

  const { updateLog, deleteLog } = useInstalledFootageLogMutations(jobId, {
    onMutationSuccess: onLogsChanged,
  });

  function canModifyRow(entry: InstalledFootageLogEntry): boolean {
    const hasWriteScope =
      entry.log_type === "raisers"
        ? canUpdateInstalledRaisers
        : canUpdateInstalledFootage;
    return hasWriteScope && entry.editable === true;
  }

  function openEdit(entry: InstalledFootageLogEntry) {
    dialogManager.openDialog({
      type: "component",
      component: EditInstalledFootageLogDialog,
      props: {
        entry,
        disabled,
        onSave: async (body: UpdateInstalledFootageLogBody) => {
          await updateLog.mutateAsync({
            logType: entry.log_type,
            id: entry.id,
            body,
          });
          dialogManager.closeDialog();
        },
      },
    });
  }

  function requestDelete(entry: InstalledFootageLogEntry) {
    dialogManager.openConfirmationDialog({
      title: "Delete installed footage log?",
      description: "This removes this log entry. This cannot be undone.",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      variant: "destructive",
      confirmationType: "delete",
      onConfirm: async () => {
        await deleteLog.mutateAsync({
          logType: entry.log_type,
          id: entry.id,
        });
      },
    });
  }

  const tableProps = {
    isLoading,
    isError,
    disabled,
    actionsBusy: updateLog.isPending || deleteLog.isPending || isFetching,
    canModifyRow,
    onEdit: openEdit,
    onDelete: requestDelete,
  };

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const handleClose = () => onOpenChange?.(false);

  if (!open) {
    return null;
  }

  return (
    <>
      <Modal
        className="max-w-4xl"
        isOpen={open}
        title="Installed footage logs"
        onClose={handleClose}
      >
        <div className="flex min-h-0 flex-col gap-3">
          <TabsSwitcher
            fullWidth
            className="w-full max-w-xl"
            items={FOOTAGE_LOG_TABS}
            value={tab}
            onChange={(value) => {
              setTab(value);
              setPage(1);
            }}
          />

          <div className="max-h-[50vh] min-h-0 overflow-y-auto pb-2">
            {tab === "main" ? (
              <MainFootageTable
                {...tableProps}
                rows={rows.filter((e) => e.log_type === "main")}
              />
            ) : null}
            {tab === "lateral" ? (
              <LateralFootageTable
                {...tableProps}
                rows={rows.filter((e) => e.log_type === "lateral")}
              />
            ) : null}
            {tab === "raisers" ? (
              <RaisersFootageTable
                {...tableProps}
                rows={rows.filter((e) => e.log_type === "raisers")}
              />
            ) : null}
          </div>

          <div className="border-border-subtle flex shrink-0 flex-wrap items-center justify-between gap-2 border-t pt-3">
            <p className="text-text-muted text-sm">
              Page {page} of {totalPages}
              {totalCount > 0
                ? ` · ${totalCount} entr${totalCount === 1 ? "y" : "ies"} (${tab})`
                : null}
            </p>
            <div className="flex gap-2">
              <Button
                aria-label="Previous"
                disabled={!canPrev || isLoading || isFetching}
                size={ComponentSizeEnum.SM}
                title="Previous"
                variant={ButtonVariantEnum.SURFACE}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              />
              <Button
                aria-label="Next"
                disabled={!canNext || isLoading || isFetching}
                size={ComponentSizeEnum.SM}
                title="Next"
                variant={ButtonVariantEnum.SURFACE}
                onClick={() => setPage((p) => p + 1)}
              />
            </div>
          </div>
        </div>
      </Modal>
      <DialogManager manager={dialogManager} />
    </>
  );
}
