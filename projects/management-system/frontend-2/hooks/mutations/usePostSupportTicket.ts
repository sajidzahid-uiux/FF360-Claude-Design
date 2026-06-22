"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { SupportTicketPayload } from "@/features/help-center";
import axiosInstance from "@/lib/axios";

import { useRouteIds } from "../useRouteIds";

export function usePostSupportTicket() {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  return useMutation({
    mutationFn: async (data: SupportTicketPayload) => {
      if (!organizationId) {
        throw new Error("Organization ID not found");
      }
      const response = await axiosInstance.post(
        `ms/organizations/${organizationId}/support_ticket/`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["organizations"] });
      void queryClient.invalidateQueries({ queryKey: ["organization"] });
    },
  });
}
