import { useEffect, useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { VendorFormsService } from "@/api/services";
import type {
  CanProceedResponse,
  PipeDropPayload,
  VendorFormListParams,
  VendorFormV2,
} from "@/api/types";
import { CACHE_TIME } from "@/constants";

import { useRouteIds } from "../useRouteIds";

export const useVendorFormsV2 = (
  params: VendorFormListParams = {},
  enabled: boolean = true
) => {
  const { orgId: organizationId } = useRouteIds();

  const queryKey = useMemo(
    () => ["vendorFormsV2", organizationId, params],
    [organizationId, params]
  );

  const vendorFormsQuery = useQuery<VendorFormV2[]>({
    queryKey,
    queryFn: () => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return VendorFormsService.getVendorForms(organizationId, params);
    },
    enabled: !!organizationId && enabled,
    placeholderData: (previousData) => previousData,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });

  return {
    ...vendorFormsQuery,
    vendorForms: vendorFormsQuery.data || [],
  };
};

export type UseVendorFormOptions = {
  /** Override default refetch-on-mount (e.g. "always" for log pages after in-wizard updates). */
  refetchOnMount?: boolean | "always";
};

export const useVendorForm = (
  vendorFormId: number | string | null,
  enabled: boolean = true,
  options?: UseVendorFormOptions
) => {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<VendorFormV2>({
    queryKey: ["vendorFormV2", organizationId, vendorFormId],
    queryFn: () => {
      if (!organizationId || !vendorFormId) {
        throw new Error("Organization ID and Vendor Form ID are required");
      }
      return VendorFormsService.getVendorForm(organizationId, vendorFormId);
    },
    enabled: !!organizationId && !!vendorFormId && enabled,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
    ...(options?.refetchOnMount !== undefined && {
      refetchOnMount: options.refetchOnMount,
    }),
  });
};

export const useVendorFormForOrderPipeView = (
  vendorFormId: number | string | null,
  enabled: boolean = true
) => {
  const vendorFormQuery = useVendorForm(vendorFormId, enabled);
  const refetch = vendorFormQuery.refetch;

  useEffect(() => {
    if (!vendorFormId || !enabled) return;
    refetch();
    // Intentionally depend only on refetch (stable). Including vendorFormQuery
    // would cause a loop: refetch updates query state → new object → effect re-runs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorFormId, enabled, refetch]);

  return vendorFormQuery;
};

export const usePipeDropPayload = (
  vendorFormId: number | string | null,
  enabled: boolean = true
) => {
  const { orgId: organizationId } = useRouteIds();

  const pipeDropQuery = useQuery<PipeDropPayload>({
    queryKey: ["pipeDropPayload", organizationId, vendorFormId],
    queryFn: () => {
      if (!organizationId || !vendorFormId) {
        throw new Error("Organization ID and Vendor Form ID are required");
      }
      return VendorFormsService.getPipeDropPayload(
        organizationId,
        vendorFormId
      );
    },
    enabled: !!organizationId && !!vendorFormId && enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: CACHE_TIME.STALE,
  });

  return {
    ...pipeDropQuery,
    orderItems: pipeDropQuery.data?.order_items || [],
    remainedOrderedItems: pipeDropQuery.data?.remained_ordered_items || [],
    deliveryLocations: pipeDropQuery.data?.delivery_locations || [],
  };
};

export const useCanProceed = (
  vendorFormId: number | string | null,
  enabled: boolean = true
) => {
  const { orgId: organizationId } = useRouteIds();

  const canProceedQuery = useQuery<CanProceedResponse>({
    queryKey: ["canProceed", organizationId, vendorFormId],
    queryFn: () => {
      if (!organizationId || !vendorFormId) {
        throw new Error("Organization ID and Vendor Form ID are required");
      }
      return VendorFormsService.getCanProceed(organizationId, vendorFormId);
    },
    enabled: !!organizationId && !!vendorFormId && enabled,
    staleTime: 1 * 60 * 1000,
    gcTime: 2 * 60 * 1000,
  });

  return {
    ...canProceedQuery,
    canProceed: canProceedQuery.data?.can_proceed ?? false,
    message: canProceedQuery.data?.message ?? null,
  };
};

export const useDeliveryLocation = (
  vendorFormId: number | string | null,
  locationId: number | string | null,
  enabled: boolean = true
) => {
  const { orgId: organizationId } = useRouteIds();

  return useQuery({
    queryKey: ["deliveryLocation", organizationId, vendorFormId, locationId],
    queryFn: () => {
      if (!organizationId || !vendorFormId || !locationId) {
        throw new Error(
          "Organization ID, Vendor Form ID, and Location ID are required"
        );
      }
      return VendorFormsService.getDeliveryLocation(
        organizationId,
        vendorFormId,
        locationId
      );
    },
    enabled: !!organizationId && !!vendorFormId && !!locationId && enabled,
    staleTime: 0,
  });
};
