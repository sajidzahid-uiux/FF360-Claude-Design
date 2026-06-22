import { useQuery } from "@tanstack/react-query";

import type { Maintenance } from "@/api/types";
import { StorageKey, useDataFromStorageByKey } from "@/hooks/storage-data";
import { useRouteIds } from "@/hooks/useRouteIds";
import axiosInstance from "@/lib/axios";
import { getErrorMessage } from "@/utils/apiError";

export const useMaintenanceByEquipment = (equipmentId: string) => {
  const { orgId: organization } = useRouteIds();
  const token = useDataFromStorageByKey(StorageKey.ACCESS_TOKEN);

  return useQuery<Maintenance[]>({
    queryKey: ["maintenance", equipmentId],
    enabled: !!equipmentId && !!organization && !!token,
    retry: 2,
    queryFn: async () => {
      if (!equipmentId || !organization || !token) {
        throw new Error("Missing required parameters or authentication.");
      }

      try {
        const { data } = await axiosInstance.get(
          `ms/organizations/${organization}/maintenances/`,
          {
            params: {
              equipment: equipmentId,
            },
          }
        );
        return data;
      } catch (error: unknown) {
        throw new Error(
          getErrorMessage(error, "Failed to fetch maintenance data")
        );
      }
    },
  });
};
