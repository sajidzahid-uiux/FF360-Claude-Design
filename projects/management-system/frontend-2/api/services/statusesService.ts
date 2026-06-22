import type {
  JobStatus,
  LeadStatus,
  LeadTypeInfo,
  OrganizationJobStatus,
  OrganizationLeadStatusSetting,
  OrganizationLeadTypeSetting,
} from "@/api/types";

import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";

const STATUS_NUMBER_ERROR =
  "Status number cannot be before New (1), after Completed, or a duplicated status number";

function toStatusError(error: unknown, fallback: string): Error {
  if (error instanceof Error && error.message) {
    return error;
  }
  return new Error(fallback);
}

export class StatusesService {
  // ============================================
  // READ — org-level
  // ============================================

  static async getJobStatuses(
    organizationId: string,
    jobType?: string
  ): Promise<JobStatus[]> {
    const endpoint = API_ENDPOINTS.organizations.statuses.jobs(organizationId);
    const queryString = jobType
      ? apiClient.buildQueryString({ job_type: jobType })
      : "";
    return apiClient.get<JobStatus[]>(`${endpoint}${queryString}`);
  }

  static async getLeadStatuses(organizationId: string): Promise<LeadStatus[]> {
    const endpoint = API_ENDPOINTS.organizations.statuses.leads(organizationId);
    return apiClient.get<LeadStatus[]>(endpoint);
  }

  static async getLeadTypes(organizationId: string): Promise<LeadTypeInfo[]> {
    const endpoint =
      API_ENDPOINTS.organizations.statuses.leadTypes(organizationId);
    return apiClient.get<LeadTypeInfo[]>(endpoint);
  }

  // ============================================
  // READ — settings
  // ============================================

  static async getJobStatusesSettings(
    organizationId: string,
    jobType?: string
  ): Promise<OrganizationJobStatus[]> {
    const endpoint =
      API_ENDPOINTS.organizations.settingsStatuses.jobs(organizationId);
    const queryString = jobType
      ? apiClient.buildQueryString({ job_type: jobType })
      : "";
    return apiClient.get<OrganizationJobStatus[]>(`${endpoint}${queryString}`);
  }

  static async getLeadStatusesSettings(
    organizationId: string
  ): Promise<OrganizationLeadStatusSetting[]> {
    const endpoint =
      API_ENDPOINTS.organizations.settingsStatuses.leads(organizationId);
    return apiClient.get<OrganizationLeadStatusSetting[]>(endpoint);
  }

  static async getLeadTypesSettings(
    organizationId: string
  ): Promise<OrganizationLeadTypeSetting[]> {
    const endpoint =
      API_ENDPOINTS.organizations.settingsStatuses.leadTypes(organizationId);
    return apiClient.get<OrganizationLeadTypeSetting[]>(endpoint);
  }

  // ============================================
  // MUTATE — org-level job statuses
  // ============================================

  static async createJobStatus(
    organizationId: string,
    data: Record<string, unknown>,
    jobType?: string
  ): Promise<OrganizationJobStatus> {
    const endpoint = API_ENDPOINTS.organizations.statuses.jobs(organizationId);
    const queryString = jobType
      ? apiClient.buildQueryString({ job_type: jobType })
      : "";
    try {
      return await apiClient.post<OrganizationJobStatus>(
        `${endpoint}${queryString}`,
        data
      );
    } catch (error) {
      throw toStatusError(error, STATUS_NUMBER_ERROR);
    }
  }

  static async updateJobStatus(
    organizationId: string,
    statusId: number | string,
    data: Record<string, unknown>
  ): Promise<OrganizationJobStatus> {
    const endpoint = API_ENDPOINTS.organizations.statuses.jobDetail(
      organizationId,
      statusId
    );
    try {
      return await apiClient.patch<OrganizationJobStatus>(endpoint, data);
    } catch (error) {
      throw toStatusError(error, STATUS_NUMBER_ERROR);
    }
  }

  static async deleteJobStatus(
    organizationId: string,
    statusId: number | string
  ): Promise<void> {
    const endpoint = API_ENDPOINTS.organizations.statuses.jobDetail(
      organizationId,
      statusId
    );
    try {
      await apiClient.delete<void>(endpoint);
    } catch (error) {
      throw toStatusError(error, STATUS_NUMBER_ERROR);
    }
  }

  // ============================================
  // MUTATE — org-level lead statuses
  // ============================================

  static async createLeadStatus(
    organizationId: string,
    data: Record<string, unknown>
  ): Promise<LeadStatus> {
    const endpoint = API_ENDPOINTS.organizations.statuses.leads(organizationId);
    try {
      return await apiClient.post<LeadStatus>(endpoint, data);
    } catch (error) {
      throw toStatusError(error, STATUS_NUMBER_ERROR);
    }
  }

  static async updateLeadStatus(
    organizationId: string,
    statusId: number | string,
    data: Record<string, unknown>
  ): Promise<LeadStatus> {
    const endpoint = API_ENDPOINTS.organizations.statuses.leadDetail(
      organizationId,
      statusId
    );
    try {
      return await apiClient.patch<LeadStatus>(endpoint, data);
    } catch (error) {
      throw toStatusError(error, STATUS_NUMBER_ERROR);
    }
  }

