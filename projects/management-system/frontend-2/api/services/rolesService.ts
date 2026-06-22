import type { Role, RoleCreatePayload, RoleUpdatePayload } from "@/api/types";

import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";

export class RolesService {
  // ============================================
  // ROLES
  // ============================================

  static async getRoles(organizationId: string): Promise<Role[]> {
    const endpoint = API_ENDPOINTS.organizations.roles.list(organizationId);
    const response = await apiClient.get<Role[] | { data: Role[] }>(endpoint);
    // Handle standardized response format
    if (response && typeof response === "object" && "data" in response) {
      return (response as { data: Role[] }).data;
    }
    return response as Role[];
  }

  static async getRole(
    organizationId: string,
    roleId: number | string
  ): Promise<Role> {
    const endpoint = API_ENDPOINTS.organizations.roles.detail(
      organizationId,
      roleId
    );
    const response = await apiClient.get<Role | { data: Role }>(endpoint);
    // Handle standardized response format
    if (response && typeof response === "object" && "data" in response) {
      return (response as { data: Role }).data;
    }
    return response as Role;
  }

  static async createRole(
    organizationId: string,
    data: RoleCreatePayload
  ): Promise<Role> {
    const endpoint = API_ENDPOINTS.organizations.roles.list(organizationId);
    const response = await apiClient.post<Role | { data: Role }>(
      endpoint,
      data
    );
    // Handle standardized response format
    if (response && typeof response === "object" && "data" in response) {
      return (response as { data: Role }).data;
    }
    return response as Role;
  }

  static async updateRole(
    organizationId: string,
    roleId: number | string,
    data: RoleUpdatePayload
  ): Promise<Role> {
    const endpoint = API_ENDPOINTS.organizations.roles.detail(
      organizationId,
      roleId
    );
    const response = await apiClient.patch<Role | { data: Role }>(
      endpoint,
      data
    );
    // Handle standardized response format
    if (response && typeof response === "object" && "data" in response) {
      return (response as { data: Role }).data;
    }
    return response as Role;
  }

  static async deleteRole(
    organizationId: string,
    roleId: number | string
  ): Promise<void> {
    const endpoint = API_ENDPOINTS.organizations.roles.detail(
      organizationId,
      roleId
    );
    await apiClient.delete(endpoint);
  }
}
