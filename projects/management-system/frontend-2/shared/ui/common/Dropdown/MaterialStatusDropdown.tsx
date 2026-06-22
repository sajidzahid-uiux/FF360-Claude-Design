"use client";

import { useMemo } from "react";

import { Dropdown, type DropdownOption, cn } from "@fieldflow360/org-ui";

import { MATERIAL_STATUS_OPTIONS, MaterialStatus } from "@/constants";

import { coloredDropdownTrigger } from "./coloredDropdownTrigger";

interface MaterialStatusDropdownProps {
  currentStatus: string | null | undefined;
  onStatusChange: (status: string) => void;
  disabled?: boolean;
  width?: number;
  showLabel?: boolean;
}

export function MaterialStatusDropdown({
  currentStatus,
  onStatusChange,
  disabled = false,
  width = 280,
  showLabel = true,
}: MaterialStatusDropdownProps) {
  const options = useMemo((): DropdownOption<string>[] => {
    return MATERIAL_STATUS_OPTIONS.map((status) => ({
      value: status.value,
      label: status.label,
    }));
  }, []);

  const currentStatusValue = currentStatus || MaterialStatus.IN_PROGRESS;
  const selectedOption = MATERIAL_STATUS_OPTIONS.find(
    (o) => o.value === currentStatusValue
  );

  return (
    <Dropdown
      className={cn(width && `max-w-[${width}px]`)}
      disabled={disabled}
      fullWidth={false}
      menuMinWidth={width}
      options={options}
      placeholder="Material status"
      trigger={({ isOpen, placeholder, disabled: triggerDisabled }) =>
        coloredDropdownTrigger({
          prefix: showLabel ? "Material status:" : undefined,
          label: !currentStatus ? "None" : selectedOption?.label,
          placeholder,
          disabled: triggerDisabled,
          isOpen,
        })
      }
      value={currentStatusValue}
      onChange={(value) => onStatusChange(value)}
    />
  );
}
