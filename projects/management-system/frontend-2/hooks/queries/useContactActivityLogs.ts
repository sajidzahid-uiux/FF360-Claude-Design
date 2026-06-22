import { useQuery } from "@tanstack/react-query";

import { ActivityLogsService } from "@/api/services";
import { ActivityLogModule } from "@/constants";

import { useRouteIds } from "../useRouteIds";
import { ACTIVITY_LOGS_QUERY_KEY } from "./activityLogsQueryKeys";

const DEFAULT_PAGE_SIZE = 100;

/**
 * Activity logs for contacts (`module=contact`).
 * Backend enforces `contact_access_read` and org contact scope.
 */
export function useContactActivityLogs(contactId: string | undefined) {
  const { orgId } = useRouteIds();
  const entityId =
    contactId != null && /^\d+$/.test(String(contactId).trim())
      ? String(contactId).trim()
      : undefined;

  return useQuery({
    queryKey: [
      ACTIVITY_LOGS_QUERY_KEY,
      orgId,
      ActivityLogModule.CONTACT,
      entityId,
    ],
    queryFn: async () => {
      return ActivityLogsService.listActivityLogs(orgId!, {
        module: ActivityLogModule.CONTACT,
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
