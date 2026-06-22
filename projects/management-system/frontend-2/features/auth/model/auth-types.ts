import type { UserRole } from "@/constants/enums";

export interface AuthOrganization {
  id: string;
  name: string;
}

export interface AuthRoleDetails {
  id: number;
  name: string | null;
  is_admin: boolean;
  is_default: boolean;
  organization: number | null;
  is_owner: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  role?: UserRole | { name?: string };
  roleDetails?: AuthRoleDetails | null;
  name?: string;
  picture?: string;
  email_verified?: boolean;
  sub?: string;
  nickname?: string;
  updated_at?: string;
}

export interface AuthRuntimeActions {
  logout: () => void;
  fetchOrganizations: () => Promise<AuthOrganization[]>;
  setSelectedOrganization: (orgId: string, navigate?: boolean) => void;
  syncOrgFromUrl: (orgId: string) => void;
  getAccessToken: () => Promise<string | null>;
  refreshToken: () => Promise<void>;
}

export interface AuthSurface extends AuthRuntimeActions {
  currentUser: AuthUser | null;
  loading: boolean;
  selectedOrganization: string | null;
}
