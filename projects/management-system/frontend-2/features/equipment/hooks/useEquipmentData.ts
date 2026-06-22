import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { API_ENDPOINTS, EquipmentType } from "@/api/endpoints";
import type {
  EquipmentCreatePayload,
  EquipmentV2,
  PaginatedEquipmentResponse,
} from "@/api/types";
import { QUERY_KEYS } from "@/constants";
import { invalidateEquipmentMaintenanceChecks } from "@/hooks/queries/invalidateEquipmentMaintenanceCheck";
import { useRouteIds } from "@/hooks/useRouteIds";
import axiosInstance from "@/lib/axios";
import { getErrorMessage } from "@/utils/apiError";

const EQUIPMENT_IMAGE_FIELDS = [
  "equipment_image",
  "insurance_image",
  "registration_image",
  "serial_number_image",
] as const;

type EquipmentImageField = (typeof EQUIPMENT_IMAGE_FIELDS)[number];
type EquipmentImageData = Partial<Record<EquipmentImageField, File | null>>;
type EquipmentRecordUpdate = Record<
  string,
  string | File | number | boolean | null | undefined
>;

export const useEquipmentData = (
  equipmentType: EquipmentType = EquipmentType.ALL,
  searchParams?: {
    search?: string;
    equipment_type?: string;
    page?: number;
    page_size?: number;
    trashed?: boolean;
  }
) => {
  const queryClient = useQueryClient();
  const { orgId: organization } = useRouteIds();

  // Helper function to fetch equipment using the unified endpoint
  const fetchUnifiedEquipment = async (params?: {
    search?: string;
    equipment_type?: string;
    page?: number;
    page_size?: number;
  }) => {
    const baseUrl = `ms/organizations/${organization}/equipment/all/`;

    const queryParams = new URLSearchParams();

    if (params?.search) queryParams.append("search", params.search);
    if (params?.equipment_type)
      queryParams.append("equipment_type", params.equipment_type);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.page_size)
      queryParams.append("page_size", params.page_size.toString());

    const url = queryParams.toString()
      ? `${baseUrl}?${queryParams.toString()}`
      : baseUrl;

    const response = await axiosInstance.get(url);
    if (response.status !== 200) {
      throw new Error("Failed to fetch equipment");
    }

    return response.data;
  };

  // Fetch equipment data based on the type
  const equipmentQuery = useQuery<
    EquipmentV2[] | PaginatedEquipmentResponse<EquipmentV2>
  >({
    queryKey: ["equipment", equipmentType, searchParams],
    staleTime: 0,
    refetchOnMount: true,
    // Disable query if requesting trashed data without permission
    enabled: !searchParams?.trashed,
    queryFn: async () => {
      return fetchUnifiedEquipment(searchParams);
    },
  });

  // Add new equipment
  const addEquipment = useMutation({
    mutationFn: async ({
      newEquipment,
      imageData,
    }: {
      newEquipment: EquipmentCreatePayload;
      imageData: EquipmentImageData;
    }) => {
      try {
        const endpoint =
          equipmentType === "all"
            ? "equipment/"
            : `equipment/${equipmentType}/`;

        const response = await axiosInstance.post(
          `ms/organizations/${organization}/${endpoint}`,
          newEquipment,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 201) {
          const id = response.data.id;
          if (id && imageData) {
            const formData = new FormData();
            for (const key of EQUIPMENT_IMAGE_FIELDS) {
              const value = imageData[key];
              if (value !== undefined) {
                if (value instanceof File) {
                  formData.append(key, value);
                }
              }
            }
            patchEquipment.mutateAsync({
              id,
              updatedEquipment: formData,
            });
          }
        }

        return response.data;
      } catch (error: unknown) {
        console.error(getErrorMessage(error, "Failed to add equipment"));
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      queryClient.invalidateQueries({ queryKey: ["unified-equipment"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MAINTENANCE] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.IS_ACTIVE_MAINTENANCE],
      });
      // Invalidate job queries since jobs reference equipment
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] });
      queryClient.invalidateQueries({ queryKey: ["job"] });
      invalidateEquipmentMaintenanceChecks(queryClient);
    },
  });

  // Update existing equipment
  const updateEquipment = useMutation({
    mutationFn: async ({
      id,
      updatedEquipment,
    }: {
      id: string;
      updatedEquipment: EquipmentRecordUpdate;
    }) => {
      try {
        const endpoint =
          equipmentType === "all"
            ? `equipment/${id}/`
            : `equipment/${equipmentType}/${id}/`;

        const formData = new FormData();

        for (const key of Object.keys(updatedEquipment)) {
          const value = updatedEquipment[key];

          if (value !== undefined && value !== null) {
            // Skip image fields if they're not File objects
            if (
              EQUIPMENT_IMAGE_FIELDS.includes(key as EquipmentImageField) &&
              !(value instanceof File)
            ) {
              continue;
            } else if (value instanceof File) {
              formData.append(key, value);
            } else {
              formData.append(key, String(value));
            }
          }
        }

        const response = await axiosInstance.put(
          `ms/organizations/${organization}/${endpoint}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.status !== 200) {
          throw new Error("Failed to update equipment");
        }

        return response.data;
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Failed to update equipment"));
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      queryClient.invalidateQueries({ queryKey: ["unified-equipment"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MAINTENANCE] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.IS_ACTIVE_MAINTENANCE],
      });
      // Invalidate job queries since jobs reference equipment
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] });
      queryClient.invalidateQueries({ queryKey: ["job"] });
      invalidateEquipmentMaintenanceChecks(queryClient);
    },
  });

  // Patch existing equipment
  const patchEquipment = useMutation({
    mutationFn: async ({
      id,
      updatedEquipment,
    }: {
      id: string;
      updatedEquipment: FormData | EquipmentRecordUpdate;
    }) => {
      const endpoint =
        equipmentType === "all"
          ? `equipment/${id}/`
          : `equipment/${equipmentType}/${id}/`;

      try {
        // Check if updatedEquipment is FormData or contains File objects
        const hasFiles =
          updatedEquipment instanceof FormData ||
          Object.values(updatedEquipment).some(
            (value) => value instanceof File
          );

        let payload: FormData | EquipmentRecordUpdate = updatedEquipment;

        // If not FormData but contains File objects, convert to FormData
        if (!(updatedEquipment instanceof FormData) && hasFiles) {
          const formData = new FormData();
          const record = updatedEquipment as EquipmentRecordUpdate;

          for (const key of Object.keys(record)) {
            const value = record[key];

            if (value !== undefined && value !== null) {
              // Skip image fields if they're not File objects
              if (
                EQUIPMENT_IMAGE_FIELDS.includes(key as EquipmentImageField) &&
                !(value instanceof File)
              ) {
                continue;
              } else if (value instanceof File) {
                formData.append(key, value);
              } else {
                formData.append(key, String(value));
              }
            }
          }
          payload = formData;
        }

        // For FormData, let axios set Content-Type automatically with boundary
        // For JSON/other, send as-is
        const response = await axiosInstance.patch(
          `ms/organizations/${organization}/${endpoint}`,
          payload
        );

        if (response.status !== 200) {
          throw new Error("Failed to patch equipment");
        }

        return response.data;
      } catch (error: unknown) {
        console.error(getErrorMessage(error, "Failed to patch equipment"));
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      queryClient.invalidateQueries({ queryKey: ["unified-equipment"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MAINTENANCE] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.IS_ACTIVE_MAINTENANCE],
      });
      // Invalidate job queries since jobs reference equipment
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] });
      queryClient.invalidateQueries({ queryKey: ["job"] });
      invalidateEquipmentMaintenanceChecks(queryClient);
    },
  });

  // Delete existing equipment
  const deleteEquipment = useMutation({
    mutationFn: async ({
      id,
      equipmentType,
    }: {
      id: number;
      equipmentType: EquipmentType;
    }) => {
      const endpoint = `equipment-v2/${equipmentType}/${id}/permanent_delete/?trashed=true`;

      await axiosInstance.post(`ms/organizations/${organization}/${endpoint}`);

      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      queryClient.invalidateQueries({ queryKey: ["equipmentV2"] });
      queryClient.invalidateQueries({ queryKey: ["unified-equipment"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MAINTENANCE] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.IS_ACTIVE_MAINTENANCE],
      });
      // Invalidate job queries since jobs reference equipment
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] });
      queryClient.invalidateQueries({ queryKey: ["job"] });
      invalidateEquipmentMaintenanceChecks(queryClient);
    },
  });

  // trash existing equipment
  const trashEquipment = useMutation({
    mutationFn: async (id: string) => {
      const endpoint =
        equipmentType === "all"
          ? `equipment/${id}/`
          : `equipment/${equipmentType}/${id}/`;

      const response = await axiosInstance.post(
        `ms/organizations/${organization}/${endpoint}trash/`
      );

      if (response.status !== 200) {
        throw new Error("Failed to trash equipment");
      }

      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      queryClient.invalidateQueries({ queryKey: ["unified-equipment"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MAINTENANCE] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.IS_ACTIVE_MAINTENANCE],
      });
      // Invalidate job queries since jobs reference equipment
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] });
      queryClient.invalidateQueries({ queryKey: ["job"] });
      invalidateEquipmentMaintenanceChecks(queryClient);
    },
  });

  const restoreEquipment = useMutation({
    mutationFn: async ({ id, type }: { id: number; type: EquipmentType }) => {
      const response = await axiosInstance.post(
        API_ENDPOINTS.organizations.equipment.restoreFromTrash(
          organization!,
          type,
          id
        )
      );

      if (response.status !== 200) {
        throw new Error("Failed to restore equipment");
      }

      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      queryClient.invalidateQueries({ queryKey: ["equipmentV2"] });
      queryClient.invalidateQueries({ queryKey: ["unified-equipment"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MAINTENANCE] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.IS_ACTIVE_MAINTENANCE],
      });
      // Invalidate job queries since jobs reference equipment
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] });
      queryClient.invalidateQueries({ queryKey: ["job"] });
      invalidateEquipmentMaintenanceChecks(queryClient);
    },
  });

  return {
    ...equipmentQuery,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    trashEquipment,
    patchEquipment,
    restoreEquipment,
  };
};
