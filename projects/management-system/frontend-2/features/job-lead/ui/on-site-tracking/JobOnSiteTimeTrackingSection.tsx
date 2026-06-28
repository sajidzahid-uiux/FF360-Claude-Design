"use client";

import { useMemo, useState } from "react";

import { Button, ButtonVariantEnum, Input } from "@fieldflow360/org-ui";
import { Download } from "lucide-react";
import { toast } from "sonner";

import type { UpdateTimeEntryPayload } from "@/api/types/jobTimeEntries";
import { JobType } from "@/constants";
import {
  type InstalledHoursLogRow,
  InstalledHoursLogsAllModal,
  InstalledHoursLogsTable,
} from "@/features/jobs";
import { EditTimeEntryDialog } from "@/features/time-tracking";
import { useDialogManager } from "@/hooks";
import {
  useAddJobTimeEntry,
  useDeleteJobTimeEntry,
  useUpdateJobTimeEntry,
} from "@/hooks/mutations";
import { useJobProgressPermissions } from "@/hooks/permissions";
import {
  JOB_TIME_ENTRIES_PREVIEW_PAGE_SIZE,
  useJobTimeEntries,
} from "@/hooks/queries";
import { StorageKey, useDataFromStorageByKey } from "@/hooks/storage-data";
import { useModalStack } from "@/shared/model/use-modal-stack";
import { DetailFormSection, DialogManager } from "@/shared/ui/common";

export interface JobOnSiteTimeTrackingSectionProps {
  jobId: number;
  jobType: JobType;
  disabled?: boolean;
  onExportExcel?: () => void;
}

