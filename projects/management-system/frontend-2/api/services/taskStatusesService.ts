import type { TaskStatus, TaskStatusListParams } from "@/api/types";

import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";

export class TaskStatusesService {
  static async getTaskStatuses(
    organizationId: string,
    params: TaskStatusListParams = {}
  ): Promise<TaskStatus[]> {
    const endpoint =
      API_ENDPOINTS.organizations.taskStatuses.list(organizationId);
    const queryString = apiClient.buildQueryString(params);
    return apiClient.get<TaskStatus[]>(`${endpoint}${queryString}`);
  }
}
