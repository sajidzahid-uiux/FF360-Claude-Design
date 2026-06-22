"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";

import type { OrganizationListRow } from "@/api/types";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useRouteIds } from "@/hooks/lib/useRouteIds";
import axiosInstance from "@/lib/axios";
import type { ApiErrorResponse } from "@/utils/apiError";

// Get organization by ID (as a hook)
export function useOrganizationById(id: string | null) {
  return useQuery({
    queryKey: ["organization", id],
    queryFn: async () => {
      if (!id) return null;
      const response = await axiosInstance.get(`ms/organizations/${id}/`);
      return response.data;
    },
    enabled: !!id,
  });
}

export const useOrganizationData = () => {
  const { orgId } = useRouteIds();
  const queryClient = useQueryClient();
  const { logout } = useAuth();

  // Fetch organization data
  const organizationQuery = useQuery<OrganizationListRow[]>({
    retry: false,
    queryKey: ["organizations"],
    staleTime: 0,
    gcTime: 0,
    queryFn: async () => {
      const response = await axiosInstance.get("ms/organizations/");
      const organizations = response.data;

      return organizations;
    },
  });

  // Add new organization
  const addOrganization = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await axiosInstance.post("ms/organizations/", formData);
      return response.data;
    },
    onSettled: () => {
      // Invalidate and refetch the organization query
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });

  const deleteOrganization = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.delete(`ms/organizations/${orgId}/`);
      logout();
      return response.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });

  const patchOrganization = useMutation({
    mutationFn: async (formData: FormData) => {
      try {
        const response = await axiosInstance.patch(
          `ms/organizations/${orgId}/`,
          formData
        );
        return response.data;
      } catch (error: unknown) {
        if (isAxiosError<ApiErrorResponse>(error)) {
          toast.error(error.response?.data?.non_field_errors?.[0]);
        }
      }
    },
    onSettled: () => {
      // Invalidate and refetch the organization query
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      queryClient.invalidateQueries({ queryKey: ["organization"] });
    },
  });

  return {
    ...organizationQuery,
    addOrganization,
    patchOrganization,
    deleteOrganization,
  };
};
