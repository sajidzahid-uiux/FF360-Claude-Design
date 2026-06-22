import { useQuery } from "@tanstack/react-query";

import { StatusesService } from "@/api/services";
import type { LeadTypeInfo } from "@/api/types";
import { CACHE_TIME, QUERY_KEYS } from "@/constants";

import { useRouteIds } from "../useRouteIds";

interface UseLeadTypesQueryArgs {
  enabled?: boolean;
}

export function useLeadTypesQuery({
  enabled = true,
}: UseLeadTypesQueryArgs = {}) {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<LeadTypeInfo[]>({
    queryKey: [QUERY_KEYS.LEAD_TYPES, organizationId] as const,
    queryFn: () => {
      if (!organizationId) throw new Error("Organization ID is required");
      return StatusesService.getLeadTypes(organizationId);
    },
    enabled: enabled && !!organizationId,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
}
