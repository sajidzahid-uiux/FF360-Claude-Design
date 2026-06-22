import type {
  PaginatedTaskResponse,
  Task,
  TaskCreatePayload,
  TaskListParams,
  TaskUpdatePayload,
} from "@/api/types";

import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";

export class TasksService {
  // ============================================
  // LIST / FETCH TASKS
  // ============================================

  static async getTasks(
    organizationId: string,
    params: TaskListParams = {}
  ): Promise<PaginatedTaskResponse | Task[]> {
    const endpoint = API_ENDPOINTS.organizations.tasks.list(organizationId);
    const queryString = apiClient.buildQueryString(params, {
      repeatArrays: true,
    });
    return apiClient.get<PaginatedTaskResponse | Task[]>(
      `${endpoint}${queryString}`
    );
  }

  static async getTask(
    organizationId: string,
    taskId: number | string
  ): Promise<Task> {
    const endpoint = API_ENDPOINTS.organizations.tasks.detail(
      organizationId,
      taskId
    );
    return apiClient.get<Task>(endpoint);
  }

  // ============================================
  // CREATE TASKS
  // ============================================

  static async createTask(
    organizationId: string,
    data: TaskCreatePayload
  ): Promise<Task> {
    const endpoint = API_ENDPOINTS.organizations.tasks.list(organizationId);
    return apiClient.post<Task>(endpoint, data);
  }

  // ============================================
  // UPDATE TASKS
  // ============================================

  static async updateTask(
    organizationId: string,
    taskId: number | string,
    data: TaskUpdatePayload
  ): Promise<Task> {
    const endpoint = API_ENDPOINTS.organizations.tasks.detail(
      organizationId,
      taskId
    );
    return apiClient.patch<Task>(endpoint, data);
  }

  // ============================================
  // DELETE TASKS
  // ============================================

  static async deleteTask(
    organizationId: string,
    taskId: number | string
  ): Promise<void> {
    const endpoint = API_ENDPOINTS.organizations.tasks.detail(
      organizationId,
      taskId
    );
    return apiClient.delete<void>(endpoint);
  }
}
