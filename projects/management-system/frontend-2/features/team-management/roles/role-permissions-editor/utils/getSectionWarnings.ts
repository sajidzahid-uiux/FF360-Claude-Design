import type { Permission } from "@/api/types";
import {
  PERMISSION_RESOURCES,
  PermissionKey,
  permFor,
} from "@/hooks/permissions";

export function getSectionWarnings(
  sectionId: string,
  selectedPermissionIds: Set<number>,
  permissions: Permission[]
): string[] {
  const warnings: string[] = [];

  const permissionMap = new Map<string, Permission>();
  permissions.forEach((perm) => {
    permissionMap.set(perm.code, perm);
  });

  const isPermissionSelected = (key: PermissionKey): boolean => {
    const perm = permissionMap.get(key);
    return perm ? selectedPermissionIds.has(perm.id) : false;
  };

  if (sectionId === "completedCanceled") {
    const cocaReadSelected = isPermissionSelected(
      permFor(PERMISSION_RESOURCES.COMPLETED_CANCELED_PAGE, "read")
    );
    const cocaWriteSelected = isPermissionSelected(
      permFor(PERMISSION_RESOURCES.COMPLETED_CANCELED_PAGE, "write")
    );
    const cocaDeleteSelected = isPermissionSelected(
      permFor(PERMISSION_RESOURCES.COMPLETED_CANCELED_PAGE, "delete")
    );

    if (cocaReadSelected || cocaWriteSelected || cocaDeleteSelected) {
      const hasRepairRead = isPermissionSelected(
        permFor(PERMISSION_RESOURCES.JOBS_REPAIR_PAGE, "read")
      );
      const hasExcavationRead = isPermissionSelected(
        permFor(PERMISSION_RESOURCES.JOBS_EXCAVATION_PAGE, "read")
      );
      const hasTilingRead = isPermissionSelected(
        permFor(PERMISSION_RESOURCES.JOBS_TILING_PAGE, "read")
      );

      const hasAnyJobRead = hasRepairRead || hasExcavationRead || hasTilingRead;

      if (cocaReadSelected && !hasAnyJobRead) {
        warnings.push(
          "⚠️ To view this page, the user must also have view access to at least one job type (Repair, Excavation, or Tiling)."
        );
      }

      if (cocaWriteSelected || cocaDeleteSelected) {
        const hasRepairFullAccess =
          isPermissionSelected(
            permFor(PERMISSION_RESOURCES.JOBS_REPAIR_PAGE, "read")
          ) &&
          isPermissionSelected(
            permFor(PERMISSION_RESOURCES.JOBS_REPAIR_EDIT_STATUS, "write")
          );

        const hasExcavationFullAccess =
          isPermissionSelected(
            permFor(PERMISSION_RESOURCES.JOBS_EXCAVATION_PAGE, "read")
          ) &&
          isPermissionSelected(
            permFor(PERMISSION_RESOURCES.JOBS_EXCAVATION_EDIT_STATUS, "write")
          );

        const hasTilingFullAccess =
          isPermissionSelected(
            permFor(PERMISSION_RESOURCES.JOBS_TILING_PAGE, "read")
          ) &&
          isPermissionSelected(
            permFor(PERMISSION_RESOURCES.JOBS_TILING_EDIT_STATUS, "write")
          );

        const hasAnyFullAccess =
          hasRepairFullAccess || hasExcavationFullAccess || hasTilingFullAccess;

        if (!hasAnyFullAccess) {
          const actions: string[] = [];
          if (cocaWriteSelected) {
            actions.push("change status or resume jobs");
          }
          if (cocaDeleteSelected) {
            actions.push("delete or archive jobs");
          }

          warnings.push(
            `⚠️ To ${actions.join(" and ")} on this page, the user must have view access and edit status permission for at least one job type (Repair, Excavation, or Tiling).`
          );
        }
      }
    }
  }

  if (sectionId === "trash") {
    const trashReadSelected = isPermissionSelected(
      permFor(PERMISSION_RESOURCES.TRASH_PAGE, "read")
    );

    if (trashReadSelected) {
      const missingPermissions: string[] = [];

      const hasLeadsPermission = isPermissionSelected(
        permFor(PERMISSION_RESOURCES.LEADS_PAGE, "read")
      );
      const hasJobsPermission =
        isPermissionSelected(
          permFor(PERMISSION_RESOURCES.JOBS_REPAIR_PAGE, "read")
        ) ||
        isPermissionSelected(
          permFor(PERMISSION_RESOURCES.JOBS_EXCAVATION_PAGE, "read")
        ) ||
        isPermissionSelected(
          permFor(PERMISSION_RESOURCES.JOBS_TILING_PAGE, "read")
        );
      const hasEquipmentPermission = isPermissionSelected(
        permFor(PERMISSION_RESOURCES.EQUIPMENT_PAGE, "read")
      );

      if (!hasLeadsPermission) {
        missingPermissions.push("view access to Leads to see trashed Leads");
      }
      if (!hasJobsPermission) {
        missingPermissions.push("view access to Jobs to see trashed Jobs");
      }
      if (!hasEquipmentPermission) {
        missingPermissions.push(
          "view access to Equipment to see trashed Equipment"
        );
      }

      if (missingPermissions.length > 0) {
        warnings.push(
          `⚠️ To fully utilize the Trash page, the user needs: ${missingPermissions.join(", ")}.`
        );
      }
    }
  }

  return warnings;
}
