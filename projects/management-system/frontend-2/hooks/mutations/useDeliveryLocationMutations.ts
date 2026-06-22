import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { VendorFormsService } from "@/api/services";
import type {
  DeliveryLocationCreatePayload,
  DeliveryLocationUpdateArgs,
} from "@/api/types";

import { invalidateOrderPipeActivityLogs } from "../queries/invalidateActivityLogs";
import { useRouteIds } from "../useRouteIds";

export const useCreateDeliveryLocation = (
  vendorFormId: number | string | null
) => {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async (payload: DeliveryLocationCreatePayload) => {
      if (!organizationId || !vendorFormId) {
        throw new Error("Organization ID and Vendor Form ID are required");
      }
      return VendorFormsService.createDeliveryLocation(
        organizationId,
        vendorFormId,
        payload
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pipeDropPayload", organizationId, vendorFormId],
      });
      if (vendorFormId != null) {
        invalidateOrderPipeActivityLogs(
          queryClient,
          organizationId,
          vendorFormId
        );
      }
      toast.success("Delivery location added");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      const msg =
        err.response?.data?.detail ||
        (error as Error).message ||
        "Failed to add delivery location";
      toast.error(msg);
    },
  });
};

export const useUpdateDeliveryLocation = (
  vendorFormId: number | string | null
) => {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async ({ locationId, payload }: DeliveryLocationUpdateArgs) => {
      if (!organizationId || !vendorFormId) {
        throw new Error("Organization ID and Vendor Form ID are required");
      }
      return VendorFormsService.updateDeliveryLocation(
        organizationId,
        vendorFormId,
        locationId,
        payload
      );
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["pipeDropPayload", organizationId, vendorFormId],
        data
      );
      queryClient.invalidateQueries({
        queryKey: ["canProceed", organizationId, vendorFormId],
      });
      if (vendorFormId != null) {
        invalidateOrderPipeActivityLogs(
          queryClient,
          organizationId,
          vendorFormId
        );
      }
      toast.success("Items assigned to location");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      const msg =
        err.response?.data?.detail ||
        (error as Error).message ||
        "Failed to assign items";
      toast.error(msg);
    },
  });
};

export const useDeleteDeliveryLocation = (
  vendorFormId: number | string | null
) => {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async (locationId: number | string) => {
      if (!organizationId || !vendorFormId) {
        throw new Error("Organization ID and Vendor Form ID are required");
      }
      return VendorFormsService.deleteDeliveryLocation(
        organizationId,
        vendorFormId,
        locationId
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["pipeDropPayload", organizationId, vendorFormId],
      });
      queryClient.setQueryData(
        ["pipeDropPayload", organizationId, vendorFormId],
        data
      );
      if (vendorFormId != null) {
        invalidateOrderPipeActivityLogs(
          queryClient,
          organizationId,
          vendorFormId
        );
      }
      toast.success("Location removed; items returned to remained list.");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      const msg =
        err.response?.data?.detail ||
        (error as Error).message ||
        "Failed to delete delivery location";
      toast.error(msg);
    },
  });
};
