import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { MapService } from "@/api/services/mapService";
import type { PaginatedResponse } from "@/api/types";
import type {
  MapPinCategory,
  MapPinCategoryListParams,
} from "@/api/types/mapPinCategory";
import { CACHE_TIME } from "@/constants";

import { useRouteIds } from "../useRouteIds";
import { MAP_PIN_CATEGORIES_QUERY_KEY } from "./mapQueryKeys";

export interface UseMapPinCategoriesOptions {
  params?: MapPinCategoryListParams;
  useSettingsPrefix?: boolean;
}

function normalizePinCategories(
  data: PaginatedResponse<MapPinCategory> | MapPinCategory[] | undefined
): MapPinCategory[] {
  if (!data) return [];
  return Array.isArray(data) ? data : (data.results ?? []);
}

export const useMapPinCategories = ({
  params,
  useSettingsPrefix = false,
}: UseMapPinCategoriesOptions = {}) => {
  const { orgId: organizationId } = useRouteIds();

  const queryKey = useMemo(
    () => [
      MAP_PIN_CATEGORIES_QUERY_KEY,
      organizationId,
      useSettingsPrefix,
      params?.search ?? "",
      params?.page ?? "",
      params?.page_size ?? "",
    ],
    [
      organizationId,
      useSettingsPrefix,
      params?.search,
      params?.page,
      params?.page_size,
    ]
  );

  const query = useQuery({
    queryKey,
    queryFn: () => {
      if (!organizationId) throw new Error("Organization ID is required");
      return MapService.getPinCategories(
        organizationId,
        params,
        useSettingsPrefix
      );
    },
    enabled: !!organizationId,
    staleTime: CACHE_TIME.LONG,
    gcTime: CACHE_TIME.GC,
  });

  const categories = useMemo(
    () => normalizePinCategories(query.data),
    [query.data]
  );

  return {
    ...query,
    categories,
  };
};
