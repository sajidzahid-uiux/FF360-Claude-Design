/**
 * Hook Factories for ShowMoreCard
 *
 * This file provides factory functions to generate hook configurations
 * for different job/lead types, eliminating ~150 LOC of duplication
 * across config files.
 */
import { toast } from "sonner";

import {
  type ConvertLeadToJobPayload,
  JobId,
  type JobUpdatePayload,
  type LeadUpdatePayload,
  jobTypeToProjectTypeCategory,
} from "@/api/types";
import {
  JobOrLeadType,
  JobType,
  LeadType,
  jobTypeToJobLeadTypeSegment,
} from "@/constants";
import { ResourceType } from "@/constants/enums";
import {
  useConvertLeadToJob,
  useJobComments,
  useJobFiles,
  useLeadComments,
  useLeadFiles,
  usePatchJob,
  usePatchLead,
  useTrashJob,
  useTrashLead,
} from "@/hooks/mutations";
import {
  useJobEstimate,
  useLeadStatuses,
  useOrganizationStatuses,
} from "@/hooks/queries";
import { useRecordEquipment, useRecordFarms } from "@/hooks/useRecordData";
import { parseEntityId } from "@/shared/lib/parseEntityId";

import {
  HookConfig,
  type ShowMoreCardConvertHookResult,
  type ShowMoreCardDeleteHookResult,
  type ShowMoreCardPatchHookResult,
} from "../types";

/**
 * Map JobType to LeadType (they share the same values)
 */
function jobTypeToLeadType(jobType: JobType): LeadType {
  return jobType as unknown as LeadType;
}

/**
 * Create patch adapter for Job entities
 * Wraps the patchJob mutation with the correct jobType
 */
function createJobPatchAdapter(jobType: JobType) {
  return () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const patchJob = usePatchJob();
    return {
      ...patchJob,
      mutateAsync: async ({
        id,
        updatedJob,
        notApproved,
      }: {
        id: JobId;
        updatedJob: JobUpdatePayload;
        notApproved?: boolean;
      }) => {
        const result = await patchJob.mutateAsync({
          id: parseEntityId(id),
          updatedJob,
          jobType: jobType, // Always inject the correct jobType
          ...(notApproved !== undefined ? { notApproved } : {}),
        });
        // Show success toast (consistent with patchLead behavior)
        toast.success("Job updated successfully");
        return result;
      },
    };
  };
}

/**
 * Create delete adapter for Job entities
 * Wraps the trashJob mutation with the correct jobType
 */
function createJobDeleteAdapter(jobType: JobType) {
  return () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const trashJob = useTrashJob();
    return {
      ...trashJob,
      mutateAsync: async ({ id }: { id: JobId }) => {
        return trashJob.mutateAsync({
          id: parseEntityId(id),
          jobType: jobType, // Always inject the correct jobType
        });
      },
    };
  };
}

/**
 * Create hook configuration for Job entities
 *
 * @param jobType - The type of job (TILING, EXCAVATION, REPAIR)
 * @param options - Optional configuration
 * @returns HookConfig for the job type
 */
export function createJobHooks(
  jobType: JobType,
  options?: {
    includeEstimate?: boolean;
  }
): HookConfig {
  const projectTypeCategory =
    jobTypeToProjectTypeCategory(jobType) ?? JobOrLeadType.REPAIR;
  const recordJobType = jobTypeToJobLeadTypeSegment(jobType);

  const hooks: HookConfig = {
    useComments: (id: number, notesTabAccess) =>
      useJobComments(id, jobType, notesTabAccess),
    useFiles: (id: number) => useJobFiles(id, jobType),
    useStatuses: () =>
      useOrganizationStatuses({ jobType: projectTypeCategory }),
    usePatch: createJobPatchAdapter(
      jobType
    ) as () => ShowMoreCardPatchHookResult,
    useDelete: createJobDeleteAdapter(
      jobType
    ) as () => ShowMoreCardDeleteHookResult,
    useFarms: (params: { contactId: number }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useRecordFarms({
        resourceType: ResourceType.JOB,
        jobType: recordJobType,
        contactId: params.contactId,
      });
    },
  };

  // Add estimate hook if needed (for tiling jobs)
  if (options?.includeEstimate) {
    // Must be a properly-named hook for rules-of-hooks
    const useEstimate = (id: JobId) => useJobEstimate(id, jobType);
    hooks.useEstimate = useEstimate;
  }

  return hooks;
}

