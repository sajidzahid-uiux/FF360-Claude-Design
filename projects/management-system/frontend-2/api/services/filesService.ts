import type { FileAttachment, FileUploadPayload } from "@/api/types";
import { JobType, LeadType } from "@/constants/enums";
import type { UploadProgressHandler } from "@/shared/lib/uploadProgress";
import { withUploadProgress } from "@/shared/lib/uploadProgress";

import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";

function buildResourceFileFormData(
  contentTypeId: number,
  objectId: number | string,
  payload: FileUploadPayload
): FormData {
  const formData = new FormData();
  formData.append("file", payload.file);
  formData.append("content_type", String(contentTypeId));
  formData.append("object_id", String(objectId));
  formData.append("title", payload.title);
  formData.append("description", payload.description ?? "");
  return formData;
}

export class FilesService {
  // ============================================
  // JOB FILES (org-level FileViewSet)
  // ============================================

  static async getJobFiles(
    organizationId: string,
    _jobType: JobType,
    jobId: number | string
  ): Promise<FileAttachment[]> {
    const endpoint = API_ENDPOINTS.organizations.filesForJobs(organizationId);
    return apiClient.get<FileAttachment[]>(endpoint, {
      params: { id: jobId },
    });
  }

  static async uploadJobFile(
    organizationId: string,
    _jobType: JobType,
    jobId: number | string,
    contentTypeId: number,
    payload: FileUploadPayload,
    onProgress?: UploadProgressHandler
  ): Promise<FileAttachment> {
    const endpoint = API_ENDPOINTS.organizations.files(organizationId);
    const formData = buildResourceFileFormData(contentTypeId, jobId, payload);
    return apiClient.uploadFile<FileAttachment>(
      endpoint,
      formData,
      withUploadProgress(onProgress)
    );
  }

  static async deleteJobFile(
    organizationId: string,
    _jobType: JobType,
    _jobId: number | string,
    fileId: number | string
  ): Promise<void> {
    const endpoint = API_ENDPOINTS.organizations.fileDetail(
      organizationId,
      fileId
    );
    return apiClient.delete<void>(endpoint);
  }

  // ============================================
  // LEAD FILES (org-level FileViewSet; all lead types use leaditem)
  // ============================================

  static async getLeadFiles(
    organizationId: string,
    _leadType: LeadType,
    leadId: number | string
  ): Promise<FileAttachment[]> {
    const endpoint = API_ENDPOINTS.organizations.filesForLeads(organizationId);
    return apiClient.get<FileAttachment[]>(endpoint, {
      params: { id: leadId },
    });
  }

  static async uploadLeadFile(
    organizationId: string,
    _leadType: LeadType,
    leadId: number | string,
    contentTypeId: number,
    payload: FileUploadPayload,
    onProgress?: UploadProgressHandler
  ): Promise<FileAttachment> {
    const endpoint = API_ENDPOINTS.organizations.files(organizationId);
    const formData = buildResourceFileFormData(contentTypeId, leadId, payload);
    return apiClient.uploadFile<FileAttachment>(
      endpoint,
      formData,
      withUploadProgress(onProgress)
    );
  }

  static async deleteLeadFile(
    organizationId: string,
    _leadType: LeadType,
    _leadId: number | string,
    fileId: number | string
  ): Promise<void> {
    const endpoint = API_ENDPOINTS.organizations.fileDetail(
      organizationId,
      fileId
    );
    return apiClient.delete<void>(endpoint);
  }
}
