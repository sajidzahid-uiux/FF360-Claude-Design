import type { QueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constants";

type OrgId = string | null | undefined;

export function invalidateCalendarQueries(
  queryClient: QueryClient,
  orgId: OrgId
): void {
  if (!orgId) return;
  void queryClient.invalidateQueries({
    queryKey: [QUERY_KEYS.CALENDAR_ITEMS, orgId],
  });
  void queryClient.invalidateQueries({
    queryKey: [QUERY_KEYS.CALENDAR_STATISTICS, orgId],
  });
  void queryClient.invalidateQueries({
    queryKey: [QUERY_KEYS.CALENDAR_UNSCHEDULED, orgId],
  });
}
