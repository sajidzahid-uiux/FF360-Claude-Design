import { useQuery } from "@tanstack/react-query";

import { StatusesService } from "@/api/services";
import type { LeadStatus } from "@/api/types";
import { CACHE_TIME, QUERY_KEYS } from "@/constants";

import { useRouteIds } from "../useRouteIds";

interface UseLeadStatusesQueryArgs {
  enabled?: boolean;
}

export function useLeadStatusesQuery({
  enabled = true,
}: UseLeadStatusesQueryArgs = {}) {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<LeadStatus[]>({
    queryKey: [QUERY_KEYS.LEAD_STATUSES, organizationId] as const,
    queryFn: () => {
      if (!organizationId) throw new Error("Organization ID is required");
      return StatusesService.getLeadStatuses(organizationId);
    },
    enabled: enabled && !!organizationId,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
}
