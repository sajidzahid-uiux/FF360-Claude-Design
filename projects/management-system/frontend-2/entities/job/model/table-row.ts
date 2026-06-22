import type { Job, JobStatus } from "@/api/types";

/**
 * Job row in list/table views — API may send `job_status` as id or object.
 */
export type JobTableRow = Omit<Job, "job_status"> & {
  job_status?: JobStatus | number | null;
};
