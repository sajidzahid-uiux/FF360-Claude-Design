import type {
  ListActivityLogsParams,
  PaginatedActivityLogs,
} from "@/api/types/activityLogs";

import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";

export class ActivityLogsService {
  static async listActivityLogs(
    organizationId: string,
    params: ListActivityLogsParams = {}
  ): Promise<PaginatedActivityLogs> {
    const base = API_ENDPOINTS.organizations.activityLogs(organizationId);
    const qs = apiClient.buildQueryString({
      page: params.page ?? 1,
      page_size: params.page_size ?? 50,
      ...(params.module && { module: params.module }),
      ...(params.entity_id != null && params.entity_id !== ""
        ? { entity_id: params.entity_id }
        : {}),
      ...(params.object_id != null && params.object_id !== ""
        ? { object_id: params.object_id }
        : {}),
      ...(params.event_key && { event_key: params.event_key }),
      ...(params.actor_member_id != null && {
        actor_member_id: params.actor_member_id,
      }),
    });
    return apiClient.get<PaginatedActivityLogs>(`${base}${qs}`);
  }
}
