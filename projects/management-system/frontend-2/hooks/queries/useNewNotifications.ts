import { useQuery } from "@tanstack/react-query";

import { NewNotificationsService } from "@/api/services";
import type {
  NewNotificationItem,
  NewNotificationsPaginatedResponse,
  NewNotificationsParams,
} from "@/api/types";
import { isPaginatedResponse } from "@/api/types";
import { CACHE_TIME, QUERY_KEYS } from "@/constants";
import { getCookie } from "@/lib/cookies";
import {
  SHELL_BADGE_REFETCH_MS,
  refetchIntervalWhenVisible,
} from "@/shared/lib";

import { useRouteIds } from "../useRouteIds";

export interface NewNotificationsQueryResult {
  items: NewNotificationItem[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}

/**
 * Fetches new notifications for the current user. Supports pagination, search, and unread filter.
 * Backend returns date_group and display_date for grouping (Today, Last 7 Days, Older).
 */
export function useNewNotifications(params: NewNotificationsParams = {}) {
  const { orgId: orgFromRoute } = useRouteIds();
  const orgId = orgFromRoute || getCookie("lastOrgId") || null;
  const organizationId = orgId ?? undefined;

  return useQuery({
    queryKey: [QUERY_KEYS.NEW_NOTIFICATIONS, organizationId, params],
    queryFn: async (): Promise<NewNotificationsQueryResult> => {
      if (!organizationId) throw new Error("Organization ID is required");
      const response = await NewNotificationsService.getList(
        organizationId,
        params
      );
      if (isPaginatedResponse(response)) {
        const r = response as NewNotificationsPaginatedResponse;
        return {
          items: r.results,
          totalCount: r.total_count,
          pageSize: r.page_size,
          currentPage: r.current_page,
          totalPages: r.total_pages,
        };
      }
      const list = response as NewNotificationItem[];
      return {
        items: list,
        totalCount: list.length,
        pageSize: list.length,
        currentPage: 1,
        totalPages: 1,
      };
    },
    enabled: !!organizationId,
    staleTime: CACHE_TIME.STALE,
    refetchInterval: () => refetchIntervalWhenVisible(SHELL_BADGE_REFETCH_MS),
    gcTime: CACHE_TIME.GC,
  });
}
