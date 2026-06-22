"use client";

import { useMemo } from "react";

import { Dropdown, type DropdownOption, cn } from "@fieldflow360/org-ui";

import type { StatusItem } from "@/features/job-lead/ui/show-more-card/publicTypes";

import {
  coloredDropdownOptionIcon,
  coloredDropdownTrigger,
} from "./coloredDropdownTrigger";

interface StatusDropdownProps {
  statusTypes: StatusItem[];
  currentStatus: StatusItem | number | null | undefined;
  onStatusChange: (statusId: number) => void;
  disabled?: boolean;
  width?: number | "full" | "auto";
  showLabel?: boolean;
}

function resolveStatusId(
  currentStatus: StatusItem | number | null | undefined
): string | undefined {
  if (currentStatus == null) return undefined;
  if (typeof currentStatus === "object") {
    return currentStatus.id?.toString();
  }
  return String(currentStatus);
}

export function StatusDropdown({
  statusTypes,
  currentStatus,
  onStatusChange,
  disabled = false,
  width = "full",
  showLabel = true,
}: StatusDropdownProps) {
  const options = useMemo((): DropdownOption<string>[] => {
    return (statusTypes ?? []).map((status) => ({
      value: status.id.toString(),
      label: status.title,
      icon: coloredDropdownOptionIcon(status.color),
    }));
  }, [statusTypes]);

  const selectedValue = resolveStatusId(currentStatus);
  const selectedStatus = statusTypes?.find(
    (s) => s.id.toString() === selectedValue
  );

  const fullWidth = width === "full";
  const menuMinWidth = typeof width === "number" ? width : 280;

  return (
    <Dropdown
      className={cn(
        !fullWidth && width === "auto" && "w-auto",
        !fullWidth && typeof width === "number" && `max-w-[${width}px]`
      )}
      disabled={disabled}
      fullWidth={fullWidth}
      menuMinWidth={menuMinWidth}
      options={options}
      placeholder="Select status"
      trigger={({ isOpen, placeholder, disabled: triggerDisabled }) =>
        coloredDropdownTrigger({
          prefix: showLabel ? "Status:" : undefined,
          label: selectedStatus?.title,
          dotColor: selectedStatus?.color,
          placeholder,
          disabled: triggerDisabled,
          isOpen,
        })
      }
      value={selectedValue}
      onChange={(value) => onStatusChange(parseInt(value, 10))}
    />
  );
}
