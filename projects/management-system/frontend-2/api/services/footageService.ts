import {
  type AddDailyProgressLateralBody,
  type AddDailyProgressMainBody,
  type AddDailyProgressRaisersBody,
  type FootageAllJobsApiRow,
  type FootageAllJobsParams,
  type FootageComment,
  type FootageCommentMutationResponse,
  type FootageDailyProgressLateralResponse,
  type FootageDailyProgressMainResponse,
  type FootageDailyProgressRaisersResponse,
  type FootageExcelData,
  type FootageJobData,
  type FootageOrganizationTotals,
  SortOrder,
} from "@/api/types";
import {
  type FootageCrewFilterSelections,
  parseFootageCrewFilterSelections,
} from "@/shared/lib/footage/parseCrewFilterSelections";
import {
  type FilterState,
  FilterType,
} from "@/shared/ui/common/filter/model/types";

import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toInt(v: unknown): number | null {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function firstFilterString(v: unknown): string | null {
  return Array.isArray(v) && v.length > 0 ? String(v[0]) : null;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export class FootageService {
  /**
   * Maps filters and Sort-by-date (`desc` = newest first, `asc` = oldest first)
   * into `FootageAllJobsParams` for `sort_order`.
   */
  static buildAllJobsParams(
    filters: FilterState,
    dateSort: string
  ): FootageAllJobsParams {
    const rawCrew = filters[FilterType.FOOTAGE_CREW];
    const crewSelections = Array.isArray(rawCrew)
      ? (rawCrew as FootageCrewFilterSelections)
      : undefined;
    const { crewMembers, crewGroups } =
      parseFootageCrewFilterSelections(crewSelections);

    const yearStr = firstFilterString(filters[FilterType.FOOTAGE_YEAR]);
    const monthStr = firstFilterString(filters[FilterType.FOOTAGE_DATE]);

    let year: number | undefined;
    let month: number | undefined;

    const parsedYear = yearStr != null ? toInt(yearStr) : null;
    if (parsedYear != null) {
      year = parsedYear;
    }

    const parsedMonth = monthStr != null ? toInt(monthStr) : null;
    if (parsedMonth != null && parsedMonth >= 1 && parsedMonth <= 12) {
      month = parsedMonth;
      if (year == null) {
        year = new Date().getFullYear();
      }
    }

    return {
      year,
      month,
      crewMembers:
        crewMembers.length > 0 ? [...new Set(crewMembers)] : undefined,
      crewGroups: crewGroups.length > 0 ? [...new Set(crewGroups)] : undefined,
      includeArchived: true,
      sortOrder: dateSort === SortOrder.ASC ? SortOrder.ASC : SortOrder.DESC,
    };
  }

  /** GET .../footage-page/all_jobs/ — aggregated list of all tiling jobs */
  static async getAllJobs(
    orgId: string,
    params: FootageAllJobsParams = {}
  ): Promise<FootageAllJobsApiRow[]> {
    const qs = apiClient.buildQueryString({
      include_archived: params.includeArchived !== false,
      sort_order: params.sortOrder ?? "desc",
      year: params.year,
      month: params.month,
      crew_member: params.crewMembers,
      crew_group: params.crewGroups,
    });
    return apiClient.get<FootageAllJobsApiRow[]>(
      `${API_ENDPOINTS.organizations.footagePage.allJobs(orgId)}${qs}`
    );
  }

  /** GET .../footage-page/all/ — organisation-wide footage totals */
  static async getTotalFootage(
    orgId: string
  ): Promise<FootageOrganizationTotals> {
    return apiClient.get<FootageOrganizationTotals>(
      `${API_ENDPOINTS.organizations.footagePage.all(orgId)}?include_archived=true`
    );
  }

  /** GET .../footage-page/{jobId}/ — detailed footage stats for one job */
  static async getJobFootagePage(
    orgId: string,
    jobId: number | string
  ): Promise<FootageJobData> {
    return apiClient.get<FootageJobData>(
      API_ENDPOINTS.organizations.footagePage.job(orgId, jobId)
    );
  }

  /** GET .../daily-progress/{jobId}/excel/ */
  static async getExcelFile(
    orgId: string,
    jobId: number | string
  ): Promise<FootageExcelData> {
    return apiClient.get<FootageExcelData>(
      API_ENDPOINTS.organizations.dailyProgress.excel(orgId, jobId)
    );
  }

  /** POST .../daily-progress/{jobId}/lateral/ */
  static async addDailyProgressLateral(
    orgId: string,
    jobId: number | string,
    data: AddDailyProgressLateralBody
  ): Promise<FootageDailyProgressLateralResponse> {
    return apiClient.post<FootageDailyProgressLateralResponse>(
      API_ENDPOINTS.organizations.dailyProgress.lateral(orgId, jobId),
      data
    );
  }

  /** POST .../daily-progress/{jobId}/main/ */
  static async addDailyProgressMain(
    orgId: string,
    jobId: number | string,
    data: AddDailyProgressMainBody
  ): Promise<FootageDailyProgressMainResponse> {
    return apiClient.post<FootageDailyProgressMainResponse>(
      API_ENDPOINTS.organizations.dailyProgress.main(orgId, jobId),
      data
    );
  }

  /** POST .../daily-progress/{jobId}/raisers/ */
  static async addDailyProgressRaisers(
    orgId: string,
    jobId: number | string,
    data: AddDailyProgressRaisersBody
  ): Promise<FootageDailyProgressRaisersResponse> {
    return apiClient.post<FootageDailyProgressRaisersResponse>(
      API_ENDPOINTS.organizations.dailyProgress.raisers(orgId, jobId),
      data
    );
  }

  /**
   * POST .../comments/ — add a footage comment.
   * contentTypeId must be resolved by the caller via the content_types mapping.
   */
  static async addComment(
    orgId: string,
    jobId: number,
    contentTypeId: number,
    text: string
  ): Promise<FootageCommentMutationResponse> {
    const formData = new FormData();
    formData.append("content_type", contentTypeId.toString());
    formData.append("object_id", jobId.toString());
    formData.append("text", text);
    formData.append("comment_flag", "F");
    return apiClient.uploadFile<FootageCommentMutationResponse>(
      API_ENDPOINTS.organizations.footagePage.comments(orgId),
      formData
    );
  }

  /**
   * POST .../comments/get_comments/ — fetch comments for a job.
   * contentTypeId must be resolved by the caller.
   */
  static async getComments(
    orgId: string,
    jobId: number,
    contentTypeId: number
  ): Promise<FootageComment[]> {
    const formData = new FormData();
    formData.append("content_type", contentTypeId.toString());
    formData.append("object_id", jobId.toString());
    return apiClient.uploadFile<FootageComment[]>(
      API_ENDPOINTS.organizations.footagePage.commentsGet(orgId),
      formData
    );
  }

  /**
   * PATCH .../comments/{commentId}/ — update a footage comment.
   * contentTypeId must be resolved by the caller.
   */
  static async updateComment(
    orgId: string,
    commentId: number,
    jobId: number,
    contentTypeId: number,
    text: string
  ): Promise<FootageCommentMutationResponse> {
    const formData = new FormData();
    formData.append("content_type", contentTypeId.toString());
    formData.append("object_id", jobId.toString());
    formData.append("text", text);
    formData.append("comment_flag", "F");
    return apiClient.uploadFile<FootageCommentMutationResponse>(
      API_ENDPOINTS.organizations.footagePage.commentDetail(orgId, commentId),
      formData
    );
  }
}
