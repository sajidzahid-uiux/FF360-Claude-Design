import type {
  ConvertLeadToJobPayload,
  CorePoint,
  CorePointCreatePayload,
  CorePointUpdatePayload,
  Lead,
  LeadCreatePayload,
  LeadListParams,
  LeadMapUpdatePayload,
  LeadResponse,
  LeadUpdatePayload,
  PaginatedResponse,
} from "@/api/types";
import { LeadType } from "@/constants/enums";
import {
  type MapFileType,
  buildMapUploadFormData,
} from "@/shared/lib/mapFilesV2";
import type { UploadProgressHandler } from "@/shared/lib/uploadProgress";
import { withUploadProgress } from "@/shared/lib/uploadProgress";

import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import { extractEntityFromPayload } from "../utils/extractEntityFromPayload";

export class LeadsService {
  // ============================================
  // LIST / FETCH LEADS
  // ============================================

  static async getLeads(
    organizationId: string,
    params: LeadListParams = {}
  ): Promise<PaginatedResponse<Lead> | Lead[]> {
    const endpoint = API_ENDPOINTS.organizations.leads.list(organizationId);
    const queryString = apiClient.buildQueryString(params);
    return apiClient.get<PaginatedResponse<Lead> | Lead[]>(
      `${endpoint}${queryString}`
    );
  }

  static async getLeadsByType(
    organizationId: string,
    leadType: LeadType,
    params: LeadListParams = {}
  ): Promise<Lead[]> {
    const endpoint = API_ENDPOINTS.organizations.leads.listByType(
      organizationId,
      leadType
    );
    const queryString = apiClient.buildQueryString(params);
    return apiClient.get<Lead[]>(`${endpoint}${queryString}`);
  }

  static async getLead(
    organizationId: string,
    leadType: LeadType,
    leadId: number | string,
    isArchived: boolean = false
  ): Promise<Lead> {
    const endpoint = API_ENDPOINTS.organizations.leads.detail(
      organizationId,
      leadType,
      leadId
    );
    const queryString = apiClient.buildQueryString({ archived: isArchived });
    return apiClient.get<Lead>(`${endpoint}${queryString}`);
  }

  // ============================================
  // CREATE LEADS
  // ============================================

  static async createLead(
    organizationId: string,
    leadType: LeadType,
    data: LeadCreatePayload
  ): Promise<Lead> {
    const endpoint = API_ENDPOINTS.organizations.leads.create(
      organizationId,
      leadType
    );
    const response = await apiClient.post<LeadResponse | Lead>(endpoint, data);
    return extractEntityFromPayload<Lead>(response, "lead");
  }

  // ============================================
  // UPDATE LEADS
  // ============================================

  static async updateLead(
    organizationId: string,
    leadType: LeadType,
    leadId: number | string,
    data: Partial<LeadUpdatePayload>
  ): Promise<Lead> {
    const endpoint = API_ENDPOINTS.organizations.leads.detail(
      organizationId,
      leadType,
      leadId
    );
    return apiClient.patch<Lead>(endpoint, data);
  }

  static async updateLeadMap(
    organizationId: string,
    leadType: LeadType,
    leadId: number | string,
    updatedLead: LeadMapUpdatePayload,
    onProgress?: UploadProgressHandler
  ): Promise<Lead> {
    const endpoint = API_ENDPOINTS.organizations.leads.detail(
      organizationId,
      leadType,
      leadId
    );
    return apiClient.patchMultipart<Lead>(
      endpoint,
      buildMapUploadFormData(updatedLead as Record<string, unknown>),
      withUploadProgress(onProgress)
    );
  }

  // ============================================
  // DELETE LEADS
  // ============================================

  static async deleteLead(
    organizationId: string,
    leadType: LeadType,
    leadId: number | string
  ): Promise<void> {
    const endpoint = API_ENDPOINTS.organizations.leads.detail(
      organizationId,
      leadType,
      leadId
    );
    return apiClient.delete<void>(endpoint);
  }

  static async trashLead(
    organizationId: string,
    leadType: LeadType,
    leadId: number | string
  ): Promise<void> {
    const endpoint = API_ENDPOINTS.organizations.leads.trash(
      organizationId,
      leadType,
      leadId
    );
    return apiClient.post<void>(endpoint);
  }

