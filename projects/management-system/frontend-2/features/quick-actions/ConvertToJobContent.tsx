"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Dropdown } from "@fieldflow360/org-ui";

import {
  type QuickAction,
  type QuickActionConvertToJobPayload,
  type QuickActionFarmSelectOption,
  jobTypeToProjectTypeCategory,
} from "@/api/types";
import {
  JOB_TYPE_LABELS,
  JobLeadTypeSegment,
  apiJobTypeToJobLeadTypeSegment,
} from "@/constants";
import type { ConvertModalRegistration } from "@/features/quick-actions/model/convertModalRegistration";
import { useProjectTypesQuery } from "@/hooks/queries";

import { QuickActionConvertBase } from "./QuickActionConvertBase";

export type { QuickActionFarmSelectOption as FarmOption };

export function ConvertToJobContent({
  farms = [],
  quickAction,
  onConvertJob,
  registerModal,
}: {
  quickAction: QuickAction;
  onConvertJob: (payload: QuickActionConvertToJobPayload) => void;
  farms?: QuickActionFarmSelectOption[];
  registerModal?: (config: ConvertModalRegistration | null) => void;
}) {
  const [jobType, setJobType] = useState("");
  const [projectTypeId, setProjectTypeId] = useState("");
  const [projectTypeError, setProjectTypeError] = useState("");
  const [description, setDescription] = useState(quickAction.description ?? "");
  const [selectedFarmId, setSelectedFarmId] = useState<number | undefined>();

  const jobTypeOptions = useMemo(
    () =>
      Object.entries(JOB_TYPE_LABELS).map(([value, label]) => ({
        value,
        label,
      })),
    []
  );

  const projectCategory = useMemo(
    () => jobTypeToProjectTypeCategory(jobType),
    [jobType]
  );

  const { data: projectTypes = [], isFetching: projectTypesLoading } =
    useProjectTypesQuery({
      category: projectCategory,
      enabled: projectCategory != null,
    });

  const projectTypeOptions = useMemo(
    () => projectTypes.map((pt) => ({ value: String(pt.id), label: pt.name })),
    [projectTypes]
  );

  const projectTypePlaceholder = !jobType
    ? "Select a job type first"
    : projectTypesLoading
      ? "Loading project types…"
      : "Select project type";

  const projectTypeHelperText = projectTypeError
    ? undefined
    : jobType && !projectTypeId
      ? "Select a project type to continue. This will be saved on the new job."
      : jobType && !projectTypesLoading && projectTypes.length === 0
        ? "No project types are configured for this job type. Add project types in organization settings, then try again."
        : undefined;

  useEffect(() => {
    setProjectTypeId("");
    setProjectTypeError("");
  }, [jobType]);

  const files = quickAction.files ?? [];

  const isValid = Boolean(jobType && projectTypeId);

  const handleSubmit = useCallback(() => {
    setProjectTypeError("");
    if (!jobType) {
      return;
    }
    if (!projectTypeId) {
      setProjectTypeError("Please select a project type to continue.");
      return;
    }
    if (!/^\d+$/.test(projectTypeId.trim())) {
      setProjectTypeError("Please select a valid project type.");
      return;
    }
    const payload: QuickActionConvertToJobPayload = {
      job_type:
        apiJobTypeToJobLeadTypeSegment(jobType) ?? JobLeadTypeSegment.REPAIR,
      project_type: projectTypeId.trim(),
      ...(description.trim() ? { description: description.trim() } : {}),
      ...(selectedFarmId != null ? { farm_id: selectedFarmId } : {}),
    };
    onConvertJob(payload);
  }, [description, jobType, onConvertJob, projectTypeId, selectedFarmId]);

  useEffect(() => {
    registerModal?.({
      submit: handleSubmit,
      submitDisabled: !isValid,
      submitLabel: "Convert",
    });
  }, [handleSubmit, isValid, registerModal]);

  return (
    <QuickActionConvertBase
      description={description}
      farms={farms}
      files={files}
      selectedFarmId={selectedFarmId}
      onDescriptionChange={setDescription}
      onSelectFarm={setSelectedFarmId}
    >
      <h3 className="text-sm font-semibold">Job Information</h3>
      <Dropdown
        fullWidth
        label="Job Type *"
        options={jobTypeOptions}
        placeholder="Job Type"
        value={jobType || undefined}
        onChange={(value) => {
          setJobType(value);
          setProjectTypeError("");
        }}
      />
      <Dropdown
        fullWidth
        disabled={!jobType || projectTypesLoading}
        error={projectTypeError}
        helperText={projectTypeHelperText}
        label="Project type *"
        options={projectTypeOptions}
        placeholder={projectTypePlaceholder}
        value={projectTypeId || undefined}
        onChange={(value) => {
          setProjectTypeId(value);
          setProjectTypeError("");
        }}
      />
    </QuickActionConvertBase>
  );
}
