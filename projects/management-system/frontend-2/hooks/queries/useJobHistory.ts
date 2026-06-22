import { useQuery } from "@tanstack/react-query";

import { ContactsService } from "@/api/services";
import type { JobHistoryItem } from "@/api/types";
import { CACHE_TIME, QUERY_KEYS } from "@/constants";
import { useJobAssignedToQueryParam } from "@/features/jobs/model/job-assigned-to-filter-store";

import { useRouteIds } from "../useRouteIds";

export const useJobHistory = (contactId: number | null) => {
  const { orgId: organizationId } = useRouteIds();
  const assignedTo = useJobAssignedToQueryParam();

  const jobHistoryQuery = useQuery<JobHistoryItem[]>({
    queryKey: [QUERY_KEYS.JOB_HISTORY, organizationId, contactId, assignedTo],
    queryFn: async () => {
      if (!organizationId || !contactId) {
        throw new Error("Organization ID and Contact ID are required");
      }

      return ContactsService.getJobHistory(organizationId, contactId, {
        ...(assignedTo !== undefined ? { assigned_to: assignedTo } : {}),
      });
    },
    enabled: !!organizationId && !!contactId,
    placeholderData: (previousData) => previousData,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });

  return {
    ...jobHistoryQuery,
  };
};
