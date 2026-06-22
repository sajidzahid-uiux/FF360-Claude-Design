import type {
  DeleteAllResponse,
  MarkAllReadResponse,
  NewNotificationsParams,
  NewNotificationsResponse,
} from "@/api/types";

import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";

export class NewNotificationsService {
  /**
   * GET new notifications for the current user. Supports pagination and search.
   * When page/page_size are provided, returns paginated shape; otherwise returns array.
   */
  static async getList(
    organizationId: string,
    params?: NewNotificationsParams
  ): Promise<NewNotificationsResponse> {
    const base =
      API_ENDPOINTS.organizations.newNotifications.list(organizationId);
    const queryString = params
      ? apiClient.buildQueryString({
          page: params.page,
          page_size: params.page_size,
          search: params.search || undefined,
          unread: params.unread,
        })
      : "";
    return apiClient.get<NewNotificationsResponse>(`${base}${queryString}`);
  }

  /**
   * PATCH a single notification (e.g. mark as read).
   */
  static async patch(
    organizationId: string,
    id: number | string,
    data: { read: boolean }
  ): Promise<unknown> {
    const endpoint = API_ENDPOINTS.organizations.newNotifications.detail(
      organizationId,
      id
    );
    return apiClient.patch(endpoint, data);
  }

  /**
   * POST mark all unread notifications as read.
   */
  static async markAllRead(
    organizationId: string
  ): Promise<MarkAllReadResponse> {
    const endpoint =
      API_ENDPOINTS.organizations.newNotifications.markAllRead(organizationId);
    return apiClient.post<MarkAllReadResponse>(endpoint);
  }

  /**
   * DELETE a single notification.
   */
  static async delete(
    organizationId: string,
    id: number | string
  ): Promise<unknown> {
    const endpoint = API_ENDPOINTS.organizations.newNotifications.detail(
      organizationId,
      id
    );
    return apiClient.delete(endpoint);
  }

  /**
   * POST delete all notifications for the current user. Client should confirm first.
   */
  static async deleteAll(organizationId: string): Promise<DeleteAllResponse> {
    const endpoint =
      API_ENDPOINTS.organizations.newNotifications.deleteAll(organizationId);
    return apiClient.post<DeleteAllResponse>(endpoint);
  }
}
