import type {
  TaskType,
  TaskTypeCreatePayload,
  TaskTypeListParams,
  TaskTypeUpdatePayload,
} from "@/api/types";

import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";

export class TaskTypesService {
  // ============================================
  // LIST / FETCH TASK TYPES
  // ============================================

  static async getTaskTypes(
    organizationId: string,
    params: TaskTypeListParams = {}
  ): Promise<TaskType[]> {
    const endpoint = API_ENDPOINTS.organizations.taskTypes.list(organizationId);
    const queryString = apiClient.buildQueryString(params);
    return apiClient.get<TaskType[]>(`${endpoint}${queryString}`);
  }

  static async getTaskType(
    organizationId: string,
    taskTypeId: number | string
  ): Promise<TaskType> {
    const endpoint = API_ENDPOINTS.organizations.taskTypes.detail(
      organizationId,
      taskTypeId
    );
    return apiClient.get<TaskType>(endpoint);
  }

  // ============================================
  // CREATE TASK TYPES
  // ============================================

  static async createTaskType(
    organizationId: string,
    data: TaskTypeCreatePayload
  ): Promise<TaskType> {
    const endpoint = API_ENDPOINTS.organizations.taskTypes.list(organizationId);
    return apiClient.post<TaskType>(endpoint, data);
  }

  // ============================================
  // UPDATE TASK TYPES
  // ============================================

  static async updateTaskType(
    organizationId: string,
    taskTypeId: number | string,
    data: TaskTypeUpdatePayload
  ): Promise<TaskType> {
    const endpoint = API_ENDPOINTS.organizations.taskTypes.detail(
      organizationId,
      taskTypeId
    );
    return apiClient.patch<TaskType>(endpoint, data);
  }

  static async updateTaskTypeFull(
    organizationId: string,
    taskTypeId: number | string,
    data: TaskTypeCreatePayload
  ): Promise<TaskType> {
    const endpoint = API_ENDPOINTS.organizations.taskTypes.detail(
      organizationId,
      taskTypeId
    );
    return apiClient.put<TaskType>(endpoint, data);
  }

  // ============================================
  // DELETE TASK TYPES
  // ============================================

  static async deleteTaskType(
    organizationId: string,
    taskTypeId: number | string
  ): Promise<void> {
    const endpoint = API_ENDPOINTS.organizations.taskTypes.detail(
      organizationId,
      taskTypeId
    );
    return apiClient.delete<void>(endpoint);
  }
}
