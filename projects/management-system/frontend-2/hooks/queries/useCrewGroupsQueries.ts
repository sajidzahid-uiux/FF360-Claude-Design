import { useQuery } from "@tanstack/react-query";

import { CrewService } from "@/api/services";
import type {
  AvailableMembersResponse,
  CrewGroupDetail,
  CrewGroupListItem,
} from "@/api/types";
import { CACHE_TIME } from "@/constants";

import { useRouteIds } from "../useRouteIds";

export const useCrewGroupsList = () => {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<CrewGroupListItem[]>({
    queryKey: ["crew-groups-list", organizationId],
    queryFn: () => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return CrewService.getCrewGroupsList(organizationId);
    },
    enabled: !!organizationId,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
};

export const useAllCrewGroups = () => {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<CrewGroupDetail[]>({
    queryKey: ["crew-groups", organizationId],
    queryFn: () => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return CrewService.getCrewGroups(organizationId);
    },
    enabled: !!organizationId,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
};

export const useCrewGroupById = (crewGroupId: string | number) => {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<CrewGroupDetail>({
    queryKey: ["crew-group", crewGroupId, organizationId],
    queryFn: () => {
      if (!organizationId || !crewGroupId) {
        throw new Error("Organization ID and Crew Group ID are required");
      }
      return CrewService.getCrewGroup(organizationId, crewGroupId);
    },
    enabled: !!organizationId && !!crewGroupId,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
};

export const useAvailableMembers = (
  crewGroupId: string | number,
  search?: string
) => {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<AvailableMembersResponse>({
    queryKey: [
      "crew-group",
      "available_members",
      crewGroupId,
      organizationId,
      search,
    ],
    queryFn: () => {
      if (!organizationId || !crewGroupId) {
        throw new Error("Organization ID and Crew Group ID are required");
      }
      return CrewService.getAvailableMembers(
        organizationId,
        crewGroupId,
        search
      );
    },
    enabled: !!organizationId && !!crewGroupId,
    staleTime: 2 * 60 * 1000,
    gcTime: CACHE_TIME.GC,
  });
};

export const useActiveCrewGroups = () => {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<CrewGroupDetail[]>({
    queryKey: ["crew-groups", "active", organizationId],
    queryFn: () => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return CrewService.getActiveCrewGroups(organizationId);
    },
    enabled: !!organizationId,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
};
