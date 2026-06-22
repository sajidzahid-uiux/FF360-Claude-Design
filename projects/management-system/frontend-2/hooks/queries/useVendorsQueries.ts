import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { VendorsService } from "@/api/services";
import type {
  Vendor,
  VendorFavorite,
  VendorListParams,
  VendorsResponse,
} from "@/api/types";
import { CACHE_TIME } from "@/constants";

import { useRouteIds } from "../useRouteIds";

export const MAX_FAVORITE_VENDORS = 3;

export function normalizeFavoriteVendors(
  data: VendorFavorite[] | Vendor[] | undefined
): {
  records: VendorFavorite[];
  vendors: Vendor[];
} {
  if (!data || !Array.isArray(data)) {
    return { records: [], vendors: [] };
  }
  const first = data[0];
  if (!first) {
    return { records: [], vendors: [] };
  }
  if ("vendor" in first && first.vendor) {
    const records = data as VendorFavorite[];
    return {
      records,
      vendors: records.map((record) => record.vendor),
    };
  }
  const vendors = data as Vendor[];
  const records: VendorFavorite[] = vendors.map((vendor) => ({
    id: (vendor as Vendor & { favorite_id?: number }).favorite_id ?? vendor.id,
    vendor_id: vendor.id,
    vendor,
  }));
  return { records, vendors };
}

export const useVendors = (
  params: VendorListParams = {},
  enabled: boolean = true
) => {
  const { orgId: organizationId } = useRouteIds();

  const queryKey = useMemo(
    () => ["vendors", organizationId, params],
    [organizationId, params]
  );

  const vendorsQuery = useQuery<VendorsResponse>({
    queryKey,
    queryFn: () => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return VendorsService.getVendors(organizationId, params);
    },
    enabled: !!organizationId && enabled,
    placeholderData: (previousData) => previousData,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });

  return {
    ...vendorsQuery,
    vendors: vendorsQuery.data || [],
  };
};

export const useFavoriteVendors = (enabled: boolean = true) => {
  const { orgId: organizationId } = useRouteIds();

  const favoriteVendorsQuery = useQuery<VendorFavorite[] | Vendor[]>({
    queryKey: ["vendors", "favorites", organizationId],
    queryFn: () => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return VendorsService.getFavoriteVendors(organizationId);
    },
    enabled: !!organizationId && enabled,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });

  const { records: favoriteRecords, vendors: favoriteVendors } = useMemo(
    () => normalizeFavoriteVendors(favoriteVendorsQuery.data),
    [favoriteVendorsQuery.data]
  );

  return {
    ...favoriteVendorsQuery,
    favoriteVendors,
    favoriteRecords,
  };
};
