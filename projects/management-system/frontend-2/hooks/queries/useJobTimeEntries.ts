import { useQuery } from "@tanstack/react-query";

import { JobTimeEntriesService } from "@/api/services";
import { JobType, jobTypeToJobLeadTypeSegment } from "@/constants";
import { mapTimeEntriesToInstalledHoursRows } from "@/features/jobs/installed-hours-log/mapTimeEntriesToRows";

import { useRouteIds } from "../useRouteIds";
import { JOB_TIME_ENTRIES_QUERY_KEY } from "./timeTrackingQueryKeys";

/** Backend `job_type` for job-time-entries API (POST/GET). */
export function jobTypeToTimeEntryApiParam(
  jobType: JobType
): ReturnType<typeof jobTypeToJobLeadTypeSegment> {
  return jobTypeToJobLeadTypeSegment(jobType);
}

export const JOB_TIME_ENTRIES_PREVIEW_PAGE_SIZE = 5;

export interface JobTimeEntriesPreviewData {
  rows: ReturnType<typeof mapTimeEntriesToInstalledHoursRows>;
  totalCount: number;
  totalPages: number;
  pageSize: number;
}

/**
 * First page of installed hours (time entries) for a job — used for on-site preview.
 */
export function useJobTimeEntries(
  jobId: number | undefined,
  jobType: JobType,
  options?: { pageSize?: number }
) {
  const { orgId } = useRouteIds();
  const apiJobType = jobTypeToTimeEntryApiParam(jobType);
  const pageSize = options?.pageSize ?? JOB_TIME_ENTRIES_PREVIEW_PAGE_SIZE;

  return useQuery({
    queryKey: [
      JOB_TIME_ENTRIES_QUERY_KEY,
      orgId,
      jobId,
      apiJobType,
      1,
      pageSize,
    ],
    queryFn: async (): Promise<JobTimeEntriesPreviewData> => {
      const page = await JobTimeEntriesService.listJobTimeEntriesPage(orgId!, {
        job_id: jobId!,
        job_type: apiJobType,
        page: 1,
        page_size: pageSize,
      });
      return {
        rows: mapTimeEntriesToInstalledHoursRows(page.results),
        totalCount: page.totalCount,
        totalPages: page.totalPages,
        pageSize: page.pageSize,
      };
    },
    enabled: Boolean(orgId && jobId != null),
  });
}

const MODAL_PAGE_SIZE = 100;

export function useJobTimeEntriesModalPage(
  jobId: number | undefined,
  jobType: JobType,
  page: number,
  enabled: boolean
) {
  const { orgId } = useRouteIds();
  const apiJobType = jobTypeToTimeEntryApiParam(jobType);

  return useQuery({
    queryKey: [
      JOB_TIME_ENTRIES_QUERY_KEY,
      orgId,
      jobId,
      apiJobType,
      "modal",
      page,
      MODAL_PAGE_SIZE,
    ],
    queryFn: async () => {
      return JobTimeEntriesService.listJobTimeEntriesPage(orgId!, {
        job_id: jobId!,
        job_type: apiJobType,
        page,
        page_size: MODAL_PAGE_SIZE,
      });
    },
    enabled: Boolean(orgId && jobId != null && enabled),
  });
}
