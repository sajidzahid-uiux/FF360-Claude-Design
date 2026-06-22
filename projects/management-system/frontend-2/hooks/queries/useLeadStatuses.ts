import { useLeadStatusMutations } from "../mutations/useLeadStatusMutations";
import { useLeadStatusesQuery } from "./useLeadStatusesQuery";

/** Lead statuses for kanban / filters (read + org-level mutations). */
export function useLeadStatuses() {
  const statusesQuery = useLeadStatusesQuery();
  const { updateLeadStatus, deleteLeadStatus, addLeadStatus } =
    useLeadStatusMutations();

  return {
    ...statusesQuery,
    updateLeadStatus,
    deleteLeadStatus,
    addLeadStatus,
  };
}

export default useLeadStatuses;
