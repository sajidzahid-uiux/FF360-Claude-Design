import type {
  CorePoint,
  CorePointCreatePayload,
  CorePointUpdatePayload,
  EquipmentHoursBreakdown,
  FinancialMachineAssignment,
  FinancialMachineAssignmentCreatePayload,
  FinancialMachineAssignmentUpdatePayload,
  Job,
  JobCreatePayload,
  JobEstimate,
  JobFinancial,
  JobFinancialUpdatePayload,
  JobListParams,
  JobMapUpdatePayload,
  JobResponse,
  JobUpdatePayload,
  PaginatedResponse,
} from "@/api/types";
import { JobType } from "@/constants/enums";
import {
  type MapFileType,
  buildMapUploadFormData,
} from "@/shared/lib/mapFilesV2";
import type { UploadProgressHandler } from "@/shared/lib/uploadProgress";
import { withUploadProgress } from "@/shared/lib/uploadProgress";

import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import { extractEntityFromPayload } from "../utils/extractEntityFromPayload";

export class JobsService {
  // ============================================
  // LIST / FETCH JOBS
  // ============================================

  static async getJobs(
    organizationId: string,
    params: JobListParams = {}
  ): Promise<PaginatedResponse<Job> | Job[]> {
    const endpoint = API_ENDPOINTS.organizations.jobs.list(organizationId);
    const queryString = apiClient.buildQueryString(params);
    return apiClient.get<PaginatedResponse<Job> | Job[]>(
      `${endpoint}${queryString}`
    );
  }

  static async getJobsByType(
    organizationId: string,
    jobType: JobType,
    params: JobListParams = {}
  ): Promise<Job[]> {
    const endpoint = API_ENDPOINTS.organizations.jobs.listByType(
      organizationId,
      jobType
    );
    const queryString = apiClient.buildQueryString(params);
    return apiClient.get<Job[]>(`${endpoint}${queryString}`);
  }

  static async getAllJobs(
    organizationId: string,
    params: JobListParams = {}
  ): Promise<Job[]> {
    const endpoint = API_ENDPOINTS.organizations.jobs.list(organizationId);
    const queryString = apiClient.buildQueryString(params);
    return apiClient.get<Job[]>(`${endpoint}${queryString}`);
  }

  static async getCompletedCancelledJobs(
    organizationId: string,
    params: JobListParams = {}
  ): Promise<Job[]> {
    const endpoint =
      API_ENDPOINTS.organizations.jobs.completedCancelled(organizationId);
    const queryString = apiClient.buildQueryString(params);
    return apiClient.get<Job[]>(`${endpoint}${queryString}`);
  }

  static async getJob(
    organizationId: string,
    jobType: JobType,
    jobId: number | string,
    isArchived: boolean = false,
    isTrashed: boolean = false
  ): Promise<Job> {
    const endpoint = API_ENDPOINTS.organizations.jobs.detail(
      organizationId,
      jobType,
      jobId
    );
    const queryString = isTrashed
      ? apiClient.buildQueryString({ trashed: true })
      : apiClient.buildQueryString({ archived: isArchived });
    return apiClient.get<Job>(`${endpoint}${queryString}`);
  }

  // ============================================
  // CREATE JOBS
  // ============================================

  static async createJob(
    organizationId: string,
    jobType: JobType,
    data: JobCreatePayload
  ): Promise<Job> {
    const endpoint = API_ENDPOINTS.organizations.jobs.create(
      organizationId,
      jobType
    );
    const response = await apiClient.post<JobResponse | Job>(endpoint, data);
    return extractEntityFromPayload<Job>(response, "job");
  }

  // ============================================
  // UPDATE JOBS
  // ============================================

  static async updateJob(
    organizationId: string,
    jobType: JobType,
    jobId: number | string,
    data: Partial<JobUpdatePayload>,
    notApproved: boolean = false
  ): Promise<Job> {
    const endpoint = API_ENDPOINTS.organizations.jobs.detail(
      organizationId,
      jobType,
      jobId
    );
    const queryString = notApproved ? "?not_approved=true" : "";
    return apiClient.patch<Job>(`${endpoint}${queryString}`, data);
  }

  static async updateJobMap(
    organizationId: string,
    jobId: number | string,
    data: JobMapUpdatePayload,
    jobType: JobType = JobType.TILING
  ): Promise<Job> {
    const endpoint = API_ENDPOINTS.organizations.jobs.detail(
      organizationId,
      jobType,
      jobId
    );
    return apiClient.patchMultipart<Job>(
      endpoint,
      buildMapUploadFormData(data as Record<string, unknown>)
    );
  }

