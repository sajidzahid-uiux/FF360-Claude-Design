import type {
  InstalledFootageLogType,
  PaginatedInstalledFootageLogs,
  UpdateInstalledFootageLogBody,
  UpdateInstalledFootageLogResponse,
} from "@/api/types/installedFootageLogs";

import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";

/** API list returns `id` as `"<logType>:<pk>"`; detail URLs must use only the numeric pk. */
function numericPkForLogDetail(
  logType: InstalledFootageLogType,
  id: number | string
): number {
  if (typeof id === "number" && Number.isFinite(id)) {
    return id;
  }
  const s = String(id).trim();
  const withPrefix = `${logType}:`;
  if (s.startsWith(withPrefix)) {
    const n = parseInt(s.slice(withPrefix.length), 10);
    if (!Number.isNaN(n)) return n;
  }
  const colon = s.lastIndexOf(":");
  if (colon >= 0) {
    const n = parseInt(s.slice(colon + 1), 10);
    if (!Number.isNaN(n)) return n;
  }
  const n = parseInt(s, 10);
  if (Number.isNaN(n)) {
    throw new Error(`Invalid installed footage log id: ${id}`);
  }
  return n;
}

export interface ListInstalledFootageLogsParams {
  page?: number;
  page_size?: number;
  /** When supported by API, filters results to one type */
  log_type?: InstalledFootageLogType;
}

export class InstalledFootageLogsService {
  static async listInstalledFootageLogs(
    organizationId: string,
    jobId: number | string,
    params: ListInstalledFootageLogsParams = {}
  ): Promise<PaginatedInstalledFootageLogs> {
    const base = API_ENDPOINTS.organizations.dailyProgress.logs(
      organizationId,
      jobId
    );
    const qs = apiClient.buildQueryString({
      page: params.page ?? 1,
      page_size: params.page_size ?? 5,
      ...(params.log_type && { log_type: params.log_type }),
    });
    return apiClient.get<PaginatedInstalledFootageLogs>(`${base}${qs}`);
  }

  static async updateInstalledFootageLog(
    organizationId: string,
    jobId: number | string,
    logType: InstalledFootageLogType,
    id: number | string,
    body: UpdateInstalledFootageLogBody
  ): Promise<UpdateInstalledFootageLogResponse> {
    const pk = numericPkForLogDetail(logType, id);
    const url = API_ENDPOINTS.organizations.dailyProgress.logDetail(
      organizationId,
      jobId,
      logType,
      pk
    );
    return apiClient.patch<UpdateInstalledFootageLogResponse>(url, body);
  }

  static async deleteInstalledFootageLog(
    organizationId: string,
    jobId: number | string,
    logType: InstalledFootageLogType,
    id: number | string
  ): Promise<{ message?: string }> {
    const pk = numericPkForLogDetail(logType, id);
    const url = API_ENDPOINTS.organizations.dailyProgress.logDetail(
      organizationId,
      jobId,
      logType,
      pk
    );
    return apiClient.delete<{ message?: string }>(url);
  }
}
