import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/api/client";
import { MapService } from "@/api/services";
import type { MapLegendUpdatePayload } from "@/api/types";
import type { IdNumberUpdatePayload } from "@/api/types/common";

import { MAP_LEGENDS_QUERY_KEY } from "../queries/mapQueryKeys";
import { useRouteIds } from "../useRouteIds";

export const useUpdateMapLegendMutation = () => {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: IdNumberUpdatePayload<MapLegendUpdatePayload>) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }

      return MapService.updateMapLegend(organizationId, id, data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [MAP_LEGENDS_QUERY_KEY],
      });
      toast.success("Map legend updated successfully");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof ApiError
          ? error.getUserMessage()
          : error instanceof Error
            ? error.message
            : "Failed to update map legend";
      toast.error(message);
    },
  });
};