  /**
   * PATCH job detail with multipart FormData (map files plus optional extra fields).
   * Matches legacy `addMapToJob` behavior.
   */
  static async patchJobWithMapPayload(
    organizationId: string,
    jobType: JobType,
    jobId: number | string,
    updatedJob: JobMapUpdatePayload,
    onProgress?: UploadProgressHandler
  ): Promise<Job> {
    const endpoint = API_ENDPOINTS.organizations.jobs.detail(
      organizationId,
      jobType,
      jobId
    );
    return apiClient.patchMultipart<Job>(
      endpoint,
      buildMapUploadFormData(updatedJob as Record<string, unknown>),
      withUploadProgress(onProgress)
    );
  }

  // ============================================
  // DELETE JOBS
  // ============================================

  static async deleteJob(
    organizationId: string,
    jobType: JobType,
    jobId: number | string
  ): Promise<void> {
    const endpoint = API_ENDPOINTS.organizations.jobs.detail(
      organizationId,
      jobType,
      jobId
    );
    return apiClient.delete<void>(endpoint);
  }

  static async trashJob(
    organizationId: string,
    jobType: JobType,
    jobId: number | string
  ): Promise<void> {
    const endpoint = API_ENDPOINTS.organizations.jobs.trash(
      organizationId,
      jobType,
      jobId
    );
    return apiClient.post<void>(endpoint);
  }

  static async permanentDeleteJob(
    organizationId: string,
    jobType: JobType,
    jobId: number | string
  ): Promise<unknown> {
    const endpoint = API_ENDPOINTS.organizations.jobs.permanentDelete(
      organizationId,
      jobType,
      jobId
    );
    return apiClient.post<unknown>(`${endpoint}?trashed=true`);
  }

  static async restoreJob(
    organizationId: string,
    jobType: JobType,
    jobId: number | string
  ): Promise<unknown> {
    const endpoint = API_ENDPOINTS.organizations.jobs.restore(
      organizationId,
      jobType,
      jobId
    );
    return apiClient.post<unknown>(`${endpoint}?trashed=true`);
  }

  // ============================================
  // ARCHIVE / UNARCHIVE
  // ============================================

  static async archiveJob(
    organizationId: string,
    jobType: JobType,
    jobId: number | string
  ): Promise<void> {
    const endpoint = API_ENDPOINTS.organizations.jobs.archive(
      organizationId,
      jobType,
      jobId
    );
    return apiClient.post<void>(endpoint, { object_id: jobId });
  }

  static async unarchiveJob(
    organizationId: string,
    jobType: JobType,
    jobId: number | string
  ): Promise<void> {
    const endpoint = API_ENDPOINTS.organizations.jobs.unarchive(
      organizationId,
      jobType,
      jobId
    );
    return apiClient.post<void>(`${endpoint}?archived=true`);
  }

  // ============================================
  // INVOICES
  // ============================================

  static async createInvoice(
    organizationId: string,
    jobType: JobType,
    jobId: number | string
  ): Promise<{ invoice: { id: number }; new_invoice?: { id: number } }> {
    const endpoint = API_ENDPOINTS.organizations.jobs.createInvoice(
      organizationId,
      jobType,
      jobId
    );
    return apiClient.post(endpoint);
  }

  static async getJobActiveInvoices(
    organizationId: string,
    jobId: number | string
  ): Promise<unknown[]> {
    const endpoint =
      API_ENDPOINTS.organizations.invoices.jobActiveInvoices(organizationId);
    const queryString = apiClient.buildQueryString({ job_id: jobId });
    return apiClient.get<unknown[]>(`${endpoint}${queryString}`);
  }

  // ============================================
  // MAP FILES
  // ============================================

  static async deleteMapFile(
    organizationId: string,
    jobType: JobType,
    jobId: number | string,
    fileType: MapFileType,
    mapId?: number | string
  ): Promise<void> {
    const endpoint = API_ENDPOINTS.organizations.jobs.deleteMapFile(
      organizationId,
      jobType,
      jobId,
      fileType,
      mapId
    );
    return apiClient.delete<void>(endpoint);
  }

  static async orderPipes(
    organizationId: string,
    jobId: number | string
  ): Promise<Job> {
    const endpoint = API_ENDPOINTS.organizations.jobs.orderPipes(
      organizationId,
      jobId
    );
    return apiClient.patch<Job>(endpoint);
  }

  // ============================================
  // CORE POINTS (Tiling Jobs Only)
  // ============================================

  static async getCorePoints(
    organizationId: string,
    jobId: number | string,
    params: { search?: string; page?: number; page_size?: number } = {}
  ): Promise<PaginatedResponse<CorePoint> | CorePoint[]> {
    const endpoint = API_ENDPOINTS.organizations.jobs.corePoints(
      organizationId,
      jobId
    );
    const queryString = apiClient.buildQueryString(params);
    return apiClient.get<PaginatedResponse<CorePoint> | CorePoint[]>(
      `${endpoint}${queryString}`
    );
  }

  static async getCorePoint(
    organizationId: string,
    jobId: number | string,
    coreId: number | string
  ): Promise<CorePoint> {
    const endpoint = API_ENDPOINTS.organizations.jobs.corePointDetail(
      organizationId,
      jobId,
      coreId
    );
    return apiClient.get<CorePoint>(endpoint);
  }

