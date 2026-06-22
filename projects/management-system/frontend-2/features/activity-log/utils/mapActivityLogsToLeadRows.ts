import type { ActivityLogApiEntry } from "@/api/types/activityLogs";

import type { LeadLogRow } from "../model/types";

export function mapActivityLogsToLeadRows(
  entries: ActivityLogApiEntry[]
): LeadLogRow[] {
  return entries.map((log) => ({
    id: String(log.id),
    user: log.actor_name?.trim() || "—",
    action: log.event_name?.trim() || log.event_key || "—",
    actionDetail: log.log_message_rendered?.trim() || "",
  }));
}
