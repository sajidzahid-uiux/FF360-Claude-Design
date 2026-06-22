import type { Permission } from "@/api/types";
import type { PermissionSectionConfig } from "@/features/team-management/roles/role-permissions-editor/permissions-config";
import { PERMISSIONS_CONFIG } from "@/features/team-management/roles/role-permissions-editor/permissions-config";

export interface ConfigPermissionGroup {
  entityTitle: string;
  actionLabels: string[];
}

/**
 * Groups user permissions by PERMISSIONS_CONFIG sections.
 * Section titles and item labels match the role-permissions-editor config.
 * Returns only sections where the user has at least one permission.
 */
export function groupPermissionsByConfig(
  permissions: Permission[],
  config: PermissionSectionConfig[] = PERMISSIONS_CONFIG
): ConfigPermissionGroup[] {
  const codeSet = new Set(permissions.map((p) => p.code));
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
