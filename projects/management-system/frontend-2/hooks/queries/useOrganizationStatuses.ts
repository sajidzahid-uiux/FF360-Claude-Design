import { useJobStatusMutations } from "../mutations/useJobStatusMutations";
import { useJobStatusesQuery } from "./useJobStatusesQuery";

/** Job statuses for kanban / filters (read + org-level mutations). */
export function useOrganizationStatuses({
  jobType,
}: { jobType?: string } = {}) {
  const statusesQuery = useJobStatusesQuery({ jobType });
  const { updateStatus, deleteStatus, addStatus } =
    useJobStatusMutations(jobType);

  return {
    ...statusesQuery,
    updateStatus,
    deleteStatus,
    addStatus,
  };
}
