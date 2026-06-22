import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { InstalledFootageLogsService } from "@/api/services";
import type {
  DeleteInstalledFootageLogArgs,
  UpdateInstalledFootageLogArgs,
} from "@/api/types/installedFootageLogs";
import { QUERY_KEYS } from "@/constants";
import { getErrorMessage } from "@/utils/apiError";

import { INSTALLED_FOOTAGE_LOGS_QUERY_KEY } from "../queries/installedFootageLogsQueryKeys";
import { invalidateJobActivityLogs } from "../queries/invalidateActivityLogs";
import { useRouteIds } from "../useRouteIds";

export function useInstalledFootageLogMutations(
  jobId: number | undefined,
  options?: { onMutationSuccess?: () => void }
) {
  const queryClient = useQueryClient();
  const { orgId } = useRouteIds();

  const updateLog = useMutation({
    mutationFn: async (args: UpdateInstalledFootageLogArgs) => {
      const { logType, id, body } = args;
      if (!orgId || jobId == null) throw new Error("Missing org or job");
      return InstalledFootageLogsService.updateInstalledFootageLog(
        orgId,
        jobId,
        logType,
        id,
        body
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [INSTALLED_FOOTAGE_LOGS_QUERY_KEY],
      });
      options?.onMutationSuccess?.();
      queryClient.invalidateQueries({ queryKey: ["job"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] });
      if (jobId != null) {
        invalidateJobActivityLogs(queryClient, orgId, jobId);
      }
      toast.success("Installed footage log updated");
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, "Failed to update installed footage log")
      );
    },
  });

  const deleteLog = useMutation({
    mutationFn: async (args: DeleteInstalledFootageLogArgs) => {
      const { logType, id } = args;
      if (!orgId || jobId == null) throw new Error("Missing org or job");
      return InstalledFootageLogsService.deleteInstalledFootageLog(
        orgId,
        jobId,
        logType,
        id
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [INSTALLED_FOOTAGE_LOGS_QUERY_KEY],
      });
      options?.onMutationSuccess?.();
      queryClient.invalidateQueries({ queryKey: ["job"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] });
      if (jobId != null) {
        invalidateJobActivityLogs(queryClient, orgId, jobId);
      }
      toast.success(data?.message ?? "Installed footage log deleted");
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, "Failed to delete installed footage log")
      );
    },
  });

  return { updateLog, deleteLog };
}
