import { MAJOR_ROLES, USER_ROLE_NAME_MAP, UserRole } from "@/constants/enums";

/** Matches v1 Sidebar `allowedRoles: MAJOR_ROLES` — role name or legacy enum code. */
export function isMajorRoleName(roleName: string | null | undefined): boolean {
  if (!roleName) return false;

  const normalized = roleName.trim();
  if (!normalized) return false;

  if (MAJOR_ROLES.includes(normalized as UserRole)) {
    return true;
  }

  return MAJOR_ROLES.some((role) => USER_ROLE_NAME_MAP[role] === normalized);
}
