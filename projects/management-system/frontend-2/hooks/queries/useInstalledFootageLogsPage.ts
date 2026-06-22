import { useQuery } from "@tanstack/react-query";

import { InstalledFootageLogsService } from "@/api/services";
import type {
  InstalledFootageLogType,
  PaginatedInstalledFootageLogs,
} from "@/api/types/installedFootageLogs";

import { useRouteIds } from "../useRouteIds";
import { INSTALLED_FOOTAGE_LOGS_QUERY_KEY } from "./installedFootageLogsQueryKeys";

export const INSTALLED_FOOTAGE_LOGS_MODAL_PAGE_SIZE = 100;

export function useInstalledFootageLogsPage(
  jobId: number | undefined,
  logType: InstalledFootageLogType,
  page: number,
  enabled: boolean
) {
  const { orgId } = useRouteIds();

  return useQuery<PaginatedInstalledFootageLogs>({
    queryKey: [
      INSTALLED_FOOTAGE_LOGS_QUERY_KEY,
      orgId,
      jobId,
      logType,
      "paged",
      page,
      INSTALLED_FOOTAGE_LOGS_MODAL_PAGE_SIZE,
    ],
    queryFn: () =>
      InstalledFootageLogsService.listInstalledFootageLogs(orgId!, jobId!, {
        page,
        page_size: INSTALLED_FOOTAGE_LOGS_MODAL_PAGE_SIZE,
        log_type: logType,
      }),
    enabled: Boolean(orgId && jobId != null && enabled),
  });
}