  static async permanentDeleteLead(
    organizationId: string,
    leadType: LeadType,
    leadId: number | string
  ): Promise<void> {
    const endpoint = API_ENDPOINTS.organizations.leads.permanentDelete(
      organizationId,
      leadType,
      leadId
    );
    return apiClient.post<void>(`${endpoint}?trashed=true`);
  }

  static async restoreLead(
    organizationId: string,
    leadType: LeadType,
    leadId: number | string
  ): Promise<void> {
    const endpoint = API_ENDPOINTS.organizations.leads.restore(
      organizationId,
      leadType,
      leadId
    );
    return apiClient.post<void>(`${endpoint}?trashed=true`);
  }

  static async deleteMapFile(
    organizationId: string,
    leadType: LeadType,
    leadId: number | string,
    fileType: MapFileType,
    mapId?: number | string
  ): Promise<void> {
    const endpoint = API_ENDPOINTS.organizations.leads.deleteMapFile(
      organizationId,
      leadType,
      leadId,
      fileType,
      mapId
    );
    return apiClient.delete<void>(endpoint);
  }

  // ============================================
  // ARCHIVE / UNARCHIVE
  // ============================================

  static async archiveLead(
    organizationId: string,
    leadType: LeadType,
    leadId: number | string
  ): Promise<void> {
    const endpoint = API_ENDPOINTS.organizations.leads.archive(
      organizationId,
      leadType,
      leadId
    );
    return apiClient.post<void>(endpoint, { object_id: leadId });
  }

  static async unarchiveLead(
    organizationId: string,
    leadType: LeadType,
    leadId: number | string
  ): Promise<void> {
    const endpoint = API_ENDPOINTS.organizations.leads.unarchive(
      organizationId,
      leadType,
      leadId
    );
    return apiClient.post<void>(`${endpoint}?archived=true`);
  }

  // ============================================
  // CONVERT TO JOB
  // ============================================

  static async convertToJob<T = unknown>(
    organizationId: string,
    leadType: LeadType,
    leadId: number | string,
    data?: ConvertLeadToJobPayload
  ): Promise<T> {
    const endpoint = API_ENDPOINTS.organizations.leads.convertToJob(
      organizationId,
      leadType,
      leadId
    );
    return apiClient.post<T>(endpoint, data);
  }

  // ============================================
  // CORE POINTS (Tiling Leads Only)
  // ============================================

  static async getCorePoints(
    organizationId: string,
    leadId: number | string,
    params: { search?: string; page?: number; page_size?: number } = {}
  ): Promise<PaginatedResponse<CorePoint> | CorePoint[]> {
    const endpoint = API_ENDPOINTS.organizations.leads.corePoints(
      organizationId,
      leadId
    );
    const queryString = apiClient.buildQueryString(params);
    return apiClient.get<PaginatedResponse<CorePoint> | CorePoint[]>(
      `${endpoint}${queryString}`
    );
  }

  static async getCorePoint(
    organizationId: string,
    leadId: number | string,
    coreId: number | string
  ): Promise<CorePoint> {
    const endpoint = API_ENDPOINTS.organizations.leads.corePointDetail(
      organizationId,
      leadId,
      coreId
    );
    return apiClient.get<CorePoint>(endpoint);
  }

  static async createCorePoint(
    organizationId: string,
    leadId: number | string,
    data: CorePointCreatePayload
  ): Promise<CorePoint> {
    const endpoint = API_ENDPOINTS.organizations.leads.corePoints(
      organizationId,
      leadId
    );
    return apiClient.post<CorePoint>(endpoint, data);
  }

  static async updateCorePoint(
    organizationId: string,
    leadId: number | string,
    coreId: number | string,
    data: CorePointUpdatePayload
  ): Promise<CorePoint> {
    const endpoint = API_ENDPOINTS.organizations.leads.corePointDetail(
      organizationId,
      leadId,
      coreId
    );
    return apiClient.patch<CorePoint>(endpoint, data);
  }

  static async deleteCorePoint(
    organizationId: string,
    leadId: number | string,
    coreId: number | string
  ): Promise<void> {
    const endpoint = API_ENDPOINTS.organizations.leads.corePointDetail(
      organizationId,
      leadId,
      coreId
    );
    return apiClient.delete<void>(endpoint);
  }
}
