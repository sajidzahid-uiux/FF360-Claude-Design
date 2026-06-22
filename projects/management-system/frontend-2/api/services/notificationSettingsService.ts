import type {
  FyiNotificationSetting,
  ImportantNotificationSetting,
  PatchFyiNotificationPayload,
  PatchImportantNotificationPayload,
} from "@/api/types";

import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";

export class NotificationSettingsService {
  /**
   * GET important notification settings for the current user.
   * Returns list of event_key, title, description, category, sub_category, is_enabled.
   */
  static async getImportantNotificationSettings(
    organizationId: string
  ): Promise<ImportantNotificationSetting[]> {
    const endpoint =
      API_ENDPOINTS.organizations.notificationSettings.important(
        organizationId
      );
    const response = await apiClient.get<
      ImportantNotificationSetting[] | { data: ImportantNotificationSetting[] }
    >(endpoint);
    if (response && typeof response === "object" && "data" in response) {
      return (response as { data: ImportantNotificationSetting[] }).data;
    }
    return response as ImportantNotificationSetting[];
  }

  /**
   * PATCH a single important notification setting (toggle is_enabled for one event_key).
   */
  static async patchImportantNotificationSettings(
    organizationId: string,
    payload: PatchImportantNotificationPayload
  ): Promise<ImportantNotificationSetting[] | unknown> {
    const endpoint =
      API_ENDPOINTS.organizations.notificationSettings.important(
        organizationId
      );
    const response = await apiClient.patch<
      ImportantNotificationSetting[] | { data: ImportantNotificationSetting[] }
    >(endpoint, payload);
    if (response && typeof response === "object" && "data" in response) {
      return (response as { data: ImportantNotificationSetting[] }).data;
    }
    return response;
  }

  /**
   * GET FYI notification settings for the organization.
   * Returns list of event_key, title, description, category, sub_category, assigned_users.
   */
  static async getFyiNotificationSettings(
    organizationId: string
  ): Promise<FyiNotificationSetting[]> {
    const endpoint =
      API_ENDPOINTS.organizations.notificationSettings.fyi(organizationId);
    const response = await apiClient.get<
      FyiNotificationSetting[] | { data: FyiNotificationSetting[] }
    >(endpoint);
    if (response && typeof response === "object" && "data" in response) {
      return (response as { data: FyiNotificationSetting[] }).data;
    }
    return response as FyiNotificationSetting[];
  }

  /**
   * PATCH FYI notification setting (set assigned users for one event_key).
   */
  static async patchFyiNotificationSettings(
    organizationId: string,
    payload: PatchFyiNotificationPayload
  ): Promise<FyiNotificationSetting[] | unknown> {
    const endpoint =
      API_ENDPOINTS.organizations.notificationSettings.fyi(organizationId);
    const response = await apiClient.patch<
      FyiNotificationSetting[] | { data: FyiNotificationSetting[] }
    >(endpoint, payload);
    if (response && typeof response === "object" && "data" in response) {
      return (response as { data: FyiNotificationSetting[] }).data;
    }
    return response;
  }
}
