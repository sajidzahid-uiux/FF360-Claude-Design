import { useQuery } from "@tanstack/react-query";

import { MapService } from "@/api/services";
import type { MapLegend } from "@/api/types";
import { CACHE_TIME } from "@/constants";

import { useRouteIds } from "../useRouteIds";
import { MAP_LEGENDS_QUERY_KEY } from "./mapQueryKeys";

export const useMapLegends = () => {
  const { orgId: organizationId } = useRouteIds();

  const mapLegendsQuery = useQuery<MapLegend[]>({
    queryKey: [MAP_LEGENDS_QUERY_KEY, organizationId],
    queryFn: () => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }

      return MapService.getMapLegends(organizationId);
    },
    enabled: !!organizationId,
    placeholderData: (previousData) => previousData,
    staleTime: CACHE_TIME.GC,
    gcTime: CACHE_TIME.LONG,
    retry: 3,
    retryDelay: 1000,
  });

  return {
    ...mapLegendsQuery,
    data: mapLegendsQuery.data ?? [],
  };
};
