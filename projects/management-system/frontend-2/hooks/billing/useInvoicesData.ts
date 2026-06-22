import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

import type { OrganizationInvoiceListItem } from "@/api/types/invoices";
import { StorageKey } from "@/hooks/lib/storage-data";
import { useRouteIds } from "@/hooks/lib/useRouteIds";
import axiosInstance from "@/lib/axios";
import { getCookie } from "@/lib/cookies";
import { isValidNumericId } from "@/utils/validation";

interface ApiErrorResponse {
  message?: string;
  detail?: string;
}

export const useInvoicesData = (options?: { enabled?: boolean }) => {
  const { orgId: organization } = useRouteIds();
  const queryClient = useQueryClient();
  const token = getCookie(StorageKey.ACCESS_TOKEN);

  // Fetch all invoices
  const invoicesQuery = useQuery<OrganizationInvoiceListItem[]>({
    queryKey: ["invoices"],
    enabled: !!token && !!organization && options?.enabled !== false,
    retry: 2,
    queryFn: async () => {
      if (!organization || !token) {
        throw new Error("Missing required authentication or organization data");
      }

      if (!isValidNumericId(organization)) {
        throw new Error("Invalid organization ID format");
      }

      try {
        const { data } = await axiosInstance.get<OrganizationInvoiceListItem[]>(
          `ms/organizations/${organization}/invoices/`
        );
        return data;
      } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        throw axiosError;
      }
    },
  });

  // Add a new invoice
  const addInvoice = useMutation({
    mutationFn: async (newInvoice: Omit<OrganizationInvoiceListItem, "id">) => {
      if (!organization) {
        throw new Error("No organization found in localStorage.");
      }

      if (!isValidNumericId(organization)) {
        throw new Error("Invalid organization ID format");
      }

      try {
        const { data } = await axiosInstance.post<OrganizationInvoiceListItem>(
          `ms/organizations/${organization}/invoices/`,
          newInvoice
        );
        return data;
      } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        throw axiosError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
    },
  });

  // Update an invoice (PUT)
  const updateInvoice = useMutation({
    mutationFn: async ({
      id,
      updatedInvoice,
    }: {
      id: string;
      updatedInvoice: Partial<OrganizationInvoiceListItem>;
    }) => {
      if (!organization) {
        throw new Error("No organization found in localStorage.");
      }

      if (!isValidNumericId(organization)) {
        throw new Error("Invalid organization ID format");
      }

      if (!isValidNumericId(id)) {
        throw new Error("Invalid invoice ID format");
      }

      try {
        const { data } = await axiosInstance.put<OrganizationInvoiceListItem>(
          `ms/organizations/${organization}/invoices/${id}/`,
          updatedInvoice
        );
        return data;
      } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        throw axiosError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
    },
  });

  // Partially update an invoice (PATCH)
  const patchInvoice = useMutation({
    mutationFn: async ({
      id,
      updatedInvoice,
    }: {
      id: string;
      updatedInvoice: Partial<OrganizationInvoiceListItem>;
    }) => {
      if (!organization) {
        throw new Error("No organization found in localStorage.");
      }

      if (!isValidNumericId(organization)) {
        throw new Error("Invalid organization ID format");
      }

      if (!isValidNumericId(id)) {
        throw new Error("Invalid invoice ID format");
      }

      try {
        const { data } = await axiosInstance.patch<OrganizationInvoiceListItem>(
          `ms/organizations/${organization}/invoices/${id}/`,
          updatedInvoice
        );
        return data;
      } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        const errorMessage =
          axiosError.response?.data?.message || "Failed to update invoice";
        throw errorMessage;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
    },
  });

  // Delete an invoice
  const deleteInvoice = useMutation({
    mutationFn: async (id: string) => {
      if (!organization) {
        throw new Error("No organization found in localStorage.");
      }

      if (!isValidNumericId(organization)) {
        throw new Error("Invalid organization ID format");
      }

      if (!isValidNumericId(id)) {
        throw new Error("Invalid invoice ID format");
      }

      try {
        await axiosInstance.delete(
          `ms/organizations/${organization}/invoices/${id}/`
        );
      } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        throw axiosError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
    },
  });

  return {
    ...invoicesQuery,
    addInvoice,
    updateInvoice,
    patchInvoice,
    deleteInvoice,
  };
};
