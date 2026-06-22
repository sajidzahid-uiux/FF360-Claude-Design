import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { MapService } from "@/api/services";
import type { MapDataApiResult, MapDataParams } from "@/api/types";
import { CACHE_TIME } from "@/constants";
import { useJobAssignedToQueryParam } from "@/features/jobs/model/job-assigned-to-filter-store";

import { useRouteIds } from "../useRouteIds";
import { MAP_DATA_V2_QUERY_KEY } from "./mapQueryKeys";

export type UseMapDataV2Options = {
  /** When `false`, the query does not run (e.g. map tab not showing jobs/leads). */
  queryEnabled?: boolean;
};

export const useMapDataV2 = (
  params: MapDataParams = {},
  options: UseMapDataV2Options = {}
) => {
  const { orgId: organizationId } = useRouteIds();
  const assignedFromCtx = useJobAssignedToQueryParam();

  const requestParams = useMemo<MapDataParams>(() => {
    const assignedTo = params.assigned_to ?? assignedFromCtx;
    return {
      ...params,
      assigned_to:
        assignedTo !== undefined && assignedTo !== "" ? assignedTo : "all",
    };
  }, [assignedFromCtx, params]);

  const queryKey = useMemo(
    () => [MAP_DATA_V2_QUERY_KEY, organizationId, params, assignedFromCtx],
    [assignedFromCtx, organizationId, params]
  );

  return useQuery<MapDataApiResult>({
    queryKey,
    queryFn: ({ signal }) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }

      return MapService.getMapData(organizationId, requestParams, { signal });
    },
    enabled: !!organizationId && options.queryEnabled !== false,
    staleTime: CACHE_TIME.DEFAULT,
    gcTime: CACHE_TIME.STALE,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
  });
};
