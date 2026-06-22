import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { API_ENDPOINTS } from "@/api/endpoints";
import type { PaymentStatus } from "@/api/types";
import { useRouteIds } from "@/hooks/lib/useRouteIds";
import axiosInstance from "@/lib/axios";

interface ApiErrorResponse {
  message?: string;
  error?: string;
  detail?: string;
}

function usePaymentStatusesSettings() {
  const { orgId: organizationId } = useRouteIds();
  const queryClient = useQueryClient();

  const updatePaymentStatus = useMutation({
    mutationFn: async (updatedStatus: {
      id: number;
      title?: string;
      color?: string;
    }) => {
      try {
        const response = await axiosInstance.patch(
          API_ENDPOINTS.organizations.settingsStatuses.paymentStatusDetail(
            organizationId as string,
            updatedStatus.id
          ),
          updatedStatus
        );
        return response.data;
      } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        throw new Error(
          axiosError.response?.data?.detail ||
            axiosError.response?.data?.error ||
            axiosError.response?.data?.message ||
            "Failed to update payment status"
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentStatuses"] });
    },
  });

  const deletePaymentStatus = useMutation({
    mutationFn: async (paymentStatusId: number) => {
      try {
        const response = await axiosInstance.delete(
          API_ENDPOINTS.organizations.settingsStatuses.paymentStatusDetail(
            organizationId as string,
            paymentStatusId
          )
        );
        return response.data;
      } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        throw new Error(
          axiosError.response?.data?.detail ||
            axiosError.response?.data?.error ||
            axiosError.response?.data?.message ||
            "Failed to delete payment status"
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentStatuses"] });
    },
  });

  const addPaymentStatus = useMutation({
    mutationFn: async (newStatus: { title: string; color: string }) => {
      try {
        const response = await axiosInstance.post(
          API_ENDPOINTS.organizations.settingsStatuses.paymentStatuses(
            organizationId as string
          ),
          newStatus
        );
        return response.data;
      } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        throw new Error(
          axiosError.response?.data?.detail ||
            axiosError.response?.data?.error ||
            axiosError.response?.data?.message ||
            "Failed to add payment status"
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentStatuses"] });
    },
  });

  const paymentStatusesQuery = useQuery<PaymentStatus[]>({
    queryKey: ["paymentStatuses", "settings"],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get(
          API_ENDPOINTS.organizations.settingsStatuses.paymentStatuses(
            organizationId as string
          )
        );
        return response.data;
      } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        throw new Error(
          axiosError.response?.data?.detail ||
            axiosError.response?.data?.error ||
            axiosError.response?.data?.message ||
            "Failed to fetch payment statuses"
        );
      }
    },
  });

  return {
    updatePaymentStatus,
    deletePaymentStatus,
    addPaymentStatus,
    ...paymentStatusesQuery,
  };
}

export default usePaymentStatusesSettings;
