import { useQuery } from "@tanstack/react-query";

import { ActivityLogsService } from "@/api/services";
import { ActivityLogModule } from "@/constants";

import { useRouteIds } from "../useRouteIds";
import { ACTIVITY_LOGS_QUERY_KEY } from "./activityLogsQueryKeys";

const DEFAULT_PAGE_SIZE = 100;

/**
 * Activity logs for leads (`module=lead`). Works for active and archived leads
 * (same `entity_id`; lead detail is loaded separately with `archived` as needed).
 */
export function useLeadActivityLogs(leadId: string | undefined) {
  const { orgId } = useRouteIds();
  const entityId =
    leadId != null && /^\d+$/.test(String(leadId).trim())
      ? String(leadId).trim()
      : undefined;

  return useQuery({
    queryKey: [
      ACTIVITY_LOGS_QUERY_KEY,
      orgId,
      ActivityLogModule.LEAD,
      entityId,
    ],
    queryFn: async () => {
      return ActivityLogsService.listActivityLogs(orgId!, {
        module: ActivityLogModule.LEAD,
        entity_id: entityId!,
        page: 1,
        page_size: DEFAULT_PAGE_SIZE,
      });
    },
    enabled: Boolean(orgId && entityId),
    staleTime: 0,
    refetchOnMount: "always",
  });
}
