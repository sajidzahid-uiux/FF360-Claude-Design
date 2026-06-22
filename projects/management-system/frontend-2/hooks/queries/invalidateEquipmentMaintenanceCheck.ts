import type { QueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constants/enums";

/** Sidebar maintenance equipment type counts. */
export function invalidateActiveEquipmentCounts(
  queryClient: QueryClient
): void {
  void queryClient.invalidateQueries({
    queryKey: [QUERY_KEYS.ACTIVE_EQUIPMENT_COUNTS],
  });
}

/** On-site tracking equipment maintenance badges (`equipmentUntilUpdate`). */
export function invalidateEquipmentMaintenanceChecks(
  queryClient: QueryClient
): void {
  void queryClient.invalidateQueries({
    queryKey: [QUERY_KEYS.EQUIPMENT_MAINTENANCE_CHECK],
  });
  invalidateActiveEquipmentCounts(queryClient);
}
