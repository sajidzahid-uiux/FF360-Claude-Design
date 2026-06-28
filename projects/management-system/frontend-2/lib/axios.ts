import axios from "axios";

import { sanitizationInterceptor } from "@/api/middleware/sanitize";
import { API_URL } from "@/constants";
import { StorageKey } from "@/hooks/storage-data";
import { getCookie } from "@/lib/cookies";
import { APP_ROUTES, orgRoute } from "@/shared/config/routes";
import { installMockFetch } from "@/mocks/install-mock-fetch";
import { mockAdapter, USE_MOCK_DATA } from "@/mocks/mockApi";

const axiosInstance = axios.create({
  baseURL: API_URL,
});

// LOCAL PROTOTYPE: serve dummy data with no backend when mock mode is on.
if (USE_MOCK_DATA) {
  axiosInstance.defaults.adapter = mockAdapter;
  // The chat feature loads message history via native fetch(), which the axios
  // adapter can't intercept — shim window.fetch to serve dummy threads.
  installMockFetch();
}

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Use cookie for token
    const token = getCookie(StorageKey.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `JWT ${token}`;
    }

    // Only set Content-Type for non-FormData requests
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    return sanitizationInterceptor(config);
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      error.response.status === 403 &&
      typeof error.response.data === "string" &&
      error.response.data.includes(
        "Your organization's subscription is inactive or missing"
      )
    ) {
      if (typeof window !== "undefined") {
        if (window.location.pathname.includes("/subscribe")) {
          return Promise.reject(error);
        }

        const pathSegments = window.location.pathname
          .split("/")
          .filter(Boolean);
        const orgId =
          pathSegments[0] === "organizations"
            ? pathSegments[1]
            : pathSegments[0];
        if (orgId && !isNaN(Number(orgId))) {
          window.location.href = orgRoute(orgId, APP_ROUTES.subscribe);
        } else {
          window.location.href = "/subscribe";
        }
      }
      // Optionally, return a rejected promise to halt further processing
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
