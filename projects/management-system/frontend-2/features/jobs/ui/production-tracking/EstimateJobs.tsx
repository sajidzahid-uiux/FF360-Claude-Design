"use client";

import { useEffect, useState } from "react";

import { ComponentSizeEnum } from "@fieldflow360/org-ui";
import { toast } from "sonner";

import { type Job, type JobEstimate, JobType } from "@/api/types";
import { useUpdateJobEstimate } from "@/hooks/mutations";
import { DetailViewEditActions } from "@/shared/ui/common";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  SanitizedInput,
} from "@/shared/ui/primitives";

interface EstimateJobsProps {
  job: Job;
  jobType: JobType;
  disabled?: boolean;
  estimate?: JobEstimate; // Optional estimate data from hook (for tiling jobs)
}

export default function EstimateJobs({
  job,
  jobType,
  disabled = false,
  estimate,
}: EstimateJobsProps) {
  const updateEstimate = useUpdateJobEstimate();

  // Estimate number state
  const [estimateNumber, setEstimateNumber] = useState<string>("");

  // Edit mode state
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Original value for discard
  const [originalEstimateNumber, setOriginalEstimateNumber] =
    useState<string>("");

  // Initialize form value from estimate hook data (for tiling) or job data (for others)
  useEffect(() => {
    // For tiling jobs, use estimate from hook if available
    if (estimate) {
      const estimateValue = estimate.estimate_number?.toString() || "";
      setEstimateNumber(estimateValue);
      setOriginalEstimateNumber(estimateValue);
      setIsEditing(false);
    } else if (job) {
      // For other job types, use job.estimate_number
      const estimateValue = job.estimate_number?.toString() || "";
      setEstimateNumber(estimateValue);
      setOriginalEstimateNumber(estimateValue);
      setIsEditing(false);
    }
  }, [job, estimate]);

  // Check if there are unsaved changes
  const hasUnsavedChanges = () => {
    return estimateNumber !== originalEstimateNumber;
  };

  // Handle edit
  const handleEdit = () => {
    setIsEditing(true);
  };

  // Handle discard
  const handleDiscard = () => {
    setEstimateNumber(originalEstimateNumber);
    setIsEditing(false);
    toast.info("Changes discarded");
  };

  // Handle save
  const handleSave = async () => {
    if (!hasUnsavedChanges()) {
      toast.info("No changes to save");
      return;
    }

    try {
      await updateEstimate.mutateAsync({
        id: job.id,
        jobType: jobType as JobType,
        estimateNumber: estimateNumber || null,
      });

      // Update original value
      setOriginalEstimateNumber(estimateNumber);
      setIsEditing(false);
    } catch (error: unknown) {
      console.error("Error saving estimate:", error);
      // Error handling is done in the hook
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-semibold">
            Estimate Section
          </CardTitle>
          <div className="flex gap-2">
            <DetailViewEditActions
              canEdit={!disabled}
              editAriaLabel="Edit estimate"
              editLabel="Edit"
              isEditing={isEditing}
              isSaving={updateEstimate.isPending}
              saveLabel="Save"
              size={ComponentSizeEnum.SM}
              onCancel={handleDiscard}
              onEdit={handleEdit}
              onSave={handleSave}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="estimate-number" variant="lg">
            Estimate Job Number
          </Label>
          <SanitizedInput
            className="w-1/4"
            disabled={disabled || updateEstimate.isPending || !isEditing}
            id="estimate-number"
            maxLength={100}
            placeholder="Enter estimate number"
            type="text"
            value={estimateNumber}
            onChange={(e) => setEstimateNumber(e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
