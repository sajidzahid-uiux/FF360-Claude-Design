import { useQuery } from "@tanstack/react-query";

import { ActivityLogsService } from "@/api/services";
import { ActivityLogModule } from "@/constants";

import { useRouteIds } from "../useRouteIds";
import { ACTIVITY_LOGS_QUERY_KEY } from "./activityLogsQueryKeys";

const DEFAULT_PAGE_SIZE = 100;

/**
 * Activity logs for order pipes / vendor forms (`module=orderpipe`).
 * `entity_id` is the vendor form (order pipe) id.
 */
export function useOrderPipeActivityLogs(orderPipeId: string | undefined) {
  const { orgId } = useRouteIds();
  const entityId =
    orderPipeId != null && /^\d+$/.test(String(orderPipeId).trim())
      ? String(orderPipeId).trim()
      : undefined;

  return useQuery({
    queryKey: [
      ACTIVITY_LOGS_QUERY_KEY,
      orgId,
      ActivityLogModule.ORDER_PIPE,
      entityId,
    ],
    queryFn: async () => {
      return ActivityLogsService.listActivityLogs(orgId!, {
        module: ActivityLogModule.ORDER_PIPE,
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
