import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

import axiosInstance from "@/lib/axios";

export interface GoogleUrlResponse {
  full_url: string;
  expanded_url?: string;
}

interface GoogleUrlApiErrorResponse {
  message?: string;
}

function useShortenGoogleUrl() {
  const expandGoogleUrl = useMutation<
    GoogleUrlResponse,
    AxiosError<GoogleUrlApiErrorResponse>,
    string
  >({
    mutationFn: async (url: string) => {
      try {
        const { data } = await axiosInstance.get("ms/GoogleMapsFullURL/", {
          params: {
            shorten_url: url,
          },
        });
        return data;
      } catch (error) {
        const axiosError = error as AxiosError<GoogleUrlApiErrorResponse>;
        throw new Error(
          axiosError.response?.data?.message ||
            "Failed to expand Google URL. Please try again."
        );
      }
    },
  });

  return { expandGoogleUrl };
}

export default useShortenGoogleUrl;
