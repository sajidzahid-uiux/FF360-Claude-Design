import type { PermissionSectionConfig } from "@/features/team-management/roles/role-permissions-editor/permissions-config";
import { PERMISSIONS_CONFIG } from "@/features/team-management/roles/role-permissions-editor/permissions-config";

export interface ConfigPermissionGroup {
  entityTitle: string;
  actionLabels: string[];
}

/**
 * Groups user permission codes by PERMISSIONS_CONFIG sections.
 * Section titles and item labels match the role-permissions-editor config.
 * Returns only sections where the user has at least one permission.
 *
 * Accepts the flat `permission_codes` string array returned by the
 * my-permissions endpoint (the `permissions` object array is not always
 * populated — e.g. the mock backend only sends codes).
 */
export function groupPermissionsByConfig(
  permissionCodes: string[],
  config: PermissionSectionConfig[] = PERMISSIONS_CONFIG
): ConfigPermissionGroup[] {
  const codeSet = new Set(permissionCodes);
  const result: ConfigPermissionGroup[] = [];

  for (const section of config) {
    const labelsSeen = new Set<string>();
    for (const item of section.items) {
      if (codeSet.has(item.key)) {
        labelsSeen.add(item.label);
      }
    }
    if (labelsSeen.size > 0) {
      // Preserve order: first occurrence of each label as in config
      const orderedLabels: string[] = [];
      for (const item of section.items) {
        if (labelsSeen.has(item.label) && !orderedLabels.includes(item.label)) {
          orderedLabels.push(item.label);
        }
      }
      result.push({
        entityTitle: section.title,
        actionLabels: orderedLabels,
      });
    }
  }

  return result;
}
