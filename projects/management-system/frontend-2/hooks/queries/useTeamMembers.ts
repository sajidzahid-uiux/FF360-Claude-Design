import { useQuery } from "@tanstack/react-query";

import { TeamService } from "@/api/services";
import type { TeamMember } from "@/api/types";
import { CACHE_TIME, QUERY_KEYS } from "@/constants";

import { useOrgAuthenticatedQueryEnabled } from "../useOrgAuthenticatedQueryEnabled";
import { useRouteIds } from "../useRouteIds";

/**
 * Query hook for fetching all team members
 * Follows FSD pattern and uses TeamService for API calls
 */
export const useTeamMembers = () => {
  const { orgId: organizationId } = useRouteIds();
  const canQuery = useOrgAuthenticatedQueryEnabled(organizationId);

  return useQuery<TeamMember[]>({
    queryKey: [QUERY_KEYS.TEAM_MEMBERS, organizationId],
    queryFn: () => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return TeamService.getMembers(organizationId);
    },
    enabled: canQuery,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
};

/**
 * Query hook for fetching a single team member
 * Follows FSD pattern and uses TeamService for API calls
 */
export const useTeamMember = (memberId: number | string | null) => {
  const { orgId: organizationId } = useRouteIds();
  const canQuery = useOrgAuthenticatedQueryEnabled(organizationId);

  return useQuery<TeamMember>({
    queryKey: [QUERY_KEYS.TEAM_MEMBERS, organizationId, memberId],
    queryFn: () => {
      if (!organizationId || !memberId) {
        throw new Error("Organization ID and Member ID are required");
      }
      return TeamService.getMember(organizationId, memberId);
    },
    enabled: canQuery && !!memberId,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
};
