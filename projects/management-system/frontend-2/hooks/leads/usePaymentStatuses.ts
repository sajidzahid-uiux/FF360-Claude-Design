import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { API_ENDPOINTS } from "@/api/endpoints";
import type { PaymentStatus } from "@/api/types";
import { useRouteIds } from "@/hooks/lib/useRouteIds";
import axiosInstance from "@/lib/axios";

export type { PaymentStatus };

interface ApiErrorResponse {
  message?: string;
  error?: string;
  detail?: string;
}

/**
 * Hook to fetch payment statuses for use in lead/job dropdowns.
 * Uses the settings endpoint (which serves as the single source of truth for payment statuses).
 */
function usePaymentStatuses() {
  const { orgId: organizationId } = useRouteIds();

  const paymentStatusesQuery = useQuery<PaymentStatus[]>({
    queryKey: ["paymentStatuses"],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get(
          API_ENDPOINTS.organizations.paymentStatuses(organizationId as string)
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
    enabled: !!organizationId,
  });

  return paymentStatusesQuery;
}

export default usePaymentStatuses;
