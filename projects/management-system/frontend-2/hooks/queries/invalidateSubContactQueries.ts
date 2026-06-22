import type { QueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constants/enums";

/** Invalidate all sub-contact list queries (e.g. after deleting a linked standard contact). */
export function invalidateAllSubContactQueries(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SUB_CONTACTS] });
}

/** Invalidate list, detail, and sub-contact queries after sub-contact link/unlink. */
export function invalidateSubContactQueriesForParent(
  queryClient: QueryClient,
  organizationId: string,
  parentContactId: number
): void {
  void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CONTACTS] });
  void queryClient.invalidateQueries({
    queryKey: [QUERY_KEYS.CONTACT, organizationId, parentContactId],
  });
  void queryClient.invalidateQueries({
    queryKey: [QUERY_KEYS.SUB_CONTACTS, organizationId, parentContactId],
  });
  void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOB_HISTORY] });
}