/**
 * Create patch adapter for Lead entities
 * Wraps the patchLead mutation with the correct leadType
 */
function createLeadPatchAdapter(leadType: LeadType) {
  return () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const patchLead = usePatchLead();
    return {
      ...patchLead,
      mutateAsync: async ({
        id,
        data,
      }: {
        id: number;
        data: LeadUpdatePayload;
      }) => {
        return patchLead.mutateAsync({
          id,
          leadType: leadType,
          updatedLead: data,
        });
      },
    };
  };
}

/**
 * Create delete adapter for Lead entities
 * Wraps the trashLead mutation with the correct leadType
 */
function createLeadDeleteAdapter(leadType: LeadType) {
  return () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const trashLead = useTrashLead();
    return {
      ...trashLead,
      mutateAsync: async ({ id }: { id: number }) => {
        return trashLead.mutateAsync({
          id,
          leadType: leadType,
        });
      },
    };
  };
}

/**
 * Create convertToJob adapter for Lead entities
 * Wraps the convertToJob mutation with the correct leadType
 */
function createLeadConvertAdapter(leadType: LeadType, jobType: JobType) {
  return () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const convertToJob = useConvertLeadToJob();
    return {
      ...convertToJob,
      mutateAsync: async ({
        leadId,
        ...data
      }: {
        leadId: number;
      } & Partial<ConvertLeadToJobPayload>) => {
        // Repair leads need job_type in the request
        const convertRequest = (
          leadType === LeadType.REPAIR ? { job_type: jobType, ...data } : data
        ) as ConvertLeadToJobPayload;

        return convertToJob.mutateAsync({
          id: leadId,
          leadType: leadType,
          convertToJobRequest: convertRequest,
        });
      },
    };
  };
}

/**
 * Create farms hook for Lead entities
 */
function createLeadFarmsHook(jobType: JobType) {
  return (params: { contactId: number }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useRecordFarms({
      resourceType: ResourceType.LEAD,
      jobType: jobTypeToJobLeadTypeSegment(jobType),
      contactId: params.contactId,
    });
  };
}

/**
 * Create equipment hook for Lead entities
 */
function createLeadEquipmentHook(jobType: JobType) {
  return () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useRecordEquipment({
      resourceType: ResourceType.LEAD,
      jobType: jobTypeToJobLeadTypeSegment(jobType),
    });
  };
}

/**
 * Create hook configuration for Lead entities
 *
 * @param jobType - The type of job/lead (TILING, EXCAVATION, REPAIR)
 * @param options - Optional configuration
 * @returns HookConfig for the lead type
 */
export function createLeadHooks(
  jobType: JobType,
  options?: {
    includeEquipment?: boolean;
  }
): HookConfig {
  const leadType = jobTypeToLeadType(jobType);

  const hooks: HookConfig = {
    useComments: (id: number, notesTabAccess) =>
      useLeadComments(id, leadType, notesTabAccess),
    useFiles: (id: number) => useLeadFiles(id, leadType),
    useStatuses: () => useLeadStatuses(),
    usePatch: createLeadPatchAdapter(
      leadType
    ) as () => ShowMoreCardPatchHookResult,
    useDelete: createLeadDeleteAdapter(
      leadType
    ) as () => ShowMoreCardDeleteHookResult,
    useConvertToJob: createLeadConvertAdapter(
      leadType,
      jobType
    ) as () => ShowMoreCardConvertHookResult,
    useFarms: createLeadFarmsHook(jobType),
  };

  // Add equipment hook if needed (for excavation leads)
  if (options?.includeEquipment) {
    hooks.useEquipment = createLeadEquipmentHook(jobType);
  }

  return hooks;
}
