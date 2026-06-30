"use client";

import { useEffect, useMemo, useState } from "react";

import { ComponentSizeEnum, Dropdown } from "@fieldflow360/org-ui";
import { toast } from "sonner";

import type { JobUpdatePayload } from "@/api/types";
import { JobType } from "@/constants";
import { getApiFieldErrorMessages, getErrorMessage } from "@/features/forms";
import {
  buildOperatorDropdownOptions,
  resolveOperatorDropdownValue,
} from "@/features/team";
import { useTeamData } from "@/hooks";
import { usePatchJob } from "@/hooks/mutations";
import { useJobById } from "@/hooks/queries";
import { parseEntityId } from "@/shared/lib/parseEntityId";
import { DetailFormSection, DetailViewEditActions } from "@/shared/ui/common";
import { Label, SanitizedInput } from "@/shared/ui/primitives";

interface SchedulingProps {
  jobId: string | number;
  jobType: JobType;
  disabled?: boolean;
  isTrashed?: boolean;
}

export default function Scheduling({
  jobId,
  jobType,
  disabled = false,
  isTrashed = false,
}: SchedulingProps) {
  const { data: job, isLoading: jobLoading } = useJobById(
    jobId,
    jobType,
    false,
    isTrashed
  );
  const patchJob = usePatchJob();
  const { data: teamMembers, isLoading: teamLoading } = useTeamData();

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [extraDays, setExtraDays] = useState<string>("");
  const [operatorId, setOperatorId] = useState<string>("");

  // Single edit mode state
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Track original values for discard
  const [originalStartDate, setOriginalStartDate] = useState<string>("");
  const [originalEndDate, setOriginalEndDate] = useState<string>("");
  const [originalExtraDays, setOriginalExtraDays] = useState<string>("");
  const [originalOperatorId, setOriginalOperatorId] = useState<string>("");

  // Initialize form values from job data
  useEffect(() => {
    if (job) {
      const start = job.start_date || "";
      const end = job.end_date || "";
      const extra = job.extra_days?.toString() || "";
      const operator = job.operator?.toString() || "none";

      setStartDate(start);
      setEndDate(end);
      setExtraDays(extra);
      setOperatorId(operator);

      setOriginalStartDate(start);
      setOriginalEndDate(end);
      setOriginalExtraDays(extra);
      setOriginalOperatorId(operator);

      // Reset edit mode
      setIsEditing(false);
    }
  }, [job]);

  const operatorOptions = useMemo(
    () =>
      teamLoading
        ? [{ value: "loading", label: "Loading…", disabled: true }]
        : buildOperatorDropdownOptions(teamMembers),
    [teamLoading, teamMembers]
  );

  // Handle edit mode toggle
  const handleEdit = () => {
    setIsEditing(true);
  };

  // Save all changes
  const handleSaveAll = async () => {
    // Validate dates if they are set
    if (startDate && startDate.length !== 10) {
      toast.error("Please select a complete start date");
      return;
    }
    if (endDate && endDate.length !== 10) {
      toast.error("Please select a complete end date");
      return;
    }

    const updatedJob: JobUpdatePayload = {};
    let hasChanges = false;

    if (startDate !== originalStartDate) {
      updatedJob.start_date = startDate || null;
      hasChanges = true;
    }
    if (endDate !== originalEndDate) {
      updatedJob.end_date = endDate || null;
      hasChanges = true;
    }
    if (extraDays !== originalExtraDays) {
      updatedJob.extra_days = extraDays === "" ? null : parseInt(extraDays);
      hasChanges = true;
    }
    if (operatorId !== originalOperatorId) {
      updatedJob.operator = operatorId === "none" ? null : parseInt(operatorId);
      hasChanges = true;
    }

    if (!hasChanges) {
      toast.info("No changes to save");
      return;
    }

    try {
      await patchJob.mutateAsync({
        id: parseEntityId(jobId),
        updatedJob,
        jobType,
      });
      toast.success("Timeline updated successfully");

      // Update original values
      setOriginalStartDate(startDate);
      setOriginalEndDate(endDate);
      setOriginalExtraDays(extraDays);
      setOriginalOperatorId(operatorId);

      // Exit edit mode
      setIsEditing(false);
    } catch (error: unknown) {
      const fieldErrors = getApiFieldErrorMessages(error);
      if (fieldErrors.length > 0) {
        fieldErrors.forEach((errorMsg) => {
          toast.error(errorMsg);
        });
        return;
      }
      toast.error(getErrorMessage(error, "Failed to update timeline"));
    }
  };

  // Discard all changes
  const handleDiscardAll = () => {
    setStartDate(originalStartDate);
    setEndDate(originalEndDate);
    setExtraDays(originalExtraDays);
    setOperatorId(originalOperatorId);

    setIsEditing(false);

    toast.info("Changes discarded");
  };

  if (jobLoading) {
    return (
      <DetailFormSection title="Scheduling">
        <p className="text-text-muted py-4 text-center text-sm">Loading…</p>
      </DetailFormSection>
    );
  }

  // Show operator dropdown only for excavation and repair
  const showOperator =
    jobType === JobType.EXCAVATION || jobType === JobType.REPAIR;

  const sectionActions = (
    <DetailViewEditActions
      canEdit={!disabled}
      editAriaLabel="Edit scheduling"
      editLabel="Edit"
      isEditing={isEditing}
      isSaving={patchJob.isPending}
      saveLabel="Save"
      size={ComponentSizeEnum.SM}
      onCancel={handleDiscardAll}
      onEdit={handleEdit}
      onSave={handleSaveAll}
    />
  );

  return (
    <DetailFormSection
      actions={sectionActions}
      description="Operator assignment and job timeline."
      title="Scheduling"
    >
      <div className="overflow-visible">
        <div className="flex flex-col gap-6 overflow-visible xl:flex-row">
          {/* Operator Name Section */}
          {showOperator && (
            <>
              <div className="flex-1">
                <Label variant="sectionCompact">Operator Information</Label>
                <Label
                  className="mb-2 block text-sm font-medium"
                  htmlFor="operator"
                >
                  Operator Name
                </Label>
                <Dropdown
                  fullWidth
                  disabled={
                    disabled || patchJob.isPending || !isEditing || teamLoading
                  }
                  label="Operator name"
                  options={operatorOptions}
                  placeholder="Select operator…"
                  value={resolveOperatorDropdownValue(operatorId)}
                  onChange={(value) => setOperatorId(value)}
                />
              </div>
              {/* Vertical Divider */}
              <div className="bg-border hidden w-px self-stretch xl:block" />
            </>
          )}

          {/* Timeline Section */}
          <div
            className={`flex-1 ${
              showOperator ? "" : "w-full"
            } overflow-visible`}
          >
            <Label variant="sectionCompact">Timeline</Label>
            <div className="relative grid grid-cols-1 gap-4 overflow-visible sm:grid-cols-2 xl:grid-cols-4">
              <div className="relative z-10 space-y-2 overflow-visible">
                <Label htmlFor="start-date" variant="field">
                  Start Date
                </Label>
                <div
                  className={
                    !isEditing && !disabled && !patchJob.isPending
                      ? "relative z-10 cursor-pointer overflow-visible"
                      : "relative z-10 overflow-visible"
                  }
                  onClick={() => {
                    if (!isEditing && !disabled && !patchJob.isPending) {
                      setIsEditing(true);
                    }
                  }}
                >
                  <SanitizedInput
                    className="relative z-10 w-full max-w-full min-w-[12rem]"
                    disabled={disabled || patchJob.isPending || !isEditing}
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="relative z-10 space-y-2 overflow-visible">
                <Label htmlFor="end-date" variant="field">
                  End Date
                </Label>
                <div
                  className={
                    !isEditing && !disabled && !patchJob.isPending
                      ? "relative z-10 cursor-pointer overflow-visible"
                      : "relative z-10 overflow-visible"
                  }
                  onClick={() => {
                    if (!isEditing && !disabled && !patchJob.isPending) {
                      setIsEditing(true);
                    }
                  }}
                >
                  <SanitizedInput
                    className="relative z-10 w-full max-w-full min-w-[12rem]"
                    disabled={disabled || patchJob.isPending || !isEditing}
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="extra-days" variant="field">
                  Extra Days
                </Label>
                <SanitizedInput
                  className="w-full whitespace-nowrap"
                  disabled={disabled || patchJob.isPending || !isEditing}
                  id="extra-days"
                  min="0"
                  placeholder="0"
                  type="number"
                  value={extraDays}
                  onChange={(e) => setExtraDays(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total-days" variant="field">
                  Completed Days
                </Label>
                <SanitizedInput
                  disabled
                  readOnly
                  className="bg-bg-surface w-full whitespace-nowrap"
                  id="total-days"
                  placeholder="0"
                  type="number"
                  value={job?.total_days?.toString() || ""}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DetailFormSection>
  );
}
