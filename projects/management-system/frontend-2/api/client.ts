/**
 * Centralized API Client
 *
 * @example
 * // Basic usage
 * const jobs = await apiClient.get<Job[]>('/jobs');
 *
 * // With query params
 * const params = apiClient.buildQueryString({ search: 'test', page: 1 });
 * const jobs = await apiClient.get<Job[]>(`/jobs${params}`);
 */
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";

import { API_URL } from "@/constants";
import { StorageKey } from "@/hooks/storage-data";
import { getCookie } from "@/lib/cookies";
import { APP_ROUTES, orgRoute } from "@/shared/config/routes";
import { parseContentDispositionFilename } from "@/shared/lib/parseContentDispositionFilename";
import { getErrorMessage } from "@/utils/apiError";

import { mockAdapter, USE_MOCK_DATA } from "@/mocks/mockApi";

import { sanitizationInterceptor } from "./middleware/sanitize";

export class ApiError extends Error {
  public readonly status: number;
  public readonly data: unknown;
  public readonly originalError: AxiosError;

  constructor(
    message: string,
    status: number,
    data: unknown,
    error: AxiosError
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.originalError = error;
  }

  getFieldErrors(): Record<string, string[]> {
    if (typeof this.data === "object" && this.data !== null) {
      const errors: Record<string, string[]> = {};
      Object.entries(this.data).forEach(([field, value]) => {
        if (Array.isArray(value)) {
          errors[field] = value.map(String);
        } else if (typeof value === "string") {
          errors[field] = [value];
        }
      });
      return errors;
    }
    return {};
  }

  getUserMessage(): string {
    return getErrorMessage(this, this.message);
  }
}

class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 30000, // 30 second timeout
    });

    // LOCAL PROTOTYPE: serve dummy data with no backend when mock mode is on.
    if (USE_MOCK_DATA) {
      this.client.defaults.adapter = mockAdapter;
    }

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config) => {
        const token = getCookie(StorageKey.ACCESS_TOKEN);
        if (token) {
          config.headers.Authorization = `JWT ${token}`;
        }

        if (!(config.data instanceof FormData)) {
          config.headers["Content-Type"] = "application/json";
        }

        return sanitizationInterceptor(config);
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (
          error.response?.status === 403 &&
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
        }

        if (error.response?.status === 401) {
          if (
            typeof window !== "undefined" &&
            !window.location.pathname.includes("/login")
          ) {
            // Could trigger logout here if needed
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Build a query string from an object of parameters
   *
   * @param params - Object containing query parameters
   * @returns Query string starting with '?' or empty string if no params
   *
   * @example
   * buildQueryString({ search: 'test', page: 1 }) // '?search=test&page=1'
   * buildQueryString({ status: [1, 2, 3] }) // '?status=1,2,3'
   * buildQueryString({}) // ''
   */
  buildQueryString<T extends object>(
    params: T,
    options?: { repeatArrays?: boolean }
  ): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        return;
      }

      if (Array.isArray(value)) {
        if (value.length > 0) {
          if (options?.repeatArrays) {
            value.forEach((v) => searchParams.append(key, String(v)));
          } else {
            searchParams.append(key, value.join(","));
          }
        }
      } else if (typeof value === "boolean") {
        searchParams.append(key, value.toString());
      } else if (typeof value === "number") {
        searchParams.append(key, value.toString());
      } else {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : "";
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.get(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.post(
        url,
        data,
        config
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.patch(
        url,
        data,
        config
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.put(
        url,
        data,
        config
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.delete(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async uploadFile<T>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.post(url, formData, {
        ...config,
        headers: {
          ...config?.headers,
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * POST that returns a binary file (e.g. PDF export). Parses Content-Disposition for filename.
   */
  async postDownload(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<{ blob: Blob; filename?: string }> {
    try {
      const response: AxiosResponse<Blob> = await this.client.post(url, data, {
        ...config,
        responseType: "blob",
      });

      const blob = response.data;
      const contentTypeHeader = response.headers["content-type"];
      const contentType =
        typeof contentTypeHeader === "string"
          ? contentTypeHeader
          : Array.isArray(contentTypeHeader)
            ? (contentTypeHeader[0] ?? "")
            : "";

      if (contentType.includes("application/json")) {
        throw await this.blobResponseError(response.status, blob);
      }

      const disposition = response.headers["content-disposition"];
      const filename = parseContentDispositionFilename(
        typeof disposition === "string" ? disposition : undefined
      );

      return { blob, filename: filename ?? undefined };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
        throw await this.blobResponseError(
          error.response.status,
          error.response.data,
          error
        );
      }
      throw this.handleError(error as AxiosError);
    }
  }

  private async blobResponseError(
    status: number,
    blob: Blob,
    originalError?: AxiosError
  ): Promise<ApiError> {
    let data: unknown = null;
    try {
      const text = await blob.text();
      try {
        data = JSON.parse(text) as unknown;
      } catch {
        data = text;
      }
    } catch {
      data = null;
    }

    const message = getErrorMessage(
      {
        response: { status, data },
        data,
        message: originalError?.message ?? "Download failed",
      },
      "Download failed"
    );

    return new ApiError(
      message,
      status,
      data,
      originalError ?? ({} as AxiosError)
    );
  }

  /** PATCH multipart (e.g. job/lead map file updates on detail URLs). */
  async patchMultipart<T>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.patch(
        url,
        formData,
        {
          ...config,
          headers: {
            ...config?.headers,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  private handleError(error: AxiosError): ApiError {
    const status = error.response?.status ?? 0;
    const data = error.response?.data;

    const message = getErrorMessage(
      { response: { status, data }, data, message: error.message },
      "An unexpected error occurred"
    );

    return new ApiError(message, status, data, error);
  }

  getAxiosInstance(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = new ApiClient(API_URL);
export type { ApiClient };
