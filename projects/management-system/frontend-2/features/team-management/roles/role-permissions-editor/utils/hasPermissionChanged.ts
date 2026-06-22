import type { Permission } from "@/api/types";

/**
 * Checks if permissions have changed from the original set
 */
export function hasPermissionChanged(
  originalPermissions: Permission[],
  selectedPermissionIds: Set<number>
): boolean {
  const originalIds = new Set(originalPermissions.map((p) => p.id));
  if (originalIds.size !== selectedPermissionIds.size) return true;
  for (const id of selectedPermissionIds) {
    if (!originalIds.has(id)) return true;
  }
  return false;
}
