import { useMemo } from "react";

import type { Permission } from "@/api/types";

import {
  PermissionItemConfig,
  PermissionSectionConfig,
} from "../permissions-config";
import { getSectionWarnings } from "../utils";
import { PermissionItem } from "./PermissionItem";
import { PermissionWarning } from "./PermissionWarning";

interface PermissionCategoryGroupProps {
  section: PermissionSectionConfig;
  permissions: Permission[];
  selectedPermissionIds: Set<number>;
  onToggle: (permissionId: number | number[]) => void;
}

export function PermissionCategoryGroup({
  section,
  permissions,
  selectedPermissionIds,
  onToggle,
}: PermissionCategoryGroupProps) {
  // Memoize permission map for better performance
  const permissionMap = useMemo(() => {
    const map = new Map<string, Permission>();
    permissions.forEach((perm) => {
      map.set(perm.code, perm);
    });
    return map;
  }, [permissions]);

  // Find main permission - using find since we need the item's key property
  // Note: some() would only return boolean, but we need the actual item to access .key
  const mainPermissionItem = section.items.find(
    (item) => item.isMainPermission
  );
  const mainPermission = mainPermissionItem
    ? (permissionMap.get(mainPermissionItem.key) ?? null)
    : null;
  const isMainPermissionSelected = mainPermission
    ? selectedPermissionIds.has(mainPermission.id)
    : true;

  // Group permissions by label
  // Permissions with the same label (e.g., "Full Access" for read/write/delete)
  // will be displayed as a single toggle that controls all of them together
  const groupedItems = useMemo(() => {
    const groups = new Map<string, typeof section.items>();
    section.items.forEach((item) => {
      const existing = groups.get(item.label) || [];
      groups.set(item.label, [...existing, item]);
    });
    return groups;
  }, [section]);

  const handleToggle = (
    permissionIds: number[],
    configItem: PermissionItemConfig
  ) => {
    // Determine if we're turning ON or OFF based on current state
    const allSelected = permissionIds.every((id) =>
      selectedPermissionIds.has(id)
    );

    // Use a Set to collect unique IDs that need to be toggled
    const idsToToggleSet = new Set<number>();

    if (configItem.isMainPermission && allSelected) {
      // When toggling main permission OFF, collect all child permissions
      section.items.forEach((item) => {
        if (!item.isMainPermission) {
          const childPerm = permissionMap.get(item.key);
          if (childPerm && selectedPermissionIds.has(childPerm.id)) {
            idsToToggleSet.add(childPerm.id);
          }
        }
      });
    }

    // Add the permissions in this group that need to change state
    permissionIds.forEach((id) => {
      const isCurrentlySelected = selectedPermissionIds.has(id);
      // If turning ON and not selected, OR turning OFF and selected, then toggle
      if (
        (!allSelected && !isCurrentlySelected) ||
        (allSelected && isCurrentlySelected)
      ) {
        idsToToggleSet.add(id);
      }
    });

    const idsToToggle = Array.from(idsToToggleSet);

    if (idsToToggle.length > 0) {
      onToggle(idsToToggle);
    }
  };

  const sectionWarnings = useMemo(
    () => getSectionWarnings(section.id, selectedPermissionIds, permissions),
    [section, selectedPermissionIds, permissions]
  );

  return (
    <div className="mb-6 rounded-lg border border-gray-300 p-4 last:mb-0">
      <h3 className="mb-3 text-sm font-semibold">{section.title}</h3>
      <div className="space-y-0">
        {Array.from(groupedItems.entries()).map(([label, items]) => {
          // Get all permissions for this group
          const groupPermissions = items
            .map((item) => permissionMap.get(item.key))
            .filter((p): p is Permission => p != null);

          if (groupPermissions.length === 0) {
            return null;
          }

          const firstItem = items[0];
          const isDisabled =
            !firstItem.isMainPermission && !isMainPermissionSelected;

          // Check if ALL permissions in the group are selected
          const isSelected = groupPermissions.every((p) =>
            selectedPermissionIds.has(p.id)
          );

          const permissionIds = groupPermissions.map((p) => p.id);

          return (
            <PermissionItem
              key={label}
              isDisabled={isDisabled}
              isSelected={isSelected}
              permission={firstItem}
              onToggle={() => handleToggle(permissionIds, firstItem)}
            />
          );
        })}
      </div>
      {sectionWarnings.length > 0 && (
        <div className="mt-4">
          {sectionWarnings.map((warning: string, index: number) => (
            <PermissionWarning key={index} message={warning} />
          ))}
        </div>
      )}
    </div>
  );
}
