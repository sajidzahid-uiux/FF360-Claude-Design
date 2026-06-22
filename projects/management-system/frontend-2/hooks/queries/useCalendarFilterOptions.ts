import { useJobStatusesQuery } from "./useJobStatusesQuery";
import { useLeadStatusesQuery } from "./useLeadStatusesQuery";
import { useLeadTypesQuery } from "./useLeadTypesQuery";
import { useProjectTypesQuery } from "./useProjectTypesQuery";

interface UseCalendarFilterOptionsArgs {
  enabled?: boolean;
}

export function useCalendarFilterOptions({
  enabled = true,
}: UseCalendarFilterOptionsArgs = {}) {
  const jobStatuses = useJobStatusesQuery({ enabled });
  const leadStatuses = useLeadStatusesQuery({ enabled });
  const leadSources = useLeadTypesQuery({ enabled });
  const projectTypes = useProjectTypesQuery({ enabled });

  return {
    jobStatuses: jobStatuses.data ?? [],
    leadStatuses: leadStatuses.data ?? [],
    leadSources: leadSources.data ?? [],
    projectTypes: projectTypes.data ?? [],
    isLoading:
      jobStatuses.isLoading ||
      leadStatuses.isLoading ||
      leadSources.isLoading ||
      projectTypes.isLoading,
    isError:
      jobStatuses.isError ||
      leadStatuses.isError ||
      leadSources.isError ||
      projectTypes.isError,
  };
}
