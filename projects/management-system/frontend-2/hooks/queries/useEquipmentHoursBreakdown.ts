import { useQuery } from "@tanstack/react-query";

import { JobsService } from "@/api/services/jobsService";
import type { EquipmentHoursBreakdown } from "@/api/types";
import { CACHE_TIME } from "@/constants";
import { useRouteIds } from "@/hooks/useRouteIds";

export const equipmentHoursBreakdownQueryKey = (
  organizationId: string | null | undefined,
  jobId: number | string | undefined
) => ["equipmentHoursBreakdown", organizationId, jobId] as const;

export function useEquipmentHoursBreakdown(
  jobId: number | string | undefined,
  enabled = true
) {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<EquipmentHoursBreakdown>({
    queryKey: equipmentHoursBreakdownQueryKey(organizationId, jobId),
    queryFn: async () => {
      if (!organizationId || jobId == null) {
        throw new Error("Organization ID and job ID are required");
      }
      return JobsService.getEquipmentHoursBreakdown(organizationId, jobId);
    },
    enabled: enabled && !!organizationId && jobId != null,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
}
