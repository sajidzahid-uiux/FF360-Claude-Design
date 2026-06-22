import { useQuery } from "@tanstack/react-query";

import { StatusesService } from "@/api/services";
import type { OrganizationJobStatus } from "@/api/types";
import { CACHE_TIME, QUERY_KEYS } from "@/constants";

import { useRouteIds } from "../useRouteIds";

interface UseJobStatusesQueryArgs {
  jobType?: string;
  enabled?: boolean;
}

export function useJobStatusesQuery({
  jobType,
  enabled = true,
}: UseJobStatusesQueryArgs = {}) {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<OrganizationJobStatus[]>({
    queryKey: [
      QUERY_KEYS.JOB_STATUSES,
      organizationId,
      jobType ?? null,
    ] as const,
    queryFn: () => {
      if (!organizationId) throw new Error("Organization ID is required");
      return StatusesService.getJobStatuses(organizationId, jobType) as Promise<
        OrganizationJobStatus[]
      >;
    },
    enabled: enabled && !!organizationId,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
}
