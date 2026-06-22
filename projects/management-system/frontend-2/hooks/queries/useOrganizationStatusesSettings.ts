import { useJobStatusSettingsMutations } from "../mutations/useJobStatusMutations";
import { useJobStatusesSettingsQuery } from "./useJobStatusesSettingsQuery";

export function useOrganizationStatusesSettings({
  jobType,
}: {
  jobType?: string;
} = {}) {
  const statusesQuery = useJobStatusesSettingsQuery({ jobType });
  const { updateStatus, deleteStatus, addStatus } =
    useJobStatusSettingsMutations(jobType);

  return {
    ...statusesQuery,
    updateStatus,
    deleteStatus,
    addStatus,
  };
}
