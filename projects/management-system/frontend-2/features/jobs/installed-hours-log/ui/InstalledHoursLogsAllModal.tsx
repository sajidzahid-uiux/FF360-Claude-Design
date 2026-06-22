"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  Modal,
} from "@fieldflow360/org-ui";

import { JobType } from "@/constants";
import { useJobTimeEntriesModalPage } from "@/hooks";

import { mapTimeEntriesToInstalledHoursRows } from "../mapTimeEntriesToRows";
import type { InstalledHoursLogRow } from "../model/types";
import { InstalledHoursLogsTable } from "./InstalledHoursLogsTable";

export interface InstalledHoursLogsAllModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  jobId: number;
  jobType: JobType;
  currentMemberId: number | null;
  canModifyOwnEntries?: boolean;
  actionsDisabled?: boolean;
  onEdit?: (row: InstalledHoursLogRow) => void;
  onDelete?: (row: InstalledHoursLogRow) => void;
}

export function InstalledHoursLogsAllModal({
  open = true,
  onOpenChange,
  jobId,
  jobType,
  currentMemberId,
  canModifyOwnEntries = false,
  actionsDisabled = false,
  onEdit,
  onDelete,
}: InstalledHoursLogsAllModalProps) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (open) setPage(1);
  }, [open, jobId, jobType]);

  const { data, isLoading, isError, isFetching } = useJobTimeEntriesModalPage(
    jobId,
    jobType,
    page,
    open
  );

  const rows = useMemo(
    () => mapTimeEntriesToInstalledHoursRows(data?.results ?? []),
    [data?.results]
  );

  const totalPages = data?.totalPages ?? 1;
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const handleClose = () => onOpenChange?.(false);

  if (!open) {
    return null;
  }

  return (
    <Modal
      className="max-w-3xl"
      isOpen={open}
      title="Installed hours logs"
      onClose={handleClose}
    >
      <div className="flex min-h-0 flex-col gap-3">
        <div className="max-h-[50vh] min-h-0 overflow-y-auto pb-2">
          {isLoading && !data ? (
            <p className="text-text-muted py-6 text-center text-sm">Loading…</p>
          ) : isError ? (
            <p className="text-feedback-error py-6 text-center text-sm">
              Could not load installed hours. Try again later.
            </p>
          ) : (
            <InstalledHoursLogsTable
              actionsDisabled={actionsDisabled || isFetching}
              canModifyOwnEntries={canModifyOwnEntries}
              currentMemberId={currentMemberId}
              rows={rows}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          )}
        </div>
        <div className="border-border-subtle flex shrink-0 flex-wrap items-center justify-between gap-2 border-t pt-3">
          <p className="text-text-muted text-sm">
            Page {page} of {totalPages}
            {data?.totalCount != null
              ? ` · ${data.totalCount} entr${data.totalCount === 1 ? "y" : "ies"}`
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
  );
}
