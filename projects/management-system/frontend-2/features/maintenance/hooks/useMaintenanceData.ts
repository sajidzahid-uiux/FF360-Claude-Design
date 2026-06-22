import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  Maintenance,
  MaintenanceCreatePayload,
  MaintenanceUpdatePayload,
  PaginatedResponse,
} from "@/api/types";
import { QUERY_KEYS } from "@/constants/enums";
import { invalidateEquipmentMaintenanceChecks } from "@/hooks/queries/invalidateEquipmentMaintenanceCheck";
import { StorageKey, useDataFromStorageByKey } from "@/hooks/storage-data";
import { useRouteIds } from "@/hooks/useRouteIds";
import axiosInstance from "@/lib/axios";
import { getErrorMessage } from "@/utils/apiError";

interface MaintenanceListParams {
  page?: number;
  page_size?: number;
  search?: string;
  exclude_completed?: boolean;
  sort_order?: string;
}
const invalidateMaintenanceQueries = (
  queryClient: ReturnType<typeof useQueryClient>
) => {
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MAINTENANCE] });
  queryClient.invalidateQueries({
    queryKey: [QUERY_KEYS.IS_ACTIVE_MAINTENANCE],
  });
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EQUIPMENT_V2] });
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECORD_EQUIPMENT] });
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EQUIPMENT] });
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.UNIFIED_EQUIPMENT] });
  invalidateEquipmentMaintenanceChecks(queryClient);
};

export const useMaintenanceData = (params: MaintenanceListParams = {}) => {
  const queryClient = useQueryClient();
  const { orgId: organization } = useRouteIds();
  const token = useDataFromStorageByKey(StorageKey.ACCESS_TOKEN);

  const queryParams = new URLSearchParams();
  if (params.page !== undefined)
    queryParams.append("page", params.page.toString());
  if (params.page_size !== undefined)
    queryParams.append("page_size", params.page_size.toString());
  if (params.search) queryParams.append("search", params.search);
  if (params.exclude_completed !== undefined)
    queryParams.append(
      "exclude_completed",
      params.exclude_completed.toString()
    );
  if (params.sort_order) queryParams.append("sort_order", params.sort_order);

  const queryString = queryParams.toString();
  const endpoint = `ms/organizations/${organization}/maintenances/${queryString ? `?${queryString}` : ""}`;

  const maintenanceQuery = useQuery<
    PaginatedResponse<Maintenance> | Maintenance[]
  >({
    queryKey: [QUERY_KEYS.MAINTENANCE, organization, params],
    enabled: !!organization && !!token,
    retry: 2,
    placeholderData: (previousData) => previousData,
    queryFn: async () => {
      if (!organization || !token) {
        throw new Error("Missing required authentication or organization data");
      }

      try {
        const { data } = await axiosInstance.get(endpoint);
        return data;
      } catch (error: unknown) {
        throw new Error(
          getErrorMessage(error, "Failed to fetch maintenance data")
        );
      }
    },
  });

  const addMaintenance = useMutation({
    mutationFn: async (newMaintenance: MaintenanceCreatePayload) => {
      try {
        const { data } = await axiosInstance.post(
          `ms/organizations/${organization}/maintenances/`,
          newMaintenance
        );
        return data;
      } catch (error: unknown) {
        throw new Error(getErrorMessage(error, "Failed to add maintenance"));
      }
    },
    onSuccess: () => {
      invalidateMaintenanceQueries(queryClient);
    },
  });

  const updateMaintenance = useMutation({
    mutationFn: async ({
      id,
      updatedMaintenance,
    }: {
      id: string;
      updatedMaintenance: MaintenanceUpdatePayload;
    }) => {
      try {
        const { data } = await axiosInstance.patch(
          `ms/organizations/${organization}/maintenances/${id}/`,
          updatedMaintenance
        );
        return data;
      } catch (error: unknown) {
        throw new Error(getErrorMessage(error, "Failed to update maintenance"));
      }
    },
    onSuccess: () => {
      invalidateMaintenanceQueries(queryClient);
    },
  });

  const deleteMaintenance = useMutation({
    mutationFn: async (id: string) => {
      try {
        const { status } = await axiosInstance.delete(
          `ms/organizations/${organization}/maintenances/${id}/`
        );
        return status === 204 ? {} : null;
      } catch (error: unknown) {
        console.error("Delete failed:", getErrorMessage(error));
        throw new Error(getErrorMessage(error, "Failed to delete maintenance"));
      }
    },
    onSuccess: () => {
      invalidateMaintenanceQueries(queryClient);
    },
  });

  const completeMaintenance = useMutation({
    mutationFn: async (id: string) => {
      try {
        const { data } = await axiosInstance.patch(
          `ms/organizations/${organization}/maintenances/${id}/complete/`
        );
        return data;
      } catch (error: unknown) {
        console.error("Complete failed:", getErrorMessage(error));
        throw new Error(
          getErrorMessage(error, "Failed to complete maintenance")
        );
      }
    },
    onSuccess: () => {
      invalidateMaintenanceQueries(queryClient);
    },
  });

  return {
    ...maintenanceQuery,
    addMaintenance,
    updateMaintenance,
    deleteMaintenance,
    completeMaintenance,
  };
};
