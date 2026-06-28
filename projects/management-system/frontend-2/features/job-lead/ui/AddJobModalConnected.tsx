"use client";

import { useCallback } from "react";

import type { Status } from "@/api/types";
import { JobLeadTypeSegment } from "@/constants";
import { getLeadCreateErrorMessage } from "@/features/forms";
import { useOrganizationStatuses } from "@/hooks";
import {
  useCreateDrainageTilingJob,
  useCreateExcavationJob,
  useCreateRepairJob,
} from "@/hooks/mutations";
import { toast } from "sonner";

import { useModalStack } from "@/shared/model/use-modal-stack";

import type { JobCreateSubmitValues } from "../model/jobLeadForm";
import {
  JOB_ROUTE_CONFIGS,
  createJobLeadFormProps,
} from "../model/jobLeadRouteConfig";
import { JobLeadForm } from "./JobLeadForm";

const MODAL_KEY = "add-job";

type JobListFormValues = JobCreateSubmitValues & {
  designers?: number[];
  crew?: number[];
};

function pickJobMutation(
  segment: JobLeadTypeSegment | undefined,
  mutations: {
    tiling: ReturnType<typeof useCreateDrainageTilingJob>;
    excavation: ReturnType<typeof useCreateExcavationJob>;
    repair: ReturnType<typeof useCreateRepairJob>;
  }
) {
  if (segment === JobLeadTypeSegment.EXCAVATION) return mutations.excavation;
  if (segment === JobLeadTypeSegment.REPAIR) return mutations.repair;
  return mutations.tiling;
}

/**
 * Self-contained "Add Job" modal driven by the URL stack (`?modal=add-job`).
 * Rendered globally so the global "+" button can open it over ANY module
 * without navigating to the jobs page. Type is chosen inside the modal; an
 * optional frame param `type` preselects it.
 */
export function AddJobModalConnected() {
  const { stack, closeModalKey } = useModalStack();
  const frame = stack.find((f) => f.key === MODAL_KEY);
  const open = Boolean(frame);
  const preselected = frame?.params.type as JobLeadTypeSegment | undefined;

  const baseConfig =
    JOB_ROUTE_CONFIGS[preselected ?? JobLeadTypeSegment.TILING] ??
    JOB_ROUTE_CONFIGS[JobLeadTypeSegment.TILING];

  const { data: statusTypes } = useOrganizationStatuses({
    jobType: baseConfig.apiType,
  });
  const createTilingJob = useCreateDrainageTilingJob();
  const createExcavationJob = useCreateExcavationJob();
  const createRepairJob = useCreateRepairJob();

  const isSubmitting =
    createTilingJob.isPending ||
    createExcavationJob.isPending ||
    createRepairJob.isPending;

  const handleSubmit = useCallback(
    async (values: JobListFormValues) => {
      try {
        const newStatus =
          statusTypes?.find((status: Status) =>
            status.title.toLowerCase().includes("new")
          ) ??
          statusTypes?.[0] ??
          null;

        const jobData = {
          description: values.description || "",
          job_status: newStatus?.id ?? 1,
          project_type: values.projectTypeId,
          equipments: values.equipments || [],
          designers: values.designers || [],
          crew: values.crew || [],
          acers: values.acre ? parseFloat(values.acre) : undefined,
          contact: parseInt(values.selectedContact),
          farm_info: null,
          latitude: values.latitude,
          longitude: values.longitude,
          vertices: values.vertices,
        };

        const payload = values.selectedFarm
          ? { ...jobData, farm: parseInt(values.selectedFarm) }
          : jobData;

        const mutation = pickJobMutation(preselected, {
          tiling: createTilingJob,
          excavation: createExcavationJob,
          repair: createRepairJob,
        });
        await mutation.mutateAsync(payload);

        closeModalKey(MODAL_KEY);
      } catch (error: unknown) {
        toast.error(getLeadCreateErrorMessage(error, "Failed to create job"));
      }
    },
    [
      closeModalKey,
      createExcavationJob,
      createRepairJob,
      createTilingJob,
      preselected,
      statusTypes,
    ]
  );

  if (!open) return null;

  const formProps = createJobLeadFormProps(baseConfig).props;

  return (
    <JobLeadForm
      {...formProps}
      isOpen={open}
      isSubmitting={isSubmitting}
      requireTypeSelection={!preselected}
      onCancel={() => closeModalKey(MODAL_KEY)}
      onOpenChange={(next) => {
        if (!next) closeModalKey(MODAL_KEY);
      }}
      onSubmit={handleSubmit}
    />
  );
}