  static async deleteLeadStatus(
    organizationId: string,
    statusId: number | string
  ): Promise<void> {
    const endpoint = API_ENDPOINTS.organizations.statuses.leadDetail(
      organizationId,
      statusId
    );
    try {
      await apiClient.delete<void>(endpoint);
    } catch (error) {
      throw toStatusError(error, STATUS_NUMBER_ERROR);
    }
  }

  // ============================================
  // MUTATE — org-level lead types
  // ============================================

  static async createLeadType(
    organizationId: string,
    data: Record<string, unknown>
  ): Promise<LeadTypeInfo> {
    const endpoint =
      API_ENDPOINTS.organizations.statuses.leadTypes(organizationId);
    return apiClient.post<LeadTypeInfo>(endpoint, data);
  }

  static async updateLeadType(
    organizationId: string,
    typeId: number | string,
    data: Record<string, unknown>
  ): Promise<LeadTypeInfo> {
    const endpoint = API_ENDPOINTS.organizations.statuses.leadTypeDetail(
      organizationId,
      typeId
    );
    return apiClient.patch<LeadTypeInfo>(endpoint, data);
  }

  static async deleteLeadType(
    organizationId: string,
    typeId: number | string
  ): Promise<void> {
    const endpoint = API_ENDPOINTS.organizations.statuses.leadTypeDetail(
      organizationId,
      typeId
    );
    await apiClient.delete<void>(endpoint);
  }

  // ============================================
  // MUTATE — settings job statuses
  // ============================================

  static async createJobStatusSettings(
    organizationId: string,
    data: Record<string, unknown>,
    jobType?: string
  ): Promise<OrganizationJobStatus> {
    const endpoint =
      API_ENDPOINTS.organizations.settingsStatuses.jobs(organizationId);
    const queryString = jobType
      ? apiClient.buildQueryString({ job_type: jobType })
      : "";
    try {
      return await apiClient.post<OrganizationJobStatus>(
        `${endpoint}${queryString}`,
        data
      );
    } catch (error) {
      throw toStatusError(error, STATUS_NUMBER_ERROR);
    }
  }

  static async updateJobStatusSettings(
    organizationId: string,
    statusId: number | string,
    data: Record<string, unknown>
  ): Promise<OrganizationJobStatus> {
    const endpoint = API_ENDPOINTS.organizations.settingsStatuses.jobDetail(
      organizationId,
      statusId
    );
    try {
      return await apiClient.patch<OrganizationJobStatus>(endpoint, data);
    } catch (error) {
      throw toStatusError(error, STATUS_NUMBER_ERROR);
    }
  }

  static async deleteJobStatusSettings(
    organizationId: string,
    statusId: number | string
  ): Promise<void> {
    const endpoint = API_ENDPOINTS.organizations.settingsStatuses.jobDetail(
      organizationId,
      statusId
    );
    try {
      await apiClient.delete<void>(endpoint);
    } catch (error) {
      throw toStatusError(error, STATUS_NUMBER_ERROR);
    }
  }

  // ============================================
  // MUTATE — settings lead statuses
  // ============================================

  static async createLeadStatusSettings(
    organizationId: string,
    data: Record<string, unknown>
  ): Promise<LeadStatus> {
    const endpoint =
      API_ENDPOINTS.organizations.settingsStatuses.leads(organizationId);
    try {
      return await apiClient.post<LeadStatus>(endpoint, data);
    } catch (error) {
      throw toStatusError(error, STATUS_NUMBER_ERROR);
    }
  }

  static async updateLeadStatusSettings(
    organizationId: string,
    statusId: number | string,
    data: Record<string, unknown>
  ): Promise<LeadStatus> {
    const endpoint = API_ENDPOINTS.organizations.settingsStatuses.leadDetail(
      organizationId,
      statusId
    );
    try {
      return await apiClient.patch<LeadStatus>(endpoint, data);
    } catch (error) {
      throw toStatusError(error, STATUS_NUMBER_ERROR);
    }
  }

  static async deleteLeadStatusSettings(
    organizationId: string,
    statusId: number | string
  ): Promise<void> {
    const endpoint = API_ENDPOINTS.organizations.settingsStatuses.leadDetail(
      organizationId,
      statusId
    );
    try {
      await apiClient.delete<void>(endpoint);
    } catch (error) {
      throw toStatusError(error, STATUS_NUMBER_ERROR);
    }
  }

  // ============================================
  // MUTATE — settings lead types
  // ============================================

  static async createLeadTypeSettings(
    organizationId: string,
    data: Record<string, unknown>
  ): Promise<LeadTypeInfo> {
    const endpoint =
      API_ENDPOINTS.organizations.settingsStatuses.leadTypes(organizationId);
    return apiClient.post<LeadTypeInfo>(endpoint, data);
  }

  static async updateLeadTypeSettings(
    organizationId: string,
    typeId: number | string,
    data: Record<string, unknown>
  ): Promise<LeadTypeInfo> {
    const endpoint =
      API_ENDPOINTS.organizations.settingsStatuses.leadTypeDetail(
        organizationId,
        typeId
      );
    return apiClient.patch<LeadTypeInfo>(endpoint, data);
  }

  static async deleteLeadTypeSettings(
    organizationId: string,
    typeId: number | string
  ): Promise<void> {
    const endpoint =
      API_ENDPOINTS.organizations.settingsStatuses.leadTypeDetail(
        organizationId,
        typeId
      );
    await apiClient.delete<void>(endpoint);
  }
}
