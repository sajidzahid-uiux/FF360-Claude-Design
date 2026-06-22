import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { StorageKey } from "@/hooks/lib/storage-data";
import { useRouteIds } from "@/hooks/lib/useRouteIds";
import { useMapping } from "@/hooks/map/useMapping";
import axiosInstance from "@/lib/axios";
import { getCookie } from "@/lib/cookies";

interface StateDataPayload {
  jobId: string | number;
}

interface ContentType {
  id: number;
  model: string;
}

interface StateDataResponse {
  sites?: unknown[];
  message?: string;
}

interface StateApiErrorResponse {
  message?: string;
  error?: string;
}

export const useStateData = (model: string) => {
  const { data: contentTypes } = useMapping("content_types");
  const { orgId: organization } = useRouteIds();
  const token = getCookie(StorageKey.ACCESS_TOKEN);

  const getStateSites = useMutation<
    StateDataResponse,
    AxiosError<StateApiErrorResponse>,
    StateDataPayload
  >({
    mutationKey: ["states"],
    mutationFn: async ({ jobId }) => {
      if (!token || !organization) {
        throw new Error("Missing required authentication or organization data");
      }

      const contentTypeId = contentTypes?.find(
        (type: ContentType) => type.model === model
      )?.id;

      if (!contentTypeId) {
        throw new Error(`Content type for '${model}' not found`);
      }

      const formData = new FormData();
      formData.append("content_type", contentTypeId.toString());
      formData.append("object_id", jobId.toString());

      try {
        const { data } = await axiosInstance.post(
          `ms/organizations/${organization}/state/`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        return data;
      } catch (error) {
        const axiosError = error as AxiosError<StateApiErrorResponse>;
        throw new Error(
          axiosError.response?.data.error ||
            "Failed to get sites. Please try again."
        );
      }
    },
    onError: (error) => {
      console.error("Mutation failed:", error);
    },
  });

  return { getStateSites };
};
