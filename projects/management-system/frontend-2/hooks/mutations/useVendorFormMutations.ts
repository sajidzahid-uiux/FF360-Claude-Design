import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { VendorFormsService } from "@/api/services";
import type {
  VendorFormCreatePayload,
  VendorFormInvoiceGenerateArgs,
  VendorFormUpdateArgs,
  VendorFormV2,
} from "@/api/types";
import { downloadFile } from "@/utils/fileDownloader";

import { invalidateOrderPipeActivityLogs } from "../queries/invalidateActivityLogs";
import { useRouteIds } from "../useRouteIds";

export const useCreateVendorForm = () => {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async (payload: VendorFormCreatePayload) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return VendorFormsService.createVendorForm(organizationId, payload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["vendorFormsV2", organizationId],
      });
      invalidateOrderPipeActivityLogs(queryClient, organizationId, data.id);
      toast.success("Vendor form created successfully");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      const msg =
        err.response?.data?.detail ||
        (error as Error).message ||
        "Failed to create vendor form";
      toast.error(msg);
    },
  });
};

export const useUpdateVendorForm = () => {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async ({ vendorFormId, payload }: VendorFormUpdateArgs) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return VendorFormsService.updateVendorForm(
        organizationId,
        vendorFormId,
        payload
      );
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData<VendorFormV2>(
        ["vendorFormV2", organizationId, variables.vendorFormId],
        (prev) => (prev ? { ...prev, ...data } : data)
      );
      queryClient.invalidateQueries({
        queryKey: ["vendorFormsV2", organizationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["vendorFormV2", organizationId, variables.vendorFormId],
      });
      queryClient.invalidateQueries({
        queryKey: ["pipeDropPayload", organizationId, variables.vendorFormId],
      });
      invalidateOrderPipeActivityLogs(
        queryClient,
        organizationId,
        variables.vendorFormId
      );
      toast.success("Vendor form updated successfully");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      const msg =
        err.response?.data?.detail ||
        (error as Error).message ||
        "Failed to update vendor form";
      toast.error(msg);
    },
  });
};

export const useDeleteVendorForm = () => {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async (vendorFormId: number | string) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return VendorFormsService.deleteVendorForm(organizationId, vendorFormId);
    },
    onSuccess: (_data, vendorFormId) => {
      queryClient.invalidateQueries({
        queryKey: ["vendorFormsV2", organizationId],
      });
      invalidateOrderPipeActivityLogs(
        queryClient,
        organizationId,
        vendorFormId
      );
      toast.success("Vendor form deleted successfully");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      const msg =
        err.response?.data?.detail ||
        (error as Error).message ||
        "Failed to delete vendor form";
      toast.error(msg);
    },
  });
};

export const useGenerateVendorFormInvoice = () => {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async ({ vendorFormId }: VendorFormInvoiceGenerateArgs) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return VendorFormsService.generateInvoice(organizationId, vendorFormId);
    },
    onSuccess: async (data, variables) => {
      invalidateOrderPipeActivityLogs(
        queryClient,
        organizationId,
        variables.vendorFormId
      );
      const url = data?.pdf_url;
      if (!url) return;
      const filename = variables.filename ?? "order-invoice.pdf";
      const downloaded = await downloadFile(url, filename);
      if (!downloaded) {
        toast.error("Download failed. Opening in new tab.");
        window.open(url, "_blank", "noopener,noreferrer");
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      const msg =
        err.response?.data?.detail ||
        (error as Error).message ||
        "Failed to generate invoice";
      toast.error(msg);
    },
  });
};
