import { Toggle } from "@fieldflow360/org-ui";

import { PermissionItemConfig } from "../permissions-config";

interface PermissionSectionProps {
  permission: PermissionItemConfig;
  isSelected: boolean;
  isDisabled?: boolean;
  onToggle: () => void;
}

export function PermissionItem({
  permission,
  isSelected,
  isDisabled = false,
  onToggle,
}: PermissionSectionProps) {
  const { key, isMainPermission, label } = permission;
  const leftPadding = isMainPermission ? "ml-8" : "ml-16";

  return (
    <div
      className={`flex items-center gap-3 py-2 ${leftPadding} ${
        isDisabled ? "cursor-not-allowed opacity-50" : ""
      }`}
    >
      <Toggle
        aria-label={label}
        checked={isSelected && !isDisabled}
        disabled={isDisabled}
        id={`perm-${key}`}
        label={label}
        onChange={onToggle}
      />
    </div>
  );
}
