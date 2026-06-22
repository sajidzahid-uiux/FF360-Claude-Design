import { useLeadTypeMutations } from "../mutations/useLeadTypeMutations";
import { useLeadTypesQuery } from "./useLeadTypesQuery";

/** Lead types / sources for forms and kanban (read + org-level mutations). */
export function useLeadTypes() {
  const typesQuery = useLeadTypesQuery();
  const { updateLeadType, deleteLeadType, addLeadType } =
    useLeadTypeMutations();

  return {
    ...typesQuery,
    updateLeadType,
    deleteLeadType,
    addLeadType,
  };
}

export default useLeadTypes;
