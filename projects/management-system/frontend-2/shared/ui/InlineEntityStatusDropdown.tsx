"use client";

import { useMemo } from "react";

import { Dropdown, type DropdownOption, cn } from "@fieldflow360/org-ui";

import { filterExternalStatusOptions } from "@/shared/lib/filterExternalStatusOptions";
import { TableStatusBadge } from "@/shared/ui/TableStatusBadge";
import { coloredDropdownOptionIcon } from "@/shared/ui/common/Dropdown/coloredDropdownTrigger";

export interface InlineStatusOption {
  id: number;
  title: string;
  color?: string;
}

interface InlineEntityStatusDropdownProps {
  statusTypes: InlineStatusOption[];
  currentStatus: InlineStatusOption | number | null | undefined;
  onStatusChange: (statusId: number) => void;
  disabled?: boolean;
  badgeClassName?: string;
}

function resolveCurrentStatus(
  currentStatus: InlineEntityStatusDropdownProps["currentStatus"],
  statusTypes: InlineStatusOption[]
): InlineStatusOption | undefined {
  if (currentStatus == null) return undefined;
  if (typeof currentStatus === "object") return currentStatus;
  return statusTypes.find((status) => status.id === currentStatus);
}

export function InlineEntityStatusDropdown({
  statusTypes,
  currentStatus,
  onStatusChange,
  disabled = false,
}: InlineEntityStatusDropdownProps) {
  const filteredStatusTypes = useMemo(
    () => filterExternalStatusOptions(statusTypes),
    [statusTypes]
  );

  const resolvedStatus = useMemo(
    () => resolveCurrentStatus(currentStatus, statusTypes),
    [currentStatus, statusTypes]
  );

  const options = useMemo((): DropdownOption<string>[] => {
    return filteredStatusTypes.map((status) => ({
      value: status.id.toString(),
      label: status.title,
      icon: coloredDropdownOptionIcon(status.color),
    }));
  }, [filteredStatusTypes]);

  if (!resolvedStatus) {
    return <span className="text-text-muted">N/A</span>;
  }

  if (disabled) {
    return (
      <TableStatusBadge
        color={resolvedStatus.color || "#9ca3af"}
        title={resolvedStatus.title}
      />
    );
  }

  return (
    <Dropdown
      menuMinWidth={220}
      options={options}
      trigger={({ isOpen }) => (
        <button
          className={cn(
            "inline-flex transition-opacity hover:opacity-80",
            isOpen && "opacity-80"
          )}
          type="button"
          onClick={(event) => event.stopPropagation()}
        >
          <TableStatusBadge
            color={resolvedStatus.color || "#9ca3af"}
            title={resolvedStatus.title}
          />
        </button>
      )}
      value={resolvedStatus.id.toString()}
      onChange={(value) => {
        const nextId = parseInt(value, 10);
        if (!Number.isNaN(nextId) && nextId !== resolvedStatus.id) {
          onStatusChange(nextId);
        }
      }}
    />
  );
}
