// ============================================
// AUTH TYPES
// ============================================

export interface AuthUser {
  id: string | number;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  profile_image?: string | null;
  suppress_push_when_web_active?: boolean;
  email_verified?: boolean;
}

export type AuthUserUpdatePayload = Partial<
  Pick<
    AuthUser,
    | "username"
    | "first_name"
    | "last_name"
    | "phone_number"
    | "profile_image"
    | "suppress_push_when_web_active"
  >
> & {
  email?: string;
};

export interface DeviceSession {
  device_id: string;
  browser: string;
  os: string;
  device_type: string;
  ip_address: string;
  last_active: string;
  location: string | null;
  is_current: boolean;
}

export interface DeviceSessionsResponse {
  devices: DeviceSession[];
}

export interface RequestPasswordChangeResponse {
  message: string;
  expires_in_minutes: number;
}

export interface LoginActivityEvent {
  date: string;
  application: string;
  ip_address: string;
  city: string | null;
  country: string | null;
  user_agent: string | null;
  connection: string | null;
}

export interface LoginActivityResponse {
  total_count: number;
  next: string | null;
  previous: string | null;
  page_size: number;
  current_page: number;
  total_pages: number;
  results: LoginActivityEvent[];
}
