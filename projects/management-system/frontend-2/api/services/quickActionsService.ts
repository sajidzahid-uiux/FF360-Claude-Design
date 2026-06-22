import type {
  ApiSuccessResponse,
  OrgFileUploadPayload,
  OrgFileUploadResponse,
  QuickAction,
  QuickActionContactLookupResponse,
  QuickActionConvertToContactPayload,
  QuickActionConvertToContactResponse,
  QuickActionConvertToJobPayload,
  QuickActionConvertToJobResponse,
  QuickActionConvertToLeadPayload,
  QuickActionConvertToLeadResponse,
  QuickActionCreatePayload,
  QuickActionListParams,
  QuickActionUpdatePayload,
} from "@/api/types";

import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";

export class QuickActionsService {
  // ============================================
  // LIST QUICK ACTIONS
  // ============================================

  static async getQuickActions(
    organizationId: string,
    params: QuickActionListParams = {}
  ): Promise<QuickAction[]> {
    const endpoint = API_ENDPOINTS.quickActions.list(organizationId);
    const queryString = apiClient.buildQueryString(params);
    const response = await apiClient.get<ApiSuccessResponse<QuickAction[]>>(
      `${endpoint}${queryString}`
    );
    const derivedConvertedTo = (data: QuickAction) =>
      data.conversion?.conversion_type ??
      (data.conversion?.lead != null || data.conversion?.lead_done
        ? "lead"
        : null) ??
      data.converted_to ??
      null;
    return (response.data ?? []).map((data) => ({
      ...data,
      done: data.conversion?.done ?? data.done,
      converted_to: derivedConvertedTo(data),
    }));
  }

  // ============================================
  // GET SINGLE QUICK ACTION
  // ============================================

  static async getQuickAction(
    organizationId: string,
    id: number | string
  ): Promise<QuickAction> {
    const endpoint = API_ENDPOINTS.quickActions.detail(organizationId, id);
    const response =
      await apiClient.get<ApiSuccessResponse<QuickAction>>(endpoint);
    const data = response.data;
    const convertedTo =
      data.conversion?.conversion_type ??
      (data.conversion?.lead != null || data.conversion?.lead_done
        ? "lead"
        : null) ??
      data.converted_to ??
      null;
    return {
      ...data,
      done: data.conversion?.done ?? data.done,
      converted_to: convertedTo,
    };
  }

  // ============================================
  // CREATE QUICK ACTION
  // ============================================

  static async createQuickAction(
    organizationId: string,
    payload: QuickActionCreatePayload
  ): Promise<QuickAction> {
    const endpoint = API_ENDPOINTS.quickActions.list(organizationId);
    const response = await apiClient.post<ApiSuccessResponse<QuickAction>>(
      endpoint,
      payload
    );
    return response.data;
  }

  // ============================================
  // UPDATE QUICK ACTION (PATCH)
  // ============================================

  static async updateQuickAction(
    organizationId: string,
    id: number | string,
    payload: QuickActionUpdatePayload
  ): Promise<QuickAction> {
    const endpoint = API_ENDPOINTS.quickActions.detail(organizationId, id);
    const response = await apiClient.patch<ApiSuccessResponse<QuickAction>>(
      endpoint,
      payload
    );
    return response.data;
  }

  // ============================================
  // DELETE QUICK ACTION
  // ============================================

  static async deleteQuickAction(
    organizationId: string,
    id: number | string
  ): Promise<void> {
    const endpoint = API_ENDPOINTS.quickActions.detail(organizationId, id);
    await apiClient.delete(endpoint);
  }

  // ============================================
  // STEP 1: UPLOAD FILE (org-level, get id for file_ids)
  // POST .../files/ with file, title, description.
  // Use returned id in file_ids when creating/updating quick action.
  // ============================================

  static async uploadFile(
    organizationId: string,
    payload: OrgFileUploadPayload
  ): Promise<OrgFileUploadResponse> {
    const endpoint = API_ENDPOINTS.quickActions.fileUpload(organizationId);
    const formData = new FormData();
    formData.append("file", payload.file);
    formData.append("title", payload.title);
    formData.append("description", payload.description?.trim() || "—");
    formData.append("farmer_file", "false");
    return apiClient.uploadFile<OrgFileUploadResponse>(endpoint, formData);
  }

  // ============================================
  // UPLOAD FILE (attach to existing quick action)
  // Backend requires content_type, object_id, description.
  // ============================================

  static async uploadFileForQuickAction(
    organizationId: string,
    quickActionId: number | string,
    contentTypeId: number,
    payload: { file: File; title: string; description?: string }
  ): Promise<OrgFileUploadResponse> {
    const endpoint = API_ENDPOINTS.quickActions.fileUpload(organizationId);
    const formData = new FormData();
    formData.append("file", payload.file);
    formData.append("content_type", String(contentTypeId));
    formData.append("object_id", String(quickActionId));
    formData.append("title", payload.title);
    formData.append("description", payload.description?.trim() || "—");
    formData.append("farmer_file", "false");
    return apiClient.uploadFile<OrgFileUploadResponse>(endpoint, formData);
  }

  static async deleteFile(
    organizationId: string,
    fileId: number | string
  ): Promise<void> {
    const endpoint = API_ENDPOINTS.quickActions.fileDetail(
      organizationId,
      fileId
    );
    await apiClient.delete(endpoint);
  }

  // ============================================
  // CONVERT TO CONTACT
  // ============================================

  static async contactLookup(
    organizationId: string,
    quickActionId: number | string
  ): Promise<QuickActionContactLookupResponse> {
    const endpoint = API_ENDPOINTS.quickActions.convertToContactLookup(
      organizationId,
      quickActionId
    );
    const response =
      await apiClient.get<ApiSuccessResponse<QuickActionContactLookupResponse>>(
        endpoint
      );
    return response.data;
  }

  static async convertToContact(
    organizationId: string,
    quickActionId: number | string,
    payload: QuickActionConvertToContactPayload
  ): Promise<QuickActionConvertToContactResponse> {
    const endpoint = API_ENDPOINTS.quickActions.convertToContact(
      organizationId,
      quickActionId
    );
    const response = await apiClient.post<
      ApiSuccessResponse<QuickActionConvertToContactResponse>
    >(endpoint, payload);
    return response.data;
  }

  // ============================================
  // CONVERT TO LEAD
  // ============================================

  static async convertToLead(
    organizationId: string,
    quickActionId: number | string,
    payload: QuickActionConvertToLeadPayload
  ): Promise<QuickActionConvertToLeadResponse> {
    const endpoint = API_ENDPOINTS.quickActions.convertToLead(
      organizationId,
      quickActionId
    );
    const response = await apiClient.post<
      ApiSuccessResponse<QuickActionConvertToLeadResponse>
    >(endpoint, payload);
    return response.data;
  }

  // ============================================
  // CONVERT TO JOB
  // ============================================

  static async convertToJob(
    organizationId: string,
    quickActionId: number | string,
    payload: QuickActionConvertToJobPayload
  ): Promise<QuickActionConvertToJobResponse> {
    const endpoint = API_ENDPOINTS.quickActions.convertToJob(
      organizationId,
      quickActionId
    );
    const response = await apiClient.post<
      ApiSuccessResponse<QuickActionConvertToJobResponse>
    >(endpoint, payload);
    return response.data;
  }
}
