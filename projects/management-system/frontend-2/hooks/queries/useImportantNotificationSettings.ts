import { useQuery } from "@tanstack/react-query";

import { NotificationSettingsService } from "@/api/services";
import type { ImportantNotificationSetting } from "@/api/types";
import { CACHE_TIME, QUERY_KEYS } from "@/constants";

import { useRouteIds } from "../useRouteIds";

/**
 * Fetches the current user's Important notification settings.
 * Used on the user preference / notification settings page.
 */
export function useImportantNotificationSettings() {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<ImportantNotificationSetting[]>({
    queryKey: [QUERY_KEYS.NOTIFICATION_SETTINGS_IMPORTANT, organizationId],
    queryFn: () => {
      if (!organizationId) throw new Error("Organization ID is required");
      return NotificationSettingsService.getImportantNotificationSettings(
        organizationId
      );
    },
    enabled: !!organizationId,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
}
