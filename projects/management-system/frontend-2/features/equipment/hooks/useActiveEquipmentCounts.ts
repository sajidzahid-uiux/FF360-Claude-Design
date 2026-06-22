import { useQuery } from "@tanstack/react-query";

import type { ActiveEquipmentCounts } from "@/api/types/maintenance";
import { QUERY_KEYS } from "@/constants/enums";
import { StorageKey, useDataFromStorageByKey } from "@/hooks/storage-data";
import { useRouteIds } from "@/hooks/useRouteIds";
import axiosInstance from "@/lib/axios";

export function useActiveEquipmentCounts() {
  const { orgId: organization } = useRouteIds();
  const token = useDataFromStorageByKey(StorageKey.ACCESS_TOKEN);

  return useQuery<ActiveEquipmentCounts>({
    queryKey: [QUERY_KEYS.ACTIVE_EQUIPMENT_COUNTS, organization],
    enabled: !!organization && !!token,
    refetchOnMount: true,
    queryFn: async () => {
      if (!organization) {
        throw new Error("Missing organization");
      }

      const { data } = await axiosInstance.get<ActiveEquipmentCounts>(
        `ms/organizations/${organization}/maintenances/active-equipment-counts/`
      );
      return data;
    },
  });
}