  static async createCorePoint(
    organizationId: string,
    jobId: number | string,
    data: CorePointCreatePayload
  ): Promise<CorePoint> {
    const endpoint = API_ENDPOINTS.organizations.jobs.corePoints(
      organizationId,
      jobId
    );
    return apiClient.post<CorePoint>(endpoint, data);
  }

  static async updateCorePoint(
    organizationId: string,
    jobId: number | string,
    coreId: number | string,
    data: CorePointUpdatePayload
  ): Promise<CorePoint> {
    const endpoint = API_ENDPOINTS.organizations.jobs.corePointDetail(
      organizationId,
      jobId,
      coreId
    );
    return apiClient.patch<CorePoint>(endpoint, data);
  }

  static async deleteCorePoint(
    organizationId: string,
    jobId: number | string,
    coreId: number | string
  ): Promise<void> {
    const endpoint = API_ENDPOINTS.organizations.jobs.corePointDetail(
      organizationId,
      jobId,
      coreId
    );
    return apiClient.delete<void>(endpoint);
  }

  // ============================================
  // ESTIMATE
  // ============================================
  static async getEstimate(
    organizationId: string,
    jobType: JobType,
    jobId: number | string
  ): Promise<JobEstimate> {
    const endpoint = API_ENDPOINTS.organizations.jobs.estimate(
      organizationId,
      jobType,
      jobId
    );
    return apiClient.get<JobEstimate>(endpoint);
  }

  static async updateJobEstimate(
    organizationId: string,
    jobType: JobType,
    jobId: number | string,
    estimateNumber: string | null
  ): Promise<unknown> {
    const endpoint = API_ENDPOINTS.organizations.jobs.estimate(
      organizationId,
      jobType,
      jobId
    );
    return apiClient.patch<unknown>(endpoint, {
      estimate_number: estimateNumber,
    });
  }

  // ============================================
  // JOB FINANCIALS
  // ============================================

  static async getJobFinancial(
    organizationId: string,
    jobType: JobType,
    jobId: number | string
  ): Promise<JobFinancial> {
    const endpoint = API_ENDPOINTS.organizations.jobs.financial(
      organizationId,
      jobType,
      jobId
    );
    return apiClient.get<JobFinancial>(endpoint);
  }

  static async updateJobFinancial(
    organizationId: string,
    jobType: JobType,
    jobId: number | string,
    financialId: number | string,
    data: JobFinancialUpdatePayload
  ): Promise<JobFinancial> {
    const endpoint = API_ENDPOINTS.organizations.jobs.financialDetail(
      organizationId,
      jobType,
      jobId,
      financialId
    );
    return apiClient.patch<JobFinancial>(endpoint, data);
  }

  // ============================================
  // FINANCIAL MACHINE ASSIGNMENTS
  // ============================================

  static async getFinancialMachineAssignments(
    organizationId: string,
    jobType: JobType,
    jobId: number | string
  ): Promise<FinancialMachineAssignment[]> {
    const endpoint = API_ENDPOINTS.organizations.jobs.financialMachines(
      organizationId,
      jobType,
      jobId
    );
    return apiClient.get<FinancialMachineAssignment[]>(endpoint);
  }

  static async createFinancialMachineAssignment(
    organizationId: string,
    jobType: JobType,
    jobId: number | string,
    data: FinancialMachineAssignmentCreatePayload
  ): Promise<FinancialMachineAssignment> {
    const endpoint = API_ENDPOINTS.organizations.jobs.financialMachines(
      organizationId,
      jobType,
      jobId
    );
    return apiClient.post<FinancialMachineAssignment>(endpoint, data);
  }

  static async updateFinancialMachineAssignment(
    organizationId: string,
    jobType: JobType,
    jobId: number | string,
    assignmentId: number | string,
    data: FinancialMachineAssignmentUpdatePayload
  ): Promise<FinancialMachineAssignment> {
    const endpoint = API_ENDPOINTS.organizations.jobs.financialMachineDetail(
      organizationId,
      jobType,
      jobId,
      assignmentId
    );
    return apiClient.patch<FinancialMachineAssignment>(endpoint, data);
  }

  static async deleteFinancialMachineAssignment(
    organizationId: string,
    jobType: JobType,
    jobId: number | string,
    assignmentId: number | string
  ): Promise<void> {
    const endpoint = API_ENDPOINTS.organizations.jobs.financialMachineDetail(
      organizationId,
      jobType,
      jobId,
      assignmentId
    );
    return apiClient.delete<void>(endpoint);
  }

  static async getEquipmentHoursBreakdown(
    organizationId: string,
    jobId: number | string
  ): Promise<EquipmentHoursBreakdown> {
    const endpoint = API_ENDPOINTS.organizations.jobs.equipmentHoursBreakdown(
      organizationId,
      jobId
    );
    return apiClient.get<EquipmentHoursBreakdown>(endpoint);
  }
}
