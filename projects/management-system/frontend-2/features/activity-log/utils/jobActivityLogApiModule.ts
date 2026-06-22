import type { Job } from "@/api/types/jobs";
import { ActivityLogModule, type JobActivityLogModule } from "@/constants";

/**
 * Chooses activity-log `module` for job detail: `co_ca` when cancelled or status
 * title is Completed (case-insensitive). When `job_status` is only an id, pass
 * the resolved display title via `resolvedStatusTitle` (from org statuses).
 */
export function jobActivityLogApiModule(
  job: Pick<Job, "cancelled" | "job_status">,
  resolvedStatusTitle?: string
): JobActivityLogModule {
  const embedded =
    job.job_status &&
    typeof job.job_status === "object" &&
    "title" in job.job_status
      ? String((job.job_status as { title?: string }).title ?? "").trim()
      : "";
  const title = (resolvedStatusTitle?.trim() || embedded).trim();
  if (job.cancelled === true) return ActivityLogModule.COMPLETED_CANCELED;
  if (title.toLowerCase() === "completed") {
    return ActivityLogModule.COMPLETED_CANCELED;
  }
  return ActivityLogModule.JOB;
}
