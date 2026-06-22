import {
  type QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { JobsService } from "@/api/services/jobsService";
import { LeadsService } from "@/api/services/leadsService";
import type {
  DeleteMapFileVariables,
  UploadMapFilesVariables,
} from "@/api/types/map";
import { JobType, LeadType, QUERY_KEYS, ResourceType } from "@/constants";
import { getMapV2FieldKeyForType } from "@/shared/lib/mapFilesV2";
import { getErrorMessage } from "@/utils/apiError";

import {
  invalidateJobActivityLogs,
  invalidateLeadActivityLogs,
} from "../queries/invalidateActivityLogs";
import { useRouteIds } from "../useRouteIds";

export type { DeleteMapFileVariables, UploadMapFilesVariables };

function invalidateJobMapCaches(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] });
  void queryClient.invalidateQueries({ queryKey: ["job"] });
  void queryClient.invalidateQueries({ queryKey: ["jobHistory"] });
  void queryClient.invalidateQueries({ queryKey: ["mapDataV2"] });
}

function invalidateLeadMapCaches(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LEADS] });
  void queryClient.invalidateQueries({ queryKey: ["leads"] });
  void queryClient.invalidateQueries({ queryKey: ["lead"] });
  void queryClient.invalidateQueries({ queryKey: ["mapDataV2"] });
}

export function useDeleteMapFile() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async (variables: DeleteMapFileVariables) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }

      const { entityType, id, fileType, mapId } = variables;

      if (entityType === ResourceType.JOB) {
        return JobsService.deleteMapFile(
          organizationId,
          variables.jobType ?? JobType.TILING,
          id,
          fileType,
          mapId
        );
      }

      return LeadsService.deleteMapFile(
        organizationId,
        variables.leadType ?? LeadType.TILING,
        id,
        fileType,
        mapId
      );
    },
    onSuccess: (_, variables) => {
      if (variables.entityType === ResourceType.JOB) {
        invalidateJobMapCaches(queryClient);
        if (organizationId) {
          invalidateJobActivityLogs(queryClient, organizationId, variables.id);
        }
        return;
      }

      invalidateLeadMapCaches(queryClient);
      if (organizationId) {
        invalidateLeadActivityLogs(queryClient, organizationId, variables.id);
      }
    },
    onError: (error: unknown, variables) => {
      const fallback =
        variables.entityType === ResourceType.JOB
          ? "Failed to delete map file"
          : `Failed to delete ${variables.fileType.toUpperCase()} map`;
      toast.error(getErrorMessage(error, fallback));
    },
  });
}

export function useUploadMapFiles() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async (variables: UploadMapFilesVariables) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }

      const mapField = getMapV2FieldKeyForType(variables.fileType);
      const payload = { [mapField]: variables.files };
      const { onProgress } = variables;

      if (variables.entityType === ResourceType.JOB) {
        return JobsService.patchJobWithMapPayload(
          organizationId,
          variables.jobType ?? JobType.TILING,
          variables.id,
          payload,
          onProgress
        );
      }

      return LeadsService.updateLeadMap(
        organizationId,
        variables.leadType ?? LeadType.TILING,
        variables.id,
        payload,
        onProgress
      );
    },
    onSuccess: (_, variables) => {
      if (variables.entityType === ResourceType.JOB) {
        invalidateJobMapCaches(queryClient);
        if (organizationId) {
          invalidateJobActivityLogs(queryClient, organizationId, variables.id);
        }
        return;
      }

      invalidateLeadMapCaches(queryClient);
      if (organizationId) {
        invalidateLeadActivityLogs(queryClient, organizationId, variables.id);
      }
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to upload map file"));
    },
  });
}
