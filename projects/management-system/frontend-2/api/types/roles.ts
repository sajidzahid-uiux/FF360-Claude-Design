// ============================================
// PERMISSION
// ============================================

export interface Permission {
  id: number;
  name: string;
  code: string;
  action_type: string;
  description?: string;
  created_at?: string;
}

// ============================================
// ROLE
// ============================================

export interface Role {
  id: number;
  name: string;
  organization: number;
  is_default: boolean;
  is_admin: boolean;
  permissions: Permission[];
  members_count: number;
  created_at: string;
  updated_at: string;
}

export interface RoleUpdatePayload {
  permission_ids?: number[];
  permission_codes?: string[];
}

export interface RoleCreatePayload {
  name: string;
  permission_ids?: number[];
  permission_codes?: string[];
}

export interface UserPermissionsResponse {
  role: Role;
  permissions: Permission[];
  permission_codes: string[];
}
