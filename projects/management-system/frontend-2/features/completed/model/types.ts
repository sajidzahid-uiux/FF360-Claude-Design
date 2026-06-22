import type { Job } from "@/api/types";
import type { CompletedJobPermissionFlags } from "@/hooks/permissions";

/** Completed/cancelled job row: API job + display username + client permission flags. */
export type TransformedJob = Omit<Job, "last_updated_by"> & {
  last_updated_by: string | undefined;
  job_object_subclass: string;
  permissions: CompletedJobPermissionFlags;
};
