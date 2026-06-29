"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";

import { AppFormModal } from "@fieldflow360/org-ui";

import type { Job, PaginatedResponse } from "@/api/types";
import { useJobsList } from "@/hooks/queries";
import { Dropdown, type DropdownItem } from "@/shared/ui/common";
import { Label } from "@/shared/ui/primitives";

export interface CreateOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the chosen job id; the parent creates the order + opens the wizard. */
  onSubmit: (jobId: number) => void | Promise<void>;
  isSubmitting?: boolean;
}

function jobLabel(job: Job): string {
  return (
    job.title?.trim() ||
    job.description?.trim() ||
    job.po_number?.trim() ||
    `Job #${job.id}`
  );
}

export function CreateOrderModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: CreateOrderModalProps) {
  const [jobId, setJobId] = useState("");

  const { data, isLoading } = useJobsList({}, open);

  const jobs = useMemo<Job[]>(() => {
    if (Array.isArray(data)) return data;
    return (data as PaginatedResponse<Job> | undefined)?.results ?? [];
  }, [data]);

  const jobItems = useMemo<DropdownItem[]>(
    () =>
      jobs.map((job) => ({
        id: String(job.id),
        label: jobLabel(job),
        type: "item",
      })),
    [jobs]
  );

  useEffect(() => {
    if (!open) setJobId("");
  }, [open]);

  const handleClose = () => {
    if (!isSubmitting) onOpenChange(false);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const id = Number(jobId);
    if (!Number.isFinite(id) || id <= 0) return;
    await onSubmit(id);
  };

  if (!open) return null;

  return (
    <AppFormModal
      showCancel
      cancelLabel="Cancel"
      isOpen={open}
      isSubmitting={isSubmitting}
      submitDisabled={!jobId}
      submitLabel="Create Order"
      title="Create Order"
      width={520}
      onClose={handleClose}
      onSubmit={handleSubmit}
    >
      <div className="space-y-2">
        <Label htmlFor="create-order-job" variant="field">
          Job
        </Label>
        <Dropdown
          items={jobItems}
          mode="select"
          placeholder={isLoading ? "Loading jobs…" : "Select a job"}
          selectedValue={jobId}
          width="full"
          onValueChange={setJobId}
        />
        <p className="text-text-muted text-xs">
          Pick the job this order is for. You&apos;ll choose a vendor and add pipe
          items in the next step.
        </p>
      </div>
    </AppFormModal>
  );
}
