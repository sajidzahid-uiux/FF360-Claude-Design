import type {
  PaginatedProjectTypesResponse,
  ProjectType,
  ProjectTypeCategory,
} from "@/api/types";

import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";

export class ProjectTypesService {
  static async list(
    organizationId: string,
    category?: ProjectTypeCategory
  ): Promise<ProjectType[]> {
    const endpoint = API_ENDPOINTS.organizations.projectTypes(organizationId);
    const queryString = category
      ? apiClient.buildQueryString({ category })
      : "";
    const data = await apiClient.get<
      ProjectType[] | PaginatedProjectTypesResponse
    >(`${endpoint}${queryString}`);
    return Array.isArray(data) ? data : (data.results ?? []);
  }
}
