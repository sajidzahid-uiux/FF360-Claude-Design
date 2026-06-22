import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";

import { useRouteIds } from "@/hooks/useRouteIds";
import axiosInstance from "@/lib/axios";
import type { ApiErrorResponse } from "@/utils/apiError";

export const useChatFiles = () => {
  const { orgId: organizationId } = useRouteIds();

  const uploadFile = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      if (!organizationId) {
        toast.error("Organization not found");
        throw new Error("Organization not found");
      }
      try {
        const response = await axiosInstance.post(
          `chat/upload_file/?org_id=${organizationId}`,
          formData
        );
        return response.data; // Assuming the response contains the URL
      } catch (error: unknown) {
        if (isAxiosError<ApiErrorResponse>(error)) {
          toast.error(error.response?.data?.non_field_errors?.[0]);
        }
        throw error;
      }
    },
  });
  return {
    uploadFile,
  };
};
