import type { Role } from "@/api/types";
import { USER_ROLE_NAME_MAP, UserRole } from "@/constants/enums";

/**
 * Checks if a string represents a valid numeric role ID
 * Stronger guard than isNaN - ensures the entire string is numeric
 */
export const isValidRoleId = (value: string): boolean => {
  if (!value || value.trim() === "") return false;
  const num = Number(value);
  return Number.isInteger(num) && !isNaN(num) && num > 0;
};

/**
 * Normalizes role name to display format (handles admin variations)
 */
const normalizeAdminRole = (roleName: string): string => {
  return roleName === "Admin" ? "Administrator" : roleName;
};

/**
 * Gets role label from role ID (new RBAC system)
 */
const getRoleLabelFromId = (
  roleId: number,
  roleMap: Record<string, string>
): string => {
  const roleName = roleMap[roleId.toString()];
  return roleName ? normalizeAdminRole(roleName) : roleId.toString();
};

/**
 * Gets role label from legacy role code (A, M, C, B, R)
 */
const getRoleLabelFromCode = (roleCode: string, roles?: Role[]): string => {
  const roleName = USER_ROLE_NAME_MAP[roleCode as UserRole];
  if (!roleName) return roleCode;

  // Try to find the role by name in the roles list for exact display name
  const foundRole = roles?.find(
    (r: Role) => r.name.toLowerCase() === roleName.toLowerCase()
  );

  if (foundRole) {
    return normalizeAdminRole(foundRole.name);
  }

  return normalizeAdminRole(roleName);
};

/**
 * Gets display label for a role (supports both new RBAC and legacy systems)
 * @param role - Role ID (numeric string), legacy role code (A, M, C, B, R), or undefined
 * @param roleMap - Map of role IDs to role names from useMapping
 * @param roles - Array of Role objects from useRoles (optional, for better matching)
 */
export const getRoleLabel = (
  role: string | undefined,
  roleMap: Record<string, string> = {},
  roles?: Role[]
): string => {
  if (!role) return "Member";

  const roleId = parseInt(role);

  // New RBAC system: numeric role ID
  if (!isNaN(roleId)) {
    return getRoleLabelFromId(roleId, roleMap);
  }

  // Legacy system: role code (A, M, C, B, R)
  if (Object.values(UserRole).includes(role as UserRole)) {
    return getRoleLabelFromCode(role, roles);
  }

  // Fallback: try roleMap or return as-is
  const raw = roleMap[role] || role;
  return normalizeAdminRole(raw);
};

/**
 * Gets role display name from role_fk object (preferred method for new RBAC system)
 */
export const getRoleDisplayName = (
  roleFk?: { name: string } | null
): string => {
  if (!roleFk?.name) return "Member";
  return normalizeAdminRole(roleFk.name);
};
