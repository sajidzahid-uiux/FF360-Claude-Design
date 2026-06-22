import type {
  JobTimeEntriesListPageResult,
  TimeEntryPayload,
  TimeEntryResponse,
} from "@/api/types/jobTimeEntries";
import { normalizeJobTimeEntriesPage } from "@/shared/lib/job-time-entries/normalizeJobTimeEntriesPage";

import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";

export interface ListJobTimeEntriesPageParams {
  job_id: number;
  job_type: string;
  page?: number;
  page_size?: number;
}

export class JobTimeEntriesService {
  /**
   * Lists job time entries with explicit pagination (required for
   * `JobTimeEntryViewSet` when `always_paginate` is enabled).
   */
  static async listJobTimeEntriesPage(
    organizationId: string,
    params: ListJobTimeEntriesPageParams
  ): Promise<JobTimeEntriesListPageResult> {
    const page = params.page ?? 1;
    const pageSize = params.page_size ?? 20;
    const base =
      API_ENDPOINTS.organizations.jobTimeEntries.list(organizationId);
    const qs = apiClient.buildQueryString({
      job_id: params.job_id,
      job_type: params.job_type,
      page,
      page_size: pageSize,
    });
    const raw = await apiClient.get<unknown>(`${base}${qs}`);
    return normalizeJobTimeEntriesPage(raw, page, pageSize);
  }

  static async createJobTimeEntry(
    organizationId: string,
    payload: TimeEntryPayload
  ): Promise<TimeEntryResponse> {
    const url = API_ENDPOINTS.organizations.jobTimeEntries.list(organizationId);
    return apiClient.post<TimeEntryResponse>(url, {
      job_id: payload.job_id,
      job_type: payload.job_type,
      hours: payload.hours,
      ...(payload.description && { description: payload.description }),
    });
  }

  static async updateJobTimeEntry(
    organizationId: string,
    id: number,
    body: { hours: number; description?: string | null }
  ): Promise<void> {
    const url = API_ENDPOINTS.organizations.jobTimeEntries.detail(
      organizationId,
      id
    );
    await apiClient.patch(url, {
      hours: body.hours,
      ...(body.description !== undefined && { description: body.description }),
    });
  }

  static async deleteJobTimeEntry(
    organizationId: string,
    id: number
  ): Promise<void> {
    const url = API_ENDPOINTS.organizations.jobTimeEntries.detail(
      organizationId,
      id
    );
    await apiClient.delete(url);
  }
}
