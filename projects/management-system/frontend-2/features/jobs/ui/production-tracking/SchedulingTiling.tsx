"use client";

import { useEffect, useState } from "react";

import { ComponentSizeEnum, Toggle } from "@fieldflow360/org-ui";
import { toast } from "sonner";

import type { JobUpdatePayload } from "@/api/types";
import { JobType } from "@/constants";
import { getApiFieldErrorMessages, getErrorMessage } from "@/features/forms";
import { usePatchJob } from "@/hooks/mutations";
import { useJobById } from "@/hooks/queries";
import { parseEntityId } from "@/shared/lib/parseEntityId";
import { DetailFormSection, DetailViewEditActions } from "@/shared/ui/common";
import { Label, SanitizedInput } from "@/shared/ui/primitives";

interface SchedulingTilingProps {
  jobId: string | number;
  disabled?: boolean;
  /** Locks only the timeline (dates / extra days); project status uses `disabled`. */
  timelineDisabled?: boolean;
  isTrashed?: boolean;
}

export default function SchedulingTiling({
  jobId,
  disabled = false,
  timelineDisabled = disabled,
  isTrashed = false,
}: SchedulingTilingProps) {
  const { data: job, isLoading: jobLoading } = useJobById(
    jobId,
    JobType.TILING,
    false,
    isTrashed
  );
  const patchJob = usePatchJob();

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [extraDays, setExtraDays] = useState<string>("");

  // Project Status states
  const [compCamProject, setCompCamProject] = useState<boolean>(false);
  const [locateCompleted, setLocateCompleted] = useState<boolean>(false);
  const [topoCompleted, setTopoCompleted] = useState<boolean>(false);
  const [locateExpireDate, setLocateExpireDate] = useState<string>("");

  // Single edit mode state
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isEditingProjectStatus, setIsEditingProjectStatus] =
    useState<boolean>(false);

  // Track original values for discard
  const [originalStartDate, setOriginalStartDate] = useState<string>("");
  const [originalEndDate, setOriginalEndDate] = useState<string>("");
  const [originalExtraDays, setOriginalExtraDays] = useState<string>("");
  const [originalCompCamProject, setOriginalCompCamProject] =
    useState<boolean>(false);
  const [originalLocateCompleted, setOriginalLocateCompleted] =
    useState<boolean>(false);
  const [originalTopoCompleted, setOriginalTopoCompleted] =
    useState<boolean>(false);
  const [originalLocateExpireDate, setOriginalLocateExpireDate] =
    useState<string>("");

  // Initialize form values from job data
  useEffect(() => {
    if (job) {
      const start = job.start_date || "";
      const end = job.end_date || "";
      const extra = job.extra_days?.toString() || "";

      setStartDate(start);
      setEndDate(end);
      setExtraDays(extra);

      setOriginalStartDate(start);
      setOriginalEndDate(end);
      setOriginalExtraDays(extra);

      // Project Status
      const compCam = job.comp_cam_project || false;
      const locate = job.locate_completed || false;
      const topo = job.topo_completed || false;
      const expireDate = job.locate_expire_date || "";

      setCompCamProject(compCam);
      setLocateCompleted(locate);
      setTopoCompleted(topo);
      setLocateExpireDate(expireDate);

      setOriginalCompCamProject(compCam);
      setOriginalLocateCompleted(locate);
      setOriginalTopoCompleted(topo);
      setOriginalLocateExpireDate(expireDate);

      // Reset edit modes
      setIsEditing(false);
      setIsEditingProjectStatus(false);
    }
  }, [job]);

  // Handle edit mode toggle
  const handleEdit = () => {
    setIsEditing(true);
  };

  // Handle project status edit mode toggle
  const handleEditProjectStatus = () => {
    setIsEditingProjectStatus(true);
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

    if (!hasChanges) {
      toast.info("No changes to save");
      return;
    }

    try {
      await patchJob.mutateAsync({
        id: parseEntityId(jobId),
        updatedJob,
        jobType: JobType.TILING,
      });
      toast.success("Timeline updated successfully");

      // Update original values
      setOriginalStartDate(startDate);
      setOriginalEndDate(endDate);
      setOriginalExtraDays(extraDays);

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

    setIsEditing(false);

    toast.info("Changes discarded");
  };

  // Save project status changes
  const handleSaveProjectStatus = async () => {
    // Validate date if it is set
    if (locateExpireDate && locateExpireDate.length !== 10) {
      toast.error("Please select a complete locate expire date");
      return;
    }

    const updatedJob: JobUpdatePayload = {};
    let hasChanges = false;

    if (compCamProject !== originalCompCamProject) {
      updatedJob.comp_cam_project = compCamProject;
      hasChanges = true;
    }
    if (locateCompleted !== originalLocateCompleted) {
      updatedJob.locate_completed = locateCompleted;
      hasChanges = true;
    }
    if (topoCompleted !== originalTopoCompleted) {
      updatedJob.topo_completed = topoCompleted;
      hasChanges = true;
    }
    if (locateExpireDate !== originalLocateExpireDate) {
      updatedJob.locate_expire_date = locateExpireDate || null;
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
        jobType: JobType.TILING,
      });
      toast.success("Project status updated successfully");

      // Update original values
      setOriginalCompCamProject(compCamProject);
      setOriginalLocateCompleted(locateCompleted);
      setOriginalTopoCompleted(topoCompleted);
      setOriginalLocateExpireDate(locateExpireDate);

      // Exit edit mode
      setIsEditingProjectStatus(false);
    } catch (error: unknown) {
      const fieldErrors = getApiFieldErrorMessages(error);
      if (fieldErrors.length > 0) {
        fieldErrors.forEach((errorMsg) => {
          toast.error(errorMsg);
        });
        return;
      }

      toast.error(getErrorMessage(error, "Failed to update project status"));
    }
  };

  // Discard project status changes
  const handleDiscardProjectStatus = () => {
    setCompCamProject(originalCompCamProject);
    setLocateCompleted(originalLocateCompleted);
    setTopoCompleted(originalTopoCompleted);
    setLocateExpireDate(originalLocateExpireDate);

    setIsEditingProjectStatus(false);

    toast.info("Changes discarded");
  };

  if (jobLoading) {
    return (
      <DetailFormSection title="Scheduling">
        <p className="text-text-muted py-4 text-center text-sm">Loading…</p>
      </DetailFormSection>
    );
  }

  return (
    <DetailFormSection
      description="Timeline, project status, and production metrics."
      title="Scheduling"
    >
      <div className="flex flex-wrap gap-6 overflow-visible">
        {/* Timeline Section */}
        <div className="min-w-[18rem] flex-1 overflow-visible">
          <div className="mb-2 flex items-center justify-between">
            <Label variant="section">Timeline</Label>
            <div className="flex gap-2">
              <DetailViewEditActions
                canEdit={!timelineDisabled}
                editAriaLabel="Edit timeline"
                editLabel="Edit"
                isEditing={isEditing}
                isSaving={patchJob.isPending}
                saveLabel="Save"
                size={ComponentSizeEnum.SM}
                onCancel={handleDiscardAll}
                onEdit={handleEdit}
                onSave={handleSaveAll}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="relative z-10 space-y-2 overflow-visible">
              <Label htmlFor="start-date" variant="field">
                Start Date
              </Label>
                <div
                  className={
                    !isEditing && !timelineDisabled && !patchJob.isPending
                      ? "relative z-10 cursor-pointer overflow-visible"
                      : "relative z-10 overflow-visible"
                  }
                  onClick={() => {
                    if (
                      !isEditing &&
                      !timelineDisabled &&
                      !patchJob.isPending
                    ) {
                      setIsEditing(true);
                    }
                  }}
                >
                  <SanitizedInput
                    className="relative z-10 w-full max-w-full min-w-[12rem]"
                    disabled={
                      timelineDisabled || patchJob.isPending || !isEditing
                    }
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
                    !isEditing && !timelineDisabled && !patchJob.isPending
                      ? "relative z-10 cursor-pointer overflow-visible"
                      : "relative z-10 overflow-visible"
                  }
                  onClick={() => {
                    if (
                      !isEditing &&
                      !timelineDisabled &&
                      !patchJob.isPending
                    ) {
                      setIsEditing(true);
                    }
                  }}
                >
                  <SanitizedInput
                    className="relative z-10 w-full max-w-full min-w-[12rem]"
                    disabled={
                      timelineDisabled || patchJob.isPending || !isEditing
                    }
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
                disabled={timelineDisabled || patchJob.isPending || !isEditing}
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

        {/* Project Status Section */}
        <div className="min-w-[15rem] flex-1">
          <div className="mb-4 flex items-center justify-between">
            <Label variant="section">Project Status</Label>
            <div className="flex gap-2">
              <DetailViewEditActions
                canEdit={!disabled}
                editAriaLabel="Edit project status"
                editLabel="Edit"
                isEditing={isEditingProjectStatus}
                isSaving={patchJob.isPending}
                saveLabel="Save"
                size={ComponentSizeEnum.SM}
                onCancel={handleDiscardProjectStatus}
                onEdit={handleEditProjectStatus}
                onSave={handleSaveProjectStatus}
              />
            </div>
          </div>
          <div className="space-y-4">
            {/* Comp Cam Project Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="comp-cam-project" variant="field">
                Comp Cam Project
              </Label>
              <Toggle
                aria-label="Comp Cam Project"
                checked={compCamProject}
                disabled={
                  disabled || patchJob.isPending || !isEditingProjectStatus
                }
                onChange={setCompCamProject}
              />
            </div>

            {/* Locate Completed Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="locate-completed" variant="field">
                Locate Completed
              </Label>
              <Toggle
                aria-label="Locate Completed"
                checked={locateCompleted}
                disabled={
                  disabled || patchJob.isPending || !isEditingProjectStatus
                }
                onChange={setLocateCompleted}
              />
            </div>

            {/* Topo Completed Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="topo-completed" variant="field">
                Topo Completed
              </Label>
              <Toggle
                aria-label="Topo Completed"
                checked={topoCompleted}
                disabled={
                  disabled || patchJob.isPending || !isEditingProjectStatus
                }
                onChange={setTopoCompleted}
              />
            </div>

            {/* Locate Expire Date */}
            <div className="space-y-2">
              <Label htmlFor="locate-expire-date" variant="field">
                Locate Expire Date
              </Label>
              <div
                className={
                  !isEditingProjectStatus && !disabled && !patchJob.isPending
                    ? "relative z-10 cursor-pointer overflow-visible"
                    : "relative z-10 overflow-visible"
                }
                onClick={() => {
                  if (
                    !isEditingProjectStatus &&
                    !disabled &&
                    !patchJob.isPending
                  ) {
                    setIsEditingProjectStatus(true);
                  }
                }}
              >
                <SanitizedInput
                  className="relative z-10 w-full max-w-full min-w-[12rem]"
                  disabled={
                    disabled || patchJob.isPending || !isEditingProjectStatus
                  }
                  id="locate-expire-date"
                  type="date"
                  value={locateExpireDate}
                  onChange={(e) => setLocateExpireDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Production Metrics Section */}
        <div className="min-w-[18rem] flex-1">
          <Label variant="sectionBlock">Production Metrics</Label>
          <div className="space-y-4">
            {/* First Row: Main Footage Ran and Lateral Footage Ran */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="main-footage-ran" variant="field">
                  Main Footage Ran
                </Label>
                <SanitizedInput
                  disabled
                  readOnly
                  className="bg-bg-surface w-full"
                  id="main-footage-ran"
                  type="number"
                  value={job?.main_footage_ran?.toFixed(2) || "0.00"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lateral-footage-ran" variant="field">
                  Lateral Footage Ran
                </Label>
                <SanitizedInput
                  disabled
                  readOnly
                  className="bg-bg-surface w-full"
                  id="lateral-footage-ran"
                  type="number"
                  value={job?.lateral_footage_ran?.toFixed(2) || "0.00"}
                />
              </div>
            </div>

            {/* Second Row: Target Feet/Day */}
            <div className="space-y-2">
              <Label htmlFor="target-feet-per-day" variant="field">
                Target Feet/Day
              </Label>
              <SanitizedInput
                disabled
                readOnly
                className="bg-bg-surface w-full"
                id="target-feet-per-day"
                type="number"
                value={
                  job?.target_feet_per_day !== null &&
                  job?.target_feet_per_day !== undefined
                    ? job.target_feet_per_day.toFixed(2)
                    : job?.job_footage && job?.total_days && job.total_days > 0
                      ? (job.job_footage / job.total_days).toFixed(2)
                      : "0.00"
                }
              />
            </div>

            {/* Third Row: Remained Raisers Installed */}
            <div className="space-y-2">
              <Label htmlFor="remained-raisers" variant="field">
                Remained Raisers Installed
              </Label>
              <SanitizedInput
                disabled
                readOnly
                className="bg-bg-surface w-full"
                id="remained-raisers"
                type="number"
                value={
                  job?.remained_raisers_installed !== null &&
                  job?.remained_raisers_installed !== undefined
                    ? job.remained_raisers_installed.toString()
                    : ""
                }
              />
            </div>
          </div>
        </div>
      </div>
    </DetailFormSection>
  );
}
