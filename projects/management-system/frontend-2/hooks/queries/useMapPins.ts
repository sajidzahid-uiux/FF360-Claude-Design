import { useQuery } from "@tanstack/react-query";

import { MapService } from "@/api/services";
import type { MapPin, PaginatedResponse } from "@/api/types";
import { JobLeadEntityType } from "@/constants";

import { useRouteIds } from "../useRouteIds";
import { MAP_PINS_QUERY_KEY } from "./mapQueryKeys";

type MapPinsParams = {
  page?: number;
  page_size?: number;
};

function createMapPinsQueryHook(resource: JobLeadEntityType) {
  return (id: string | number, params: MapPinsParams = {}) => {
    const { orgId: organizationId } = useRouteIds();

    return useQuery<PaginatedResponse<MapPin> | MapPin[]>({
      queryKey: [MAP_PINS_QUERY_KEY, resource, organizationId, id, params],
      queryFn: () => {
        if (!organizationId || !id) {
          throw new Error("Organization ID and resource ID are required");
        }

        return MapService.getPins(organizationId, resource, id, params);
      },
      enabled: !!organizationId && !!id,
    });
  };
}

const useJobPinsQuery = createMapPinsQueryHook(JobLeadEntityType.JOBS);
const useLeadPinsQuery = createMapPinsQueryHook(JobLeadEntityType.LEADS);

export const useJobPins = useJobPinsQuery;
export const useLeadPins = useLeadPinsQuery;
