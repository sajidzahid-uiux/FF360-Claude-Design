import type { ActivityLogModule } from "@/constants/enums";

/** Activity log row from GET /ms/organizations/{org_id}/activity-logs/ */
export interface ActivityLogApiEntry {
  id: number;
  organization: number;
  module: string;
  entity_id: number;
  entity_label: string;
  actor_member_id: number | null;
  actor_name: string;
  event_key: string;
  event_name: string;
  log_message_rendered: string;
  field_name: string | null;
  before_value: unknown;
  after_value: unknown;
  created_at: string;
}

export interface PaginatedActivityLogs {
  count: number;
  next: string | null;
  previous: string | null;
  results: ActivityLogApiEntry[];
}

export interface ListActivityLogsParams {
  page?: number;
  page_size?: number;
  /** See {@link ActivityLogModule} / backend `ActivityLog.MODULE_*`. */
  module?: ActivityLogModule;
  entity_id?: number | string;
  object_id?: number | string;
  event_key?: string;
  actor_member_id?: number | string;
}
