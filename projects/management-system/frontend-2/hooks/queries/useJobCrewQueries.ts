import { useQuery } from "@tanstack/react-query";

import { CrewService } from "@/api/services";
import type {
  CrewGroup,
  IndividualMember,
  JobTeamListResponse,
} from "@/api/types";
import { CACHE_TIME } from "@/constants";

import { useRouteIds } from "../useRouteIds";

export const useAvailableCrewGroups = (jobId: string | number) => {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<CrewGroup[]>({
    queryKey: ["crew", "available_crew_groups", organizationId, jobId],
    queryFn: () => {
      if (!organizationId || !jobId) {
        throw new Error("Organization ID and Job ID are required");
      }
      return CrewService.getAvailableCrewGroupsForJob(organizationId, jobId);
    },
    enabled: !!organizationId && !!jobId,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
};

export const useAvailableIndividuals = (jobId: string | number) => {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<IndividualMember[]>({
    queryKey: ["crew", "available_individuals", organizationId, jobId],
    queryFn: () => {
      if (!organizationId || !jobId) {
        throw new Error("Organization ID and Job ID are required");
      }
      return CrewService.getAvailableIndividualsForJob(organizationId, jobId);
    },
    enabled: !!organizationId && !!jobId,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
};

export const useJobTeamList = (jobId: string | number) => {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<JobTeamListResponse>({
    queryKey: ["crew", "job_team_list", organizationId, jobId],
    queryFn: () => {
      if (!organizationId || !jobId) {
        throw new Error("Organization ID and Job ID are required");
      }
      return CrewService.getJobTeamList(organizationId, jobId);
    },
    enabled: !!organizationId && !!jobId,
    staleTime: 2 * 60 * 1000,
    gcTime: CACHE_TIME.GC,
  });
};
