"use client";

import { useMemo } from "react";

import { Dropdown, type DropdownOption, cn } from "@fieldflow360/org-ui";

import type { ProjectType } from "@/api/types";
import { EmptyState } from "@/shared/ui/common";

import {
  coloredDropdownOptionIcon,
  coloredDropdownTrigger,
} from "./coloredDropdownTrigger";

interface ProjectTypeDropdownProps {
  projectTypes: ProjectType[];
  currentProjectType?: ProjectType | number | null;
  onProjectTypeChange: (projectTypeId: number | null) => void;
  disabled?: boolean;
  width?: number | "full";
  showLabel?: boolean;
}

function resolveProjectTypeId(
  currentProjectType: ProjectType | number | null | undefined
): string | undefined {
  if (!currentProjectType) return undefined;
  if (typeof currentProjectType === "object") {
    return currentProjectType.id?.toString();
  }
  return String(currentProjectType);
}

export function ProjectTypeDropdown({
  projectTypes,
  currentProjectType,
  onProjectTypeChange,
  disabled = false,
  width = "full",
  showLabel = true,
}: ProjectTypeDropdownProps) {
  const hasProjectTypes = projectTypes && projectTypes.length > 0;

  const options = useMemo((): DropdownOption<string>[] => {
    return (projectTypes ?? []).map((pt) => ({
      value: pt.id.toString(),
      label: pt.name,
      icon: coloredDropdownOptionIcon(pt.color),
    }));
  }, [projectTypes]);

  const selectedId = resolveProjectTypeId(currentProjectType);
  const selectedType = projectTypes?.find(
    (p) => p.id.toString() === selectedId
  );

  if (!hasProjectTypes) {
    return (
      <EmptyState
        className="py-4"
        description="No project types are configured yet. Add project types in Settings to enable this field."
        title="No project types available"
      />
    );
  }

  const fullWidth = width === "full";
  const menuMinWidth = typeof width === "number" ? width : 260;

  return (
    <Dropdown
      className={cn(
        !fullWidth && typeof width === "number" && `max-w-[${width}px]`
      )}
      disabled={disabled}
      fullWidth={fullWidth}
      menuMinWidth={menuMinWidth}
      options={options}
      placeholder="Select project type"
      trigger={({ isOpen, placeholder, disabled: triggerDisabled }) =>
        coloredDropdownTrigger({
          prefix: showLabel ? "Project type:" : undefined,
          label: selectedType?.name ?? "None",
          // Fall back to a neutral dot for the "None" state so the trigger
          // always shows a color circle, matching the Status dropdown.
          dotColor: selectedType?.color ?? "var(--color-text-muted, #9ca3af)",
          placeholder,
          disabled: triggerDisabled,
          isOpen,
        })
      }
      value={selectedId}
      onChange={(value) =>
        onProjectTypeChange(value ? parseInt(value, 10) : null)
      }
    />
  );
}
