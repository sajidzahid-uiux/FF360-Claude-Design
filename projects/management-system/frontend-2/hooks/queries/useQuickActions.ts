import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { QuickActionsService } from "@/api/services";
import type {
  QuickAction,
  QuickActionContactLookupResponse,
  QuickActionListParams,
} from "@/api/types";
import { CACHE_TIME } from "@/constants";

import { useRouteIds } from "../useRouteIds";

// ============================================
// QUERY KEY FACTORY
// ============================================

export const QUICK_ACTIONS_QUERY_KEY = "quickActions";

export const quickActionsKeys = {
  all: (orgId: string) => [QUICK_ACTIONS_QUERY_KEY, orgId] as const,
  list: (orgId: string, params: QuickActionListParams) =>
    [QUICK_ACTIONS_QUERY_KEY, orgId, "list", params] as const,
  detail: (orgId: string, id: number | string) =>
    [QUICK_ACTIONS_QUERY_KEY, orgId, "detail", id] as const,
  contactLookup: (orgId: string, quickActionId: number | string) =>
    [QUICK_ACTIONS_QUERY_KEY, orgId, "contactLookup", quickActionId] as const,
};

// ============================================
// LIST HOOK
// ============================================

export const useQuickActions = (
  params: QuickActionListParams = {},
  enabled: boolean = true
) => {
  const { orgId: organizationId } = useRouteIds();

  const queryKey = useMemo(
    () => quickActionsKeys.list(organizationId ?? "", params),
    [organizationId, params]
  );

  const query = useQuery<QuickAction[]>({
    queryKey,
    queryFn: async () => {
      if (!organizationId) throw new Error("Organization ID is required");
      return QuickActionsService.getQuickActions(organizationId, params);
    },
    enabled: !!organizationId && enabled,
    placeholderData: (previousData) => previousData,
    staleTime: CACHE_TIME.DEFAULT,
  });

  return {
    ...query,
    quickActionCount: query.data?.length ?? 0,
  };
};

// ============================================
// SINGLE ITEM HOOK
// ============================================

export const useQuickAction = (
  id: number | string | undefined,
  enabled: boolean = true
) => {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<QuickAction>({
    queryKey: quickActionsKeys.detail(organizationId ?? "", id ?? ""),
    queryFn: async () => {
      if (!organizationId) throw new Error("Organization ID is required");
      if (!id) throw new Error("Quick action ID is required");
      return QuickActionsService.getQuickAction(organizationId, id);
    },
    enabled: !!organizationId && !!id && enabled,
    staleTime: 60 * 1000,
  });
};

// ============================================
// CONTACT LOOKUP (for convert-to-contact)
// ============================================

export const useQuickActionContactLookup = (
  quickActionId: number | string | undefined,
  enabled: boolean
) => {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<QuickActionContactLookupResponse>({
    queryKey: quickActionsKeys.contactLookup(
      organizationId ?? "",
      quickActionId ?? ""
    ),
    queryFn: async () => {
      if (!organizationId) throw new Error("Organization ID is required");
      if (quickActionId == null) throw new Error("Quick action ID is required");
      return QuickActionsService.contactLookup(organizationId, quickActionId);
    },
    enabled: !!organizationId && quickActionId != null && enabled,
    staleTime: 0,
  });
};
