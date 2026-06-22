import type { Permission, UserPermissionsResponse } from "@/api/types";

import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";

export class PermissionsService {
  // ============================================
  // PERMISSIONS
  // ============================================

  static async getPermissions(organizationId: string): Promise<Permission[]> {
    const endpoint =
      API_ENDPOINTS.organizations.permissions.list(organizationId);
    const response = await apiClient.get<Permission[] | { data: Permission[] }>(
      endpoint
    );
    if (response && typeof response === "object" && "data" in response) {
      return (response as { data: Permission[] }).data;
    }
    return response as Permission[];
  }

  static async getPermission(
    organizationId: string,
    permissionId: number | string
  ): Promise<Permission> {
    const endpoint = API_ENDPOINTS.organizations.permissions.detail(
      organizationId,
      permissionId
    );
    const response = await apiClient.get<Permission | { data: Permission }>(
      endpoint
    );
    if (response && typeof response === "object" && "data" in response) {
      return (response as { data: Permission }).data;
    }
    return response as Permission;
  }

  // ============================================
  // USER PERMISSIONS
  // ============================================

  static async getMyPermissions(
    organizationId: string
  ): Promise<UserPermissionsResponse> {
    const endpoint =
      API_ENDPOINTS.organizations.permissions.myPermissions(organizationId);
    const response = await apiClient.get<
      UserPermissionsResponse | { data: UserPermissionsResponse }
    >(endpoint);
    // Handle standardized response format
    if (response && typeof response === "object" && "data" in response) {
      return (response as { data: UserPermissionsResponse }).data;
    }
    return response as UserPermissionsResponse;
  }
}
