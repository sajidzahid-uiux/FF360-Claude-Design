"use client";

import { useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  TabsSwitcher,
} from "@fieldflow360/org-ui";

import type {
  InstalledFootageLogEntry,
  InstalledFootageLogType,
  UpdateInstalledFootageLogBody,
} from "@/api/types/installedFootageLogs";
import {
  useDialogManager,
  useInstalledFootageLogMutations,
  useInstalledFootageLogs,
} from "@/hooks";
import { DialogManager } from "@/shared/ui/common";
import { useModalStack } from "@/shared/model/use-modal-stack";

import { EditInstalledFootageLogDialog } from "./EditInstalledFootageLogDialog";
import { InstalledFootageLogsAllModal } from "./InstalledFootageLogsAllModal";
import { LateralFootageTable } from "./LateralFootageTable";
import { MainFootageTable } from "./MainFootageTable";
import { RaisersFootageTable } from "./RaisersFootageTable";

const FOOTAGE_LOG_TABS = [
  { value: "main" as const, label: "Main Lines" },
  { value: "lateral" as const, label: "Lateral Lines" },
  { value: "raisers" as const, label: "Raisers" },
];

interface InstalledFootageLogsSectionProps {
  jobId: number;
  disabled?: boolean;
  canUpdateInstalledFootage: boolean;
  canUpdateInstalledRaisers: boolean;
  onLogsChanged?: () => void;
}

export function InstalledFootageLogsSection({
  jobId,
  disabled = false,
  canUpdateInstalledFootage,
  canUpdateInstalledRaisers,
  onLogsChanged,
}: InstalledFootageLogsSectionProps) {
  const dialogManager = useDialogManager();
  const { stack, openModal, closeModalKey } = useModalStack();
  const isAllModalOpen = stack.some((f) => f.key === "view-installed-footage");
  const [tab, setTab] = useState<InstalledFootageLogType>("main");

  const { data, isLoading, isError } = useInstalledFootageLogs(jobId, tab);

  const { updateLog, deleteLog } = useInstalledFootageLogMutations(jobId, {
    onMutationSuccess: onLogsChanged,
  });

  const previewRows = data?.pages?.[0]?.results ?? [];

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

  function openFootageLogsAllModal() {
    openModal("view-installed-footage", { tab });
  }

  const tableProps = {
    isLoading,
    isError,
    disabled,
    actionsBusy: updateLog.isPending || deleteLog.isPending,
    canModifyRow,
    onEdit: openEdit,
    onDelete: requestDelete,
  };

  return (
    <div className="border-border-subtle bg-bg-surface-elevated rounded-lg border p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-3xl leading-tight font-semibold">
          Installed Footage Logs
        </p>
        <div className="flex items-center gap-2">
          <Button
            aria-label="View all logs"
            disabled={disabled || isLoading}
            size={ComponentSizeEnum.SM}
            title="View all logs"
            variant={ButtonVariantEnum.SURFACE}
            onClick={openFootageLogsAllModal}
          />
        </div>
      </div>

      <TabsSwitcher
        fullWidth
        className="mb-4 w-full"
        items={FOOTAGE_LOG_TABS}
        value={tab}
        onChange={(value) => {
          setTab(value);
        }}
      />

      {tab === "main" ? (
        <MainFootageTable
          {...tableProps}
          rows={previewRows.filter((e) => e.log_type === "main")}
        />
      ) : null}
      {tab === "lateral" ? (
        <LateralFootageTable
          {...tableProps}
          rows={previewRows.filter((e) => e.log_type === "lateral")}
        />
      ) : null}
      {tab === "raisers" ? (
        <RaisersFootageTable
          {...tableProps}
          rows={previewRows.filter((e) => e.log_type === "raisers")}
        />
      ) : null}

      {isAllModalOpen ? (
        <InstalledFootageLogsAllModal
          canUpdateInstalledFootage={canUpdateInstalledFootage}
          canUpdateInstalledRaisers={canUpdateInstalledRaisers}
          disabled={disabled}
          initialTab={
            (stack.find((f) => f.key === "view-installed-footage")?.params
              .tab as InstalledFootageLogType | undefined) ?? tab
          }
          jobId={jobId}
          open={isAllModalOpen}
          onLogsChanged={onLogsChanged}
          onOpenChange={(o) => {
            if (!o) closeModalKey("view-installed-footage");
          }}
        />
      ) : null}

      <DialogManager manager={dialogManager} />
    </div>
  );
}
