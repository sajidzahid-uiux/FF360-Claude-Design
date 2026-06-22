import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { LeadsService } from "@/api/services/leadsService";
import type {
  CorePoint,
  CorePointListParams,
  Lead,
  LeadListParams,
  PaginatedResponse,
} from "@/api/types";
import { CACHE_TIME, QUERY_KEYS } from "@/constants";
import { LeadType } from "@/constants/enums";

import { useRouteIds } from "../useRouteIds";

export function useLeadsList(
  params: LeadListParams = {},
  enabled: boolean = true
) {
  const { orgId: organizationId } = useRouteIds();

  const queryKey = useMemo(
    () => [QUERY_KEYS.LEADS, organizationId, params],
    [organizationId, params]
  );

  return useQuery<PaginatedResponse<Lead> | Lead[]>({
    queryKey,
    queryFn: async () => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return LeadsService.getLeads(organizationId, params);
    },
    enabled: !!organizationId && enabled,
    placeholderData: (previousData) => previousData,
    staleTime: params.sort_by ? 0 : CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
}

export function useLeadsByType(
  leadType: LeadType,
  leadParams: LeadListParams = {}
) {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<Lead[]>({
    queryKey: [QUERY_KEYS.LEADS, leadType, organizationId, leadParams],
    queryFn: async () => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return LeadsService.getLeadsByType(organizationId, leadType, leadParams);
    },
    enabled: !!organizationId,
  });
}

export function useLeadById(
  leadId: string | number,
  leadType: LeadType,
  isArchived: boolean = false
) {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<Lead>({
    queryKey: ["lead", leadId, leadType, isArchived],
    queryFn: async () => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return LeadsService.getLead(organizationId, leadType, leadId, isArchived);
    },
    enabled: !!organizationId && !!leadId,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
}

export function useLeadCorePoints(
  leadId: string | number,
  params: CorePointListParams = {}
) {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<PaginatedResponse<CorePoint> | CorePoint[]>({
    queryKey: [
      QUERY_KEYS.CORE_POINTS,
      QUERY_KEYS.LEADS,
      organizationId,
      leadId,
      params,
    ],
    queryFn: async () => {
      if (!organizationId || !leadId) {
        throw new Error("Organization ID and Lead ID are required");
      }
      return LeadsService.getCorePoints(organizationId, leadId, params);
    },
    enabled: !!organizationId && !!leadId,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
}

export function useLeadCorePointById(
  leadId: string | number,
  coreId: string | number
) {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<CorePoint>({
    queryKey: ["corePoint", QUERY_KEYS.LEADS, organizationId, leadId, coreId],
    queryFn: async () => {
      if (!organizationId || !leadId || !coreId) {
        throw new Error(
          "Organization ID, Lead ID, and Core Point ID are required"
        );
      }
      return LeadsService.getCorePoint(organizationId, leadId, coreId);
    },
    enabled: !!organizationId && !!leadId && !!coreId,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
}
