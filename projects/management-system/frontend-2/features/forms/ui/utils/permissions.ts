import { usePermissionsFromStorage } from "@/hooks/permissions";
import type { PermissionResource } from "@/hooks/permissions";

import type { FieldPermissions, SectionPermissions } from "../types";

/**
 * Check if user has a specific permission from all permission codes
 * Permission codes are stored as "resource_action" (e.g., "contact_access_read")
 */
export function checkPermissionFromAll(
  allPermissionCodes: string[],
  resource: PermissionResource,
  action: "read" | "write" | "delete"
): boolean {
  const permissionKey = `${resource}_${action}`;
  return allPermissionCodes.includes(permissionKey);
}

/**
 * Check field permissions (non-hook version for use in functions)
 */
export function checkFieldPermissions(
  allPermissionCodes: string[],
  fieldPermissions: FieldPermissions | undefined,
  baseResource: PermissionResource | undefined
) {
  // If no permissions configured, allow access
  if (!fieldPermissions || !baseResource) {
    return {
      canRead: true,
      canWrite: true,
      shouldHide: false,
      shouldDisable: false,
    };
  }

  // Check read permission - fieldPermissions.read should be the action ("read", "write", "delete")
  const readAction = (fieldPermissions.read || "read") as
    | "read"
    | "write"
    | "delete";
  const canRead = checkPermissionFromAll(
    allPermissionCodes,
    baseResource,
    readAction
  );

  // Check write permission - fieldPermissions.write should be the action
  const writeAction = (fieldPermissions.write || "write") as
    | "read"
    | "write"
    | "delete";
  const canWrite = checkPermissionFromAll(
    allPermissionCodes,
    baseResource,
    writeAction
  );

  // Determine visibility (default: hide if no read permission)
  const shouldHide = fieldPermissions.hideIfNoRead !== false && !canRead;

  // Determine disabled state (default: disable if no write permission)
  const shouldDisable =
    fieldPermissions.disableIfNoWrite !== false && !canWrite;

  return {
    canRead,
    canWrite,
    shouldHide,
    shouldDisable,
  };
}

/**
 * Check section permissions (non-hook version for use in functions)
 */
export function checkSectionPermissions(
  allPermissionCodes: string[],
  sectionPermissions: SectionPermissions | undefined,
  baseResource: PermissionResource | undefined
) {
  // If no permissions configured, allow access
  if (!sectionPermissions || !baseResource) {
    return {
      canRead: true,
      canWrite: true,
      shouldHide: false,
      shouldDisable: false,
    };
  }

  // Check read permission
  const readAction = (sectionPermissions.read || "read") as
    | "read"
    | "write"
    | "delete";
  const canRead = checkPermissionFromAll(
    allPermissionCodes,
    baseResource,
    readAction
  );

  // Check write permission
  const writeAction = (sectionPermissions.write || "write") as
    | "read"
    | "write"
    | "delete";
  const canWrite = checkPermissionFromAll(
    allPermissionCodes,
    baseResource,
    writeAction
  );

  // Determine visibility
  const shouldHide = sectionPermissions.hideIfNoRead !== false && !canRead;

  // Determine disabled state
  const shouldDisable =
    sectionPermissions.disableIfNoWrite !== false && !canWrite;

  return {
    canRead,
    canWrite,
    shouldHide,
    shouldDisable,
  };
}

/**
 * Hook to get all permission codes for use in GenericForm
 */
export function useFormPermissions() {
  const allPermissions = usePermissionsFromStorage();
  return {
    permissionCodes: allPermissions.permissionCodes,
    isLoading: allPermissions.isLoading,
  };
}
