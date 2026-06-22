import { useQuery } from "@tanstack/react-query";

import { StatusesService } from "@/api/services/statusesService";
import type { OrganizationJobStatus } from "@/api/types";
import { CACHE_TIME, QUERY_KEYS } from "@/constants";

import { useRouteIds } from "../useRouteIds";

interface UseJobStatusesSettingsQueryArgs {
  jobType?: string;
  enabled?: boolean;
}

export function useJobStatusesSettingsQuery({
  jobType,
  enabled = true,
}: UseJobStatusesSettingsQueryArgs = {}) {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<OrganizationJobStatus[]>({
    queryKey: [
      QUERY_KEYS.JOB_STATUSES,
      "settings",
      organizationId,
      jobType ?? null,
    ] as const,
    queryFn: () => {
      if (!organizationId) throw new Error("Organization ID is required");
      return StatusesService.getJobStatusesSettings(organizationId, jobType);
    },
    enabled: enabled && !!organizationId,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
}
