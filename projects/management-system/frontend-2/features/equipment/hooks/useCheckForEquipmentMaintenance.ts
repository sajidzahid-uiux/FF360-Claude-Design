import { useMutation, useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constants/enums";
import type { EquipmentMaintenanceCheckResponse } from "@/features/jobs";
import { StorageKey, useDataFromStorageByKey } from "@/hooks/storage-data";
import { useRouteIds } from "@/hooks/useRouteIds";
import axiosInstance from "@/lib/axios";

interface MaintenanceCheckProps {
  jobId: string;
  jobType: string;
}

const useCheckForEquipmentMaintenance = (props?: MaintenanceCheckProps) => {
  const { orgId: organization } = useRouteIds();
  const token = useDataFromStorageByKey(StorageKey.ACCESS_TOKEN);

  const maintenanceCheckQuery =
    useQuery<EquipmentMaintenanceCheckResponse | null>({
      queryKey: [
        QUERY_KEYS.EQUIPMENT_MAINTENANCE_CHECK,
        props?.jobId,
        props?.jobType,
      ],
      enabled: !!organization && !!token && !!props?.jobId && !!props?.jobType,
      queryFn: async () => {
        if (!organization || !token || !props?.jobId || !props?.jobType) {
          return null;
        }

        const { data } = await axiosInstance.get(
          `ms/organizations/${organization}/equipmentUntilUpdate/`,
          {
            params: {
              job_id: props.jobId,
              job_type: props.jobType,
            },
          }
        );

        return data;
      },
    });

  const maintenanceCheckMutation = useMutation<
    EquipmentMaintenanceCheckResponse,
    Error,
    { jobId: string; jobType: string }
  >({
    mutationFn: async (data) => {
      const { data: responseData } = await axiosInstance.get(
        `ms/organizations/${organization}/equipmentUntilUpdate/`,
        {
          params: {
            job_id: data.jobId,
            job_type: data.jobType,
          },
        }
      );
      return responseData;
    },
  });

  return {
    maintenanceCheckQuery,
    maintenanceCheckMutation,
  };
};

export default useCheckForEquipmentMaintenance;
