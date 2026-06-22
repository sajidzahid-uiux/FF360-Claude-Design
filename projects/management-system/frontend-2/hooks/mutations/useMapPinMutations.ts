import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { MapService } from "@/api/services";
import type { MapPinCreateArgs, MapPinDeleteArgs } from "@/api/types";
import { JobLeadEntityType } from "@/constants";
import { getErrorMessage } from "@/utils/apiError";

import {
  invalidateJobActivityLogs,
  invalidateLeadActivityLogs,
} from "../queries/invalidateActivityLogs";
import { MAP_PINS_QUERY_KEY } from "../queries/mapQueryKeys";
import { useRouteIds } from "../useRouteIds";

function createMapPinMutations(resource: JobLeadEntityType) {
  const useCreatePin = () => {
    const { orgId: organizationId } = useRouteIds();
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ id, data }: MapPinCreateArgs) => {
        if (!organizationId) {
          throw new Error("Organization ID is required");
        }

        return MapService.createPin(organizationId, resource, id, data);
      },
      onSuccess: (_, variables) => {
        void queryClient.invalidateQueries({
          queryKey: [MAP_PINS_QUERY_KEY, resource],
        });
        if (resource === JobLeadEntityType.JOBS) {
          invalidateJobActivityLogs(queryClient, organizationId, variables.id);
        } else {
          invalidateLeadActivityLogs(queryClient, organizationId, variables.id);
        }
      },
      onError: (error: unknown) => {
        toast.error(getErrorMessage(error, "Failed to add pin"));
      },
    });
  };

  const useDeletePin = () => {
    const { orgId: organizationId } = useRouteIds();
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ id, pinId }: MapPinDeleteArgs) => {
        if (!organizationId) {
          throw new Error("Organization ID is required");
        }

        return MapService.deletePin(organizationId, resource, id, pinId);
      },
      onSuccess: (_, variables) => {
        void queryClient.invalidateQueries({
          queryKey: [MAP_PINS_QUERY_KEY, resource],
        });
        if (resource === JobLeadEntityType.JOBS) {
          invalidateJobActivityLogs(queryClient, organizationId, variables.id);
        } else {
          invalidateLeadActivityLogs(queryClient, organizationId, variables.id);
        }
      },
      onError: (error: unknown) => {
        toast.error(getErrorMessage(error, "Failed to delete pin"));
      },
    });
  };

  return { useCreatePin, useDeletePin };
}

const jobPinMutations = createMapPinMutations(JobLeadEntityType.JOBS);
const leadPinMutations = createMapPinMutations(JobLeadEntityType.LEADS);

export const useCreateJobPin = jobPinMutations.useCreatePin;
export const useDeleteJobPin = jobPinMutations.useDeletePin;
export const useCreateLeadPin = leadPinMutations.useCreatePin;
export const useDeleteLeadPin = leadPinMutations.useDeletePin;
