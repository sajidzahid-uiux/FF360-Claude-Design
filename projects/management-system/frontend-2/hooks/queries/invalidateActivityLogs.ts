import type { QueryClient } from "@tanstack/react-query";

import { ActivityLogModule } from "@/constants";

import { ACTIVITY_LOGS_QUERY_KEY } from "./activityLogsQueryKeys";

type OrgId = string | null | undefined;

function normalizeEntityId(
  id: string | number | undefined | null
): string | undefined {
  if (id == null) return undefined;
  const s = String(id).trim();
  return /^\d+$/.test(s) ? s : undefined;
}

/** Refetches all activity-log queries for the org (use when the affected entity id is unknown). */
export function invalidateAllActivityLogsForOrg(
  queryClient: QueryClient,
  orgId: OrgId
): void {
  if (!orgId) return;
  void queryClient.invalidateQueries({
    queryKey: [ACTIVITY_LOGS_QUERY_KEY, orgId],
  });
}

export function invalidateJobActivityLogs(
  queryClient: QueryClient,
  orgId: OrgId,
  jobId: string | number | undefined | null
): void {
  const eid = normalizeEntityId(jobId);
  if (!orgId || !eid) return;
  void queryClient.invalidateQueries({
    queryKey: [ACTIVITY_LOGS_QUERY_KEY, orgId, ActivityLogModule.JOB, eid],
  });
  void queryClient.invalidateQueries({
    queryKey: [
      ACTIVITY_LOGS_QUERY_KEY,
      orgId,
      ActivityLogModule.COMPLETED_CANCELED,
      eid,
    ],
  });
}

export function invalidateLeadActivityLogs(
  queryClient: QueryClient,
  orgId: OrgId,
  leadId: string | number | undefined | null
): void {
  const eid = normalizeEntityId(leadId);
  if (!orgId || !eid) return;
  void queryClient.invalidateQueries({
    queryKey: [ACTIVITY_LOGS_QUERY_KEY, orgId, ActivityLogModule.LEAD, eid],
  });
}

export function invalidateContactActivityLogs(
  queryClient: QueryClient,
  orgId: OrgId,
  contactId: string | number | undefined | null
): void {
  const eid = normalizeEntityId(contactId);
  if (!orgId || !eid) return;
  void queryClient.invalidateQueries({
    queryKey: [ACTIVITY_LOGS_QUERY_KEY, orgId, ActivityLogModule.CONTACT, eid],
  });
}

export function invalidateEquipmentActivityLogs(
  queryClient: QueryClient,
  orgId: OrgId,
  equipmentId: string | number | undefined | null
): void {
  const eid = normalizeEntityId(equipmentId);
  if (!orgId || !eid) return;
  void queryClient.invalidateQueries({
    queryKey: [
      ACTIVITY_LOGS_QUERY_KEY,
      orgId,
      ActivityLogModule.EQUIPMENT,
      eid,
    ],
  });
}

export function invalidateOrderPipeActivityLogs(
  queryClient: QueryClient,
  orgId: OrgId,
  orderPipeId: string | number | undefined | null
): void {
  const eid = normalizeEntityId(orderPipeId);
  if (!orgId || !eid) return;
  void queryClient.invalidateQueries({
    queryKey: [
      ACTIVITY_LOGS_QUERY_KEY,
      orgId,
      ActivityLogModule.ORDER_PIPE,
      eid,
    ],
  });
}