export function JobOnSiteTimeTrackingSection({
  jobId,
  jobType,
  disabled = false,
  onExportExcel,
}: JobOnSiteTimeTrackingSectionProps) {
  const dialogManager = useDialogManager();
  const { stack, openModal, closeModalKey } = useModalStack();
  const isInstalledHoursOpen = stack.some(
    (f) => f.key === "view-installed-hours"
  );
  const addTimeEntry = useAddJobTimeEntry();
  const updateTimeEntry = useUpdateJobTimeEntry();
  const deleteTimeEntry = useDeleteJobTimeEntry();
  const [timeEntryHours, setTimeEntryHours] = useState("");
  const [timeEntryDescription, setTimeEntryDescription] = useState("");

  const memberIdRaw = useDataFromStorageByKey(StorageKey.MEMBER_ID);
  const currentMemberId = useMemo((): number | null => {
    if (memberIdRaw == null || memberIdRaw === "") return null;
    const n =
      typeof memberIdRaw === "number"
        ? memberIdRaw
        : parseInt(String(memberIdRaw), 10);
    return Number.isNaN(n) ? null : n;
  }, [memberIdRaw]);

  const { canUpdateTimeTracking } = useJobProgressPermissions(jobId, jobType);

  const {
    data: installedHoursPreview,
    isLoading: installedHoursLoading,
    isError: installedHoursError,
  } = useJobTimeEntries(jobId, jobType);

  const displayedInstalledRows = useMemo(() => {
    const rows = installedHoursPreview?.rows ?? [];
    if (rows.length <= JOB_TIME_ENTRIES_PREVIEW_PAGE_SIZE) return rows;
    return rows.slice(0, JOB_TIME_ENTRIES_PREVIEW_PAGE_SIZE);
  }, [installedHoursPreview?.rows]);

  const actionsBusy = updateTimeEntry.isPending || deleteTimeEntry.isPending;

  const exportAction = (
    <Button
      disabled={disabled}
      leftIcon={<Download aria-hidden className="h-4 w-4" strokeWidth={2} />}
      title="Export Excel"
      variant={ButtonVariantEnum.SURFACE}
      onClick={() => {
        toast.info("Coming Soon");
        onExportExcel?.();
      }}
    />
  );

  function openEdit(row: InstalledHoursLogRow) {
    dialogManager.openDialog({
      type: "editTimeEntry",
      component: EditTimeEntryDialog,
      props: {
        initialRow: row,
        disabled,
        onSave: async (payload: UpdateTimeEntryPayload) => {
          await updateTimeEntry.mutateAsync(payload);
          dialogManager.closeDialog();
        },
      },
    });
  }

  function handleDeleteRequest(row: InstalledHoursLogRow) {
    dialogManager.openConfirmationDialog({
      title: "Delete time entry?",
      description:
        "This removes this installed hours log entry. This cannot be undone.",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      variant: "destructive",
      confirmationType: "delete",
      onConfirm: async () => {
        const id = parseInt(row.id, 10);
        if (Number.isNaN(id)) return;
        await deleteTimeEntry.mutateAsync(id);
      },
    });
  }

  function handleAddTimeEntry() {
    if (!timeEntryHours) return;

    const hours = parseFloat(timeEntryHours);
    if (!Number.isFinite(hours) || hours <= 0) return;

    addTimeEntry.mutate(
      {
        job_id: jobId,
        job_type: jobType,
        hours,
        description: timeEntryDescription.trim() || undefined,
      },
      {
        onSuccess: () => {
          setTimeEntryHours("");
          setTimeEntryDescription("");
        },
      }
    );
  }

  const canSubmitEntry =
    !disabled &&
    timeEntryHours.length > 0 &&
    Number.isFinite(parseFloat(timeEntryHours)) &&
    parseFloat(timeEntryHours) > 0;

  return (
    <>
      <DetailFormSection actions={exportAction} title="Time tracking">
        {canUpdateTimeTracking ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="w-full min-w-[6rem] sm:w-28">
              <Input
                disabled={disabled}
                label="Hours"
                min={0}
                placeholder="0"
                step="0.01"
                type="number"
                value={timeEntryHours}
                onChange={(e) => setTimeEntryHours(e.target.value)}
              />
            </div>
            <div className="min-w-0 flex-1 sm:min-w-[12rem]">
              <Input
                disabled={disabled}
                label="Description"
                placeholder="Enter description"
                type="text"
                value={timeEntryDescription}
                onChange={(e) => setTimeEntryDescription(e.target.value)}
              />
            </div>
            <Button
              aria-label="Add entry"
              disabled={!canSubmitEntry || addTimeEntry.isPending}
              title="Add entry"
              onClick={handleAddTimeEntry}
            />
          </div>
        ) : (
          <p className="text-text-muted text-sm">
            You do not have permission to add time tracking entries for this
            job.
          </p>
        )}
      </DetailFormSection>

      <DetailFormSection
        actions={
          <Button
            aria-label="View all logs"
            disabled={disabled}
            title="View all logs"
            variant={ButtonVariantEnum.SURFACE}
            onClick={() => openModal("view-installed-hours")}
          />
        }
        description="Recent installed hours for this job."
        title="Installed hours logs"
      >
        {installedHoursLoading ? (
          <p className="text-text-muted py-6 text-center text-sm">Loading…</p>
        ) : installedHoursError ? (
          <p className="text-feedback-error py-6 text-center text-sm">
            Could not load installed hours. Try again later.
          </p>
        ) : (
          <InstalledHoursLogsTable
            actionsDisabled={disabled || actionsBusy}
            canModifyOwnEntries={canUpdateTimeTracking}
            currentMemberId={currentMemberId}
            rows={displayedInstalledRows}
            onDelete={handleDeleteRequest}
            onEdit={openEdit}
          />
        )}
      </DetailFormSection>

      <InstalledHoursLogsAllModal
        actionsDisabled={disabled || actionsBusy}
        canModifyOwnEntries={canUpdateTimeTracking}
        currentMemberId={currentMemberId}
        jobId={jobId}
        jobType={jobType}
        open={isInstalledHoursOpen}
        onDelete={(row) => {
          closeModalKey("view-installed-hours");
          handleDeleteRequest(row);
        }}
        onEdit={(row) => {
          closeModalKey("view-installed-hours");
          openEdit(row);
        }}
        onOpenChange={(open) => {
          if (!open) closeModalKey("view-installed-hours");
        }}
      />

      <DialogManager manager={dialogManager} />
    </>
  );
}
