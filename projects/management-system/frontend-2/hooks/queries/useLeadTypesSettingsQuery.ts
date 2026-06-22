import { useQuery } from "@tanstack/react-query";

import { StatusesService } from "@/api/services/statusesService";
import type { OrganizationLeadTypeSetting } from "@/api/types";
import { CACHE_TIME, QUERY_KEYS } from "@/constants";

import { useRouteIds } from "../useRouteIds";

interface UseLeadTypesSettingsQueryArgs {
  enabled?: boolean;
}

export function useLeadTypesSettingsQuery({
  enabled = true,
}: UseLeadTypesSettingsQueryArgs = {}) {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<OrganizationLeadTypeSetting[]>({
    queryKey: [QUERY_KEYS.LEAD_TYPES, "settings", organizationId] as const,
    queryFn: () => {
      if (!organizationId) throw new Error("Organization ID is required");
      return StatusesService.getLeadTypesSettings(organizationId);
    },
    enabled: enabled && !!organizationId,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
}
