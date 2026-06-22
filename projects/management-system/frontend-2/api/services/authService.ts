import type {
  DeviceSessionsResponse,
  LoginActivityResponse,
  RequestPasswordChangeResponse,
} from "@/api/types";

import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";

export class AuthService {
  /**
   * Request a password change verification email.
   * Sends a link to the user's email. User must click the link to set a new password.
   * Applies only to email/password users (not social login).
   */
  static async requestPasswordChange(): Promise<RequestPasswordChangeResponse> {
    const endpoint = API_ENDPOINTS.auth.changePassword;
    return apiClient.post<RequestPasswordChangeResponse>(endpoint);
  }

  /**
   * Get paginated login activity for the authenticated user.
   */
  static async getLoginActivity(
    page: number = 1,
    pageSize: number = 20
  ): Promise<LoginActivityResponse> {
    const endpoint = API_ENDPOINTS.auth.loginActivity;
    const params = `?page=${page}&page_size=${pageSize}`;
    return apiClient.get<LoginActivityResponse>(`${endpoint}${params}`);
  }

  /**
   * Get active device sessions for the authenticated user.
   */
  static async getDevices(): Promise<DeviceSessionsResponse> {
    const endpoint = API_ENDPOINTS.auth.devices;
    return apiClient.get<DeviceSessionsResponse>(endpoint);
  }

  /**
   * Report web activity heartbeat. Call periodically (~280s) while the user is
   * active on the web app so the server can suppress mobile push when
   * suppress_push_when_web_active is true.
   */
  static async reportWebActivity(): Promise<void> {
    const endpoint = API_ENDPOINTS.auth.webActivity;
    await apiClient.post(endpoint);
  }
}
