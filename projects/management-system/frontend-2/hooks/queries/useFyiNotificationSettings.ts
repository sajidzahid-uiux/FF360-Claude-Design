import { useQuery } from "@tanstack/react-query";

import { NotificationSettingsService } from "@/api/services";
import type { FyiNotificationSetting } from "@/api/types";
import { CACHE_TIME, QUERY_KEYS } from "@/constants";

import { useRouteIds } from "../useRouteIds";

/**
 * Fetches the organization's FYI notification settings (assigned users per event).
 * Used on the org preferences page.
 */
export function useFyiNotificationSettings() {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<FyiNotificationSetting[]>({
    queryKey: [QUERY_KEYS.NOTIFICATION_SETTINGS_FYI, organizationId],
    queryFn: () => {
      if (!organizationId) throw new Error("Organization ID is required");
      return NotificationSettingsService.getFyiNotificationSettings(
        organizationId
      );
    },
    enabled: !!organizationId,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
}
