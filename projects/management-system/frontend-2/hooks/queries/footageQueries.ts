import { useQuery } from "@tanstack/react-query";

import { FootageService } from "@/api/services";
import type { FootageAllJobsApiRow, FootageAllJobsParams } from "@/api/types";
import { buildFormattedFootageTableData } from "@/features/footage";

import { useRouteIds } from "../useRouteIds";
import {
  FOOTAGE_ALL_JOBS_QUERY_KEY,
  FOOTAGE_TOTAL_QUERY_KEY,
} from "./footageQueryKeys";

/**
 * Fetches the aggregated all-jobs footage list from the backend.
 * Year/month/crew and `sort_order` are applied server-side.
 */
export function useAllFootage(params: FootageAllJobsParams = {}) {
  const { orgId } = useRouteIds();

  return useQuery({
    queryKey: [
      FOOTAGE_ALL_JOBS_QUERY_KEY,
      orgId,
      params.year,
      params.month,
      params.crewMembers,
      params.crewGroups,
      params.includeArchived,
      params.sortOrder,
    ],
    queryFn: async () => {
      const rows = await FootageService.getAllJobs(orgId!, params);
      return buildFormattedFootageTableData(rows as FootageAllJobsApiRow[]);
    },
    placeholderData: (previousData) => previousData,
    staleTime: 0,
    refetchOnMount: "always",
    enabled: !!orgId,
  });
}

/** Fetches organisation-wide footage totals (used for the donut charts). */
export function useTotalFootage() {
  const { orgId } = useRouteIds();

  return useQuery({
    queryKey: [FOOTAGE_TOTAL_QUERY_KEY, orgId],
    queryFn: () => FootageService.getTotalFootage(orgId!),
    enabled: !!orgId,
  });
}
