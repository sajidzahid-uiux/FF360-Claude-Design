import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { JobsService } from "@/api/services/jobsService";
import type {
  CorePoint,
  CorePointListParams,
  FinancialMachineAssignment,
  Job,
  JobEstimate,
  JobFinancial,
  JobListParams,
  PaginatedResponse,
} from "@/api/types";
import { CACHE_TIME, QUERY_KEYS } from "@/constants";
import { JobType } from "@/constants/enums";
import { useJobAssignedToQueryParam } from "@/features/jobs/model/job-assigned-to-filter-store";

import { useRouteIds } from "../useRouteIds";

export function useJobsList(
  params: JobListParams = {},
  enabled: boolean = true
) {
  const { orgId: organizationId } = useRouteIds();
  const assignedFromCtx = useJobAssignedToQueryParam();
  const assigned_to = params.assigned_to ?? assignedFromCtx;

  const listParams = useMemo(
    () => ({ ...params, assigned_to }),
    [params, assigned_to]
  );

  const queryKey = useMemo(
    () => [QUERY_KEYS.JOBS, organizationId, listParams, assigned_to],
    [organizationId, listParams, assigned_to]
  );

  return useQuery<PaginatedResponse<Job> | Job[]>({
    queryKey,
    queryFn: async () => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return JobsService.getJobs(organizationId, listParams);
    },
    enabled: !!organizationId && enabled,
    placeholderData: (previousData) => previousData,
    staleTime: listParams.sort_by ? 0 : CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
}

export function useJobsByType(jobType: JobType, jobParams: JobListParams = {}) {
  const { orgId: organizationId } = useRouteIds();
  const assignedFromCtx = useJobAssignedToQueryParam();
  const assigned_to = jobParams.assigned_to ?? assignedFromCtx;

  const listParams = useMemo(() => {
    if (!assigned_to || assigned_to === "all") {
      return jobParams;
    }
    return { ...jobParams, assigned_to };
  }, [jobParams, assigned_to]);

  return useQuery<Job[]>({
    queryKey: [QUERY_KEYS.JOBS, jobType, organizationId, listParams],
    queryFn: async () => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return JobsService.getJobsByType(organizationId, jobType, listParams);
    },
    enabled: !!organizationId,
  });
}

export function useJobById(
  jobId: string | number,
  jobType: JobType,
  isArchived: boolean = false,
  isTrashed: boolean = false
) {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<Job>({
    queryKey: ["job", jobId, jobType, isArchived, isTrashed],
    queryFn: async () => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return JobsService.getJob(
        organizationId,
        jobType,
        jobId,
        isArchived,
        isTrashed
      );
    },
    enabled: !!organizationId && !!jobId,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
}

export function useJobEstimate(jobId: string | number, jobType: JobType) {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<JobEstimate>({
    queryKey: ["jobEstimate", organizationId, jobType, jobId],
    queryFn: async () => {
      if (!organizationId || !jobId) {
        throw new Error("Organization ID and Job ID are required");
      }
      return JobsService.getEstimate(organizationId, jobType, jobId);
    },
    enabled: !!organizationId && !!jobId,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
}

export function useJobFinancial(
  jobId: string | number,
  jobType: JobType.TILING | JobType.EXCAVATION
) {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<JobFinancial>({
    queryKey: ["jobFinancial", organizationId, jobType, jobId],
    queryFn: async () => {
      if (!organizationId || !jobId) {
        throw new Error("Organization ID and Job ID are required");
      }
      return JobsService.getJobFinancial(organizationId, jobType, jobId);
    },
    enabled: !!organizationId && !!jobId,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
}

export function useFinancialMachineAssignments(
  jobId: string | number,
  jobType: JobType
) {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<FinancialMachineAssignment[]>({
    queryKey: ["financialMachineAssignments", organizationId, jobType, jobId],
    queryFn: async () => {
      if (!organizationId || !jobId) {
        throw new Error("Organization ID and Job ID are required");
      }
      return JobsService.getFinancialMachineAssignments(
        organizationId,
        jobType,
        jobId
      );
    },
    enabled: !!organizationId && !!jobId,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
}

export function useJobCorePoints(
  jobId: string | number,
  params: CorePointListParams = {}
) {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<PaginatedResponse<CorePoint> | CorePoint[]>({
    queryKey: [
      QUERY_KEYS.CORE_POINTS,
      QUERY_KEYS.JOBS,
      organizationId,
      jobId,
      params,
    ],
    queryFn: async () => {
      if (!organizationId || !jobId) {
        throw new Error("Organization ID and Job ID are required");
      }
      return JobsService.getCorePoints(organizationId, jobId, params);
    },
    enabled: !!organizationId && !!jobId,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
}

export function useJobCorePointById(
  jobId: string | number,
  coreId: string | number
) {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<CorePoint>({
    queryKey: ["corePoint", QUERY_KEYS.JOBS, organizationId, jobId, coreId],
    queryFn: async () => {
      if (!organizationId || !jobId || !coreId) {
        throw new Error(
          "Organization ID, Job ID, and Core Point ID are required"
        );
      }
      return JobsService.getCorePoint(organizationId, jobId, coreId);
    },
    enabled: !!organizationId && !!jobId && !!coreId,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
}
