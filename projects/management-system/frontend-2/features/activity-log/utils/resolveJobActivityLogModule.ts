import type { Job } from "@/api/types/jobs";
import {
  ActivityLogModule,
  type JobActivityLogModule,
  JobOrLeadType,
  JobType,
} from "@/constants";

import { jobActivityLogApiModule } from "./jobActivityLogApiModule";

export function jobTypeToStatusesApiLetter(jobType: JobType): JobOrLeadType {
  if (jobType === JobType.TILING) return JobOrLeadType.TILING;
  if (jobType === JobType.EXCAVATION) return JobOrLeadType.EXCAVATION;
  return JobOrLeadType.REPAIR;
}

/**
 * Display title for the job's current status: nested `job_status.title`, or
 * lookup by id when the API returns `job_status` as a number / `{ id }` only.
 */
export function resolveJobStatusTitleForActivityLog(
  job: Pick<Job, "job_status"> | null | undefined,
  orgStatuses: unknown[] | undefined
): string {
  const js = job?.job_status as unknown;
  if (js != null && typeof js === "object" && "title" in (js as object)) {
    return String((js as { title?: string }).title ?? "").trim();
  }
  const statusId =
    typeof js === "number"
      ? js
      : js != null &&
          typeof js === "object" &&
          "id" in (js as object) &&
          typeof (js as { id: unknown }).id === "number"
        ? (js as { id: number }).id
        : undefined;
  if (statusId == null || !Array.isArray(orgStatuses)) return "";
  const row = orgStatuses.find((s) => {
    const id =
      s != null && typeof s === "object" && "id" in s
        ? (s as { id?: number }).id
        : undefined;
    return Number(id) === Number(statusId);
  });
  if (row == null || typeof row !== "object" || !("title" in row)) return "";
  return String((row as { title?: string }).title ?? "").trim();
}

/** Activity-log `module` query param for the job activity log page. */
export function resolveActivityLogModuleForJobPage(opts: {
  fromCompleted: boolean;
  job: Pick<Job, "cancelled" | "job_status"> | null | undefined;
  orgStatuses: unknown[] | undefined;
}): JobActivityLogModule {
  if (opts.fromCompleted) return ActivityLogModule.COMPLETED_CANCELED;
  if (!opts.job) return ActivityLogModule.JOB;
  const resolvedTitle = resolveJobStatusTitleForActivityLog(
    opts.job,
    opts.orgStatuses
  );
  return jobActivityLogApiModule(opts.job, resolvedTitle);
}
