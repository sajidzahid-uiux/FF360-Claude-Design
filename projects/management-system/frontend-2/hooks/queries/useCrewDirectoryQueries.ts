import { useQuery } from "@tanstack/react-query";

import { CrewService } from "@/api/services";
import type { CrewDirectoryMember, CrewDirectoryResponse } from "@/api/types";
import { CACHE_TIME } from "@/constants";

import { useRouteIds } from "../useRouteIds";

export const useCrewDirectoryList = (
  search?: string,
  filter?: "assigned" | "unassigned"
) => {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<CrewDirectoryResponse>({
    queryKey: ["crew-directory", organizationId, search, filter],
    queryFn: () => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return CrewService.getCrewDirectory(organizationId, search, filter);
    },
    enabled: !!organizationId,
    staleTime: 2 * 60 * 1000,
    gcTime: CACHE_TIME.GC,
  });
};

export const useCrewMemberById = (memberId: string | number) => {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<CrewDirectoryMember>({
    queryKey: ["crew-member", memberId, organizationId],
    queryFn: () => {
      if (!organizationId || !memberId) {
        throw new Error("Organization ID and Member ID are required");
      }
      return CrewService.getCrewDirectoryMember(organizationId, memberId);
    },
    enabled: !!organizationId && !!memberId,
    staleTime: 2 * 60 * 1000,
    gcTime: CACHE_TIME.GC,
  });
};
