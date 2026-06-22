import { useQuery } from "@tanstack/react-query";

import { ActivityLogsService } from "@/api/services";
import type { JobActivityLogModule } from "@/constants";

import { useRouteIds } from "../useRouteIds";
import { ACTIVITY_LOGS_QUERY_KEY } from "./activityLogsQueryKeys";

const DEFAULT_PAGE_SIZE = 100;

export type { JobActivityLogModule as JobActivityLogsModule };

/**
 * Activity logs for a job. Use `module="co_ca"` for completed/cancelled jobs
 * so logs match the Completed/Cancelled jobs view (see `jobActivityLogApiModule`).
 */
export function useJobActivityLogs(
  jobId: string | undefined,
  module: JobActivityLogModule,
  options?: { enabled?: boolean }
) {
  const { orgId } = useRouteIds();
  const entityId =
    jobId != null && /^\d+$/.test(String(jobId).trim())
      ? String(jobId).trim()
      : undefined;

  const enabled = options?.enabled ?? true;

  return useQuery({
    queryKey: [ACTIVITY_LOGS_QUERY_KEY, orgId, module, entityId],
    queryFn: async () => {
      return ActivityLogsService.listActivityLogs(orgId!, {
        module,
        entity_id: entityId!,
        page: 1,
        page_size: DEFAULT_PAGE_SIZE,
      });
    },
    enabled: Boolean(orgId && entityId && enabled),
    staleTime: 0,
    refetchOnMount: "always",
  });
}
