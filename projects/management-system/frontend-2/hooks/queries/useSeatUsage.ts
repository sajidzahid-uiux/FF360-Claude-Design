import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";
import { CACHE_TIME, QUERY_KEYS } from "@/constants";

import { useRouteIds } from "../useRouteIds";

export interface SeatUsageResponse {
  total_seats: number;
  used_seats: number;
  /** Invited members not yet accepted; count toward seat limit. */
  pending_invites?: number;
  available_seats: number;
}

export const useSeatUsage = (enabled = true) => {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<SeatUsageResponse>({
    queryKey: [QUERY_KEYS.SEAT_USAGE, organizationId],
    queryFn: () => {
      if (!organizationId) throw new Error("Organization ID is required");
      return apiClient.get<SeatUsageResponse>(
        API_ENDPOINTS.organizations.seatUsage(organizationId)
      );
    },
    enabled: !!organizationId && enabled,
    staleTime: CACHE_TIME.REAL_TIME,
  });
};
