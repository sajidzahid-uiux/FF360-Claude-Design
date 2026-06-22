import { useQuery } from "@tanstack/react-query";

import { ProjectTypesService } from "@/api/services";
import type { ProjectType, ProjectTypeCategory } from "@/api/types";
import { CACHE_TIME, QUERY_KEYS } from "@/constants";

import { useRouteIds } from "../useRouteIds";

interface UseProjectTypesQueryArgs {
  category?: ProjectTypeCategory | null;
  enabled?: boolean;
}

export function useProjectTypesQuery({
  category,
  enabled = true,
}: UseProjectTypesQueryArgs = {}) {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<ProjectType[]>({
    queryKey: [
      QUERY_KEYS.PROJECT_TYPES,
      organizationId,
      category ?? null,
    ] as const,
    queryFn: () => {
      if (!organizationId) throw new Error("Organization ID is required");
      return ProjectTypesService.list(organizationId, category ?? undefined);
    },
    enabled: enabled && !!organizationId,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
}
