import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";

import type { JobEquipmentHoursUpdatePayload } from "@/api/types";
import { invalidateEquipmentMaintenanceChecks } from "@/hooks/queries/invalidateEquipmentMaintenanceCheck";
import { equipmentHoursBreakdownQueryKey } from "@/hooks/queries/useEquipmentHoursBreakdown";
import { StorageKey, useDataFromStorageByKey } from "@/hooks/storage-data";
import { useRouteIds } from "@/hooks/useRouteIds";
import axiosInstance from "@/lib/axios";

interface LastUpdateData {
  last_update?: string;
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

export const useJobEquipment = () => {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();
  const token = useDataFromStorageByKey(StorageKey.ACCESS_TOKEN);

  // Mutation for updating job equipment
  const updateJobEquipment = useMutation({
    mutationFn: async ({
      equipmentId,
      jobEquipmentData,
    }: {
      equipmentId: string;
      jobEquipmentData: JobEquipmentHoursUpdatePayload;
      jobId?: number | string;
    }) => {
      try {
        const { data } = await axiosInstance.put(
          `ms/organizations/${organizationId}/jobEquipment/${equipmentId}/`,
          jobEquipmentData
        );
        return data;
      } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;

        // Handle array response
        if (Array.isArray(axiosError.response?.data)) {
          throw new Error(axiosError.response.data[0]);
        }

        // Handle object response
        const errorMessage =
          axiosError.response?.data?.error ||
          axiosError.response?.data?.message ||
          "Failed to update job equipment";
        throw new Error(errorMessage);
      }
    },
    onSuccess: (_data, variables) => {
      // Invalidate the jobEquipment and job queries
      queryClient.invalidateQueries({
        queryKey: ["jobEquipment", organizationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["job", organizationId],
      });
      queryClient.refetchQueries({
        queryKey: ["job"],
      });
      queryClient.invalidateQueries({
        queryKey: ["equipment"],
      });
      queryClient.invalidateQueries({ queryKey: ["jobFinancial"] });
      queryClient.invalidateQueries({
        queryKey: ["financialMachineAssignments"],
      });
      if (variables.jobId != null) {
        queryClient.invalidateQueries({
          queryKey: equipmentHoursBreakdownQueryKey(
            organizationId,
            variables.jobId
          ),
        });
      }
      invalidateEquipmentMaintenanceChecks(queryClient);
    },
  });

  const useLastUpdate = (jobequipmentId: string) => {
    return useQuery<LastUpdateData>({
      queryKey: ["lastUpdate", jobequipmentId],
      enabled: !!jobequipmentId && !!organizationId && !!token,
      retry: 2,
      queryFn: async () => {
        if (!organizationId || !jobequipmentId) {
          throw new Error("Missing organizationId or jobequipmentId");
        }

        try {
          const { data } = await axiosInstance.get(
            `ms/organizations/${organizationId}/lastUpdate/`,
            {
              params: { id: jobequipmentId },
            }
          );
          return data;
        } catch (error) {
          console.error(error);
          // const axiosError = error as AxiosError<ApiErrorResponse>;
          // throw new Error(
          //   axiosError.response?.data?.message ||
          //     "Failed to fetch last update data"
          // );
        }
      },
    });
  };

  const useAllLastUpdates = (equipmentIds: string[] | undefined) => {
    const fetchLastUpdate = async (
      jobequipmentId: string
    ): Promise<LastUpdateData> => {
      if (!organizationId || !jobequipmentId) {
        throw new Error("Missing organizationId or jobequipmentId");
      }

      try {
        const { data, status } = await axiosInstance.get(
          `ms/organizations/${organizationId}/lastUpdate/`,
          {
            params: { id: jobequipmentId },
          }
        );
        return status === 204 ? {} : data;
      } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        throw new Error(
          axiosError.response?.data?.message ||
            "Failed to fetch last update data"
        );
      }
    };

    const queries = useQueries({
      queries: (equipmentIds || []).map((id) => ({
        queryKey: ["lastUpdate", id],
        queryFn: () => fetchLastUpdate(id),
        enabled: !!id && !!organizationId && !!token,
        retry: 2,
      })),
    });

    const isLoading = queries.some((query) => query.isLoading);
    const error = queries.find((query) => query.error)?.error ?? null;
    const data = queries.reduce(
      (acc, query, index) => {
        if (query.data) {
          acc[equipmentIds![index]] = query.data;
        }
        return acc;
      },
      {} as Record<string, LastUpdateData>
    );

    return { data, isLoading, error };
  };

  return {
    updateJobEquipment,
    useLastUpdate,
    useAllLastUpdates,
  };
};
