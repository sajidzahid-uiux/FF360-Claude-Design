import { useInfiniteQuery } from "@tanstack/react-query";

import { InstalledFootageLogsService } from "@/api/services";
import type { InstalledFootageLogType } from "@/api/types/installedFootageLogs";

import { useRouteIds } from "../useRouteIds";
import { INSTALLED_FOOTAGE_LOGS_QUERY_KEY } from "./installedFootageLogsQueryKeys";

const PAGE_SIZE = 5;

export function useInstalledFootageLogs(
  jobId: number | undefined,
  logType: InstalledFootageLogType
) {
  const { orgId } = useRouteIds();

  return useInfiniteQuery({
    queryKey: [INSTALLED_FOOTAGE_LOGS_QUERY_KEY, orgId, jobId, logType],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      return InstalledFootageLogsService.listInstalledFootageLogs(
        orgId!,
        jobId!,
        {
          page: pageParam as number,
          page_size: PAGE_SIZE,
          log_type: logType,
        }
      );
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage?.next) return undefined;
      return allPages.length + 1;
    },
    enabled: Boolean(orgId && jobId != null),
  });
}
