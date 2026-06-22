import { useQuery } from "@tanstack/react-query";

import { ActivityLogsService } from "@/api/services";
import { ActivityLogModule } from "@/constants";

import { useRouteIds } from "../useRouteIds";
import { ACTIVITY_LOGS_QUERY_KEY } from "./activityLogsQueryKeys";

const DEFAULT_PAGE_SIZE = 100;

/**
 * Activity logs for equipment (`module=equipment`).
 * Backend enforces `equipment_page_read` and resource access.
 */
export function useEquipmentActivityLogs(equipmentId: string | undefined) {
  const { orgId } = useRouteIds();
  const entityId =
    equipmentId != null && /^\d+$/.test(String(equipmentId).trim())
      ? String(equipmentId).trim()
      : undefined;

  return useQuery({
    queryKey: [
      ACTIVITY_LOGS_QUERY_KEY,
      orgId,
      ActivityLogModule.EQUIPMENT,
      entityId,
    ],
    queryFn: async () => {
      return ActivityLogsService.listActivityLogs(orgId!, {
        module: ActivityLogModule.EQUIPMENT,
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
