import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import {
  OrganizationSettings,
  PatchOrganizationSettingsPayload,
} from "../types";

export class OrganizationSettingsService {
  /**
   * GET organization settings (e.g. monthly_summary_email_enabled).
   */
  static async getOrganizationSettings(
    organizationId: string
  ): Promise<OrganizationSettings> {
    const endpoint = API_ENDPOINTS.organizations.settings(organizationId);
    return apiClient.get<OrganizationSettings>(endpoint);
  }

  /**
   * PATCH organization settings (e.g. toggle monthly summary email).
   */
  static async patchOrganizationSettings(
    organizationId: string,
    payload: PatchOrganizationSettingsPayload
  ): Promise<OrganizationSettings> {
    const endpoint = API_ENDPOINTS.organizations.settings(organizationId);
    return apiClient.patch<OrganizationSettings>(endpoint, payload);
  }
}
