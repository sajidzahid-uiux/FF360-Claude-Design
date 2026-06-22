import { useMemo } from "react";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { JobsService } from "@/api/services/jobsService";
import type { Job, JobListParams } from "@/api/types";
import { CACHE_TIME, QUERY_KEYS } from "@/constants";
import { useJobAssignedToQueryParam } from "@/features/jobs/model/job-assigned-to-filter-store";

import { useRouteIds } from "../useRouteIds";

export interface UseAllJobsQueryParams extends JobListParams {
  /** When true, fetches from the completed-cancelled endpoint instead of jobs/all. */
  completedPage?: boolean;
}

interface UseAllJobsQueryArgs {
  params?: UseAllJobsQueryParams;
  enabled?: boolean;
}

function normalizeListParams(
  params: UseAllJobsQueryParams,
  assignedFromCtx: string | undefined
): JobListParams {
  // eslint-disable-next-line unused-imports/no-unused-vars
  const { completedPage: _completedPage, ...apiParams } = params;
  const processed: JobListParams = { ...apiParams };

  if (processed.job_type && Array.isArray(processed.job_type)) {
    processed.job_type = processed.job_type.join(",");
  }

  if (assignedFromCtx !== undefined && processed.assigned_to === undefined) {
    processed.assigned_to = assignedFromCtx;
  }

  return processed;
}

export function useAllJobsQuery({
  params = {},
  enabled = true,
}: UseAllJobsQueryArgs = {}) {
  const { orgId: organizationId } = useRouteIds();
  const assignedFromCtx = useJobAssignedToQueryParam();
  const completedPage = params.completedPage === true;

  const listParams = useMemo(
    () => normalizeListParams(params, assignedFromCtx),
    [params, assignedFromCtx]
  );

  const queryKey = useMemo(
    () =>
      [
        QUERY_KEYS.ALL_JOBS,
        organizationId,
        listParams,
        completedPage,
        assignedFromCtx,
      ] as const,
    [organizationId, listParams, completedPage, assignedFromCtx]
  );

  return useQuery<Job[]>({
    queryKey,
    queryFn: async () => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      if (completedPage) {
        return JobsService.getCompletedCancelledJobs(
          organizationId,
          listParams
        );
      }
      return JobsService.getAllJobs(organizationId, listParams);
    },
    enabled: !!organizationId && enabled,
    placeholderData: keepPreviousData,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
}
