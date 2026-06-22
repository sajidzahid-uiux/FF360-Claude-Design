import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { API_ENDPOINTS } from "@/api/endpoints";
import type { ProjectType, ProjectTypeCategory } from "@/api/types";
import { useRouteIds } from "@/hooks/lib/useRouteIds";
import axiosInstance from "@/lib/axios";

export type { ProjectTypeCategory };

interface ApiErrorResponse {
  detail?: string;
  message?: string;
  error?: string;
}

function getErrorMessage(
  data: ApiErrorResponse | undefined,
  fallback: string
): string {
  if (!data || typeof data !== "object") return fallback;
  if (typeof data.detail === "string") return data.detail;
  if (typeof data.error === "string") return data.error;
  if (typeof data.message === "string") return data.message;
  const record = data as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    const val = record[key];
    if (Array.isArray(val) && val[0]) return String(val[0]);
    if (typeof val === "string") return val;
  }
  return fallback;
}

interface UseProjectTypesSettingsOptions {
  category?: ProjectTypeCategory | null;
}

function useProjectTypesSettings(options: UseProjectTypesSettingsOptions = {}) {
  const { category = null } = options;
  const { orgId: organizationId } = useRouteIds();
  const queryClient = useQueryClient();

  const deleteProjectType = useMutation({
    mutationFn: async (projectTypeId: number | string) => {
      try {
        const response = await axiosInstance.delete(
          API_ENDPOINTS.organizations.settingsStatuses.projectTypeDetail(
            organizationId as string,
            projectTypeId.toString()
          )
        );
        return response.data;
      } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        throw new Error(
          getErrorMessage(
            axiosError.response?.data,
            "Failed to delete project type"
          )
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projectTypes"] });
    },
  });

  const updateProjectType = useMutation({
    mutationFn: async (payload: {
      id: number | string;
      name?: string;
      color?: string;
      category?: ProjectTypeCategory;
    }) => {
      const { id, ...data } = payload;
      try {
        const response = await axiosInstance.patch(
          API_ENDPOINTS.organizations.settingsStatuses.projectTypeDetail(
            organizationId as string,
            id.toString()
          ),
          data
        );
        return response.data;
      } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        throw new Error(
          getErrorMessage(
            axiosError.response?.data,
            "Failed to update project type"
          )
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projectTypes"] });
    },
  });

  const addProjectType = useMutation({
    mutationFn: async (payload: {
      name: string;
      color: string;
      category: ProjectTypeCategory;
    }) => {
      try {
        const response = await axiosInstance.post(
          API_ENDPOINTS.organizations.settingsStatuses.projectTypes(
            organizationId as string
          ),
          payload
        );
        return response.data;
      } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        throw new Error(
          getErrorMessage(
            axiosError.response?.data,
            "Failed to add project type"
          )
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projectTypes"] });
    },
  });

  const projectTypesQuery = useQuery({
    queryKey: ["projectTypes", "settings", category],
    queryFn: async (): Promise<ProjectType[]> => {
      try {
        const url = API_ENDPOINTS.organizations.settingsStatuses.projectTypes(
          organizationId as string
        );
        const params = category ? { category } : {};
        const response = await axiosInstance.get<
          ProjectType[] | { results: ProjectType[] }
        >(url, { params });
        const data = response.data;
        return Array.isArray(data) ? data : (data?.results ?? []);
      } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        throw new Error(
          getErrorMessage(
            axiosError.response?.data,
            "Failed to fetch project types"
          )
        );
      }
    },
  });

  return {
    updateProjectType,
    deleteProjectType,
    addProjectType,
    ...projectTypesQuery,
  };
}

export default useProjectTypesSettings;
