import { useQuery } from "@tanstack/react-query";

import { StorageKey, useDataFromStorageByKey } from "@/hooks/storage-data";
import { useRouteIds } from "@/hooks/useRouteIds";
import axiosInstance from "@/lib/axios";
import { getErrorMessage } from "@/utils/apiError";

interface MaintenanceStatus {
  is_active: boolean;
  maintenance?: Array<{ id: number | string }>;
}

function useIsActiveMaintenance({
  equipment_id,
}: {
  equipment_id: string | null | undefined;
}) {
  const { orgId: organization } = useRouteIds();
  const token = useDataFromStorageByKey(StorageKey.ACCESS_TOKEN);

  return useQuery<MaintenanceStatus>({
    queryKey: ["is_active_maintenance", equipment_id],
    enabled: !!equipment_id && !!organization && !!token,
    retry: 2,
    staleTime: 0, // Always consider data stale
    refetchOnMount: true, // Always refetch on mount
    queryFn: async () => {
      if (!equipment_id || !organization || !token) {
        throw new Error("Missing required parameters or authentication.");
      }

      try {
        const { data } = await axiosInstance.get(
          `ms/organizations/${organization}/is-active-maintenance/${equipment_id}/`
        );
        return data;
      } catch (error: unknown) {
        throw new Error(
          getErrorMessage(error, "Failed to fetch active maintenance status.")
        );
      }
    },
  });
}

export default useIsActiveMaintenance;
