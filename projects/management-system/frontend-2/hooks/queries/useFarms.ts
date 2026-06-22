import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { ContactsService } from "@/api/services";
import type { Farm } from "@/api/types";
import { CACHE_TIME, QUERY_KEYS } from "@/constants";

import { useRouteIds } from "../useRouteIds";

export const useFarms = (contactId: number) => {
  const { orgId: organizationId } = useRouteIds();

  const queryKey = useMemo(
    () => [QUERY_KEYS.FARMS, organizationId, contactId],
    [organizationId, contactId]
  );

  const query = useQuery<Farm[]>({
    queryKey,
    queryFn: () => {
      if (!organizationId) throw new Error("Organization ID is required");
      return ContactsService.getFarms(organizationId, contactId);
    },
    enabled: !!organizationId && !!contactId,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });

  return {
    ...query,
    farms: query.data ?? [],
  };
};

export const useFarm = (contactId: number, farmId: number) => {
  const { orgId: organizationId } = useRouteIds();

  const queryKey = useMemo(
    () => [QUERY_KEYS.FARM, organizationId, contactId, farmId],
    [organizationId, contactId, farmId]
  );

  return useQuery<Farm>({
    queryKey,
    queryFn: () => {
      if (!organizationId) throw new Error("Organization ID is required");
      return ContactsService.getFarm(organizationId, contactId, farmId);
    },
    enabled: !!organizationId && !!contactId && !!farmId,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
};
