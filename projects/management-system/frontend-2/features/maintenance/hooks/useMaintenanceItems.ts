import { useMutation, useQueryClient } from "@tanstack/react-query";

import type {
  MaintenanceWorkItemCreatePayload,
  MaintenanceWorkItemUpdatePayload,
} from "@/api/types";
import { QUERY_KEYS } from "@/constants/enums";
import { invalidateEquipmentMaintenanceChecks } from "@/hooks/queries/invalidateEquipmentMaintenanceCheck";
import { useRouteIds } from "@/hooks/useRouteIds";
import axiosInstance from "@/lib/axios";
import { getErrorMessage } from "@/utils/apiError";

const invalidateMaintenanceQueries = (
  queryClient: ReturnType<typeof useQueryClient>
) => {
  // Invalidate maintenance queries
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MAINTENANCE] });
  queryClient.invalidateQueries({
    queryKey: [QUERY_KEYS.IS_ACTIVE_MAINTENANCE],
  });
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EQUIPMENT_V2] });
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECORD_EQUIPMENT] });
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EQUIPMENT] });
  // Invalidate unified equipment queries
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.UNIFIED_EQUIPMENT] });

  invalidateEquipmentMaintenanceChecks(queryClient);
};

function useMaintenanceItems() {
  const queryClient = useQueryClient();
  const { orgId: organization } = useRouteIds();

  const createMaintenanceItem = useMutation({
    mutationFn: async (newMaintenance: MaintenanceWorkItemCreatePayload) => {
      try {
        const { data } = await axiosInstance.post(
          `ms/organizations/${organization}/maintenance_item/`,
          newMaintenance
        );
        return data;
      } catch (error: unknown) {
        throw new Error(
          getErrorMessage(error, "Failed to create maintenance item")
        );
      }
    },
    onSettled: () => {
      invalidateMaintenanceQueries(queryClient);
    },
  });

  const patchMaintenanceItem = useMutation({
    mutationFn: async ({
      id,
      updatedMaintenance,
    }: {
      id: string;
      updatedMaintenance: MaintenanceWorkItemUpdatePayload;
    }) => {
      try {
        const { data } = await axiosInstance.patch(
          `ms/organizations/${organization}/maintenance_item/${id}/`,
          updatedMaintenance
        );
        return data;
      } catch (error: unknown) {
        throw new Error(
          getErrorMessage(error, "Failed to update maintenance item")
        );
      }
    },
    onSettled: () => {
      invalidateMaintenanceQueries(queryClient);
    },
  });

  return {
    createMaintenanceItem,
    patchMaintenanceItem,
  };
}

export default useMaintenanceItems;
