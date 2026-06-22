import { useQuery } from "@tanstack/react-query";

import { StatusesService } from "@/api/services/statusesService";
import type { OrganizationLeadStatusSetting } from "@/api/types";
import { CACHE_TIME, QUERY_KEYS } from "@/constants";

import { useRouteIds } from "../useRouteIds";

interface UseLeadStatusesSettingsQueryArgs {
  enabled?: boolean;
}

export function useLeadStatusesSettingsQuery({
  enabled = true,
}: UseLeadStatusesSettingsQueryArgs = {}) {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<OrganizationLeadStatusSetting[]>({
    queryKey: [QUERY_KEYS.LEAD_STATUSES, "settings", organizationId] as const,
    queryFn: () => {
      if (!organizationId) throw new Error("Organization ID is required");
      return StatusesService.getLeadStatusesSettings(organizationId);
    },
    enabled: enabled && !!organizationId,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
}
