"use client";

import { useMemo } from "react";

import { Dropdown, type DropdownOption, cn } from "@fieldflow360/org-ui";
import { User } from "lucide-react";

import { useJobAssignedToFilter } from "@/features/jobs/hooks/useJobAssignedToFilter";

interface AssignedToFilterSelectProps {
  className?: string;
  disabled?: boolean;
  /** Compact label for tight toolbars */
  compact?: boolean;
}

export function AssignedToFilterSelect({
  className,
  disabled,
  compact,
}: AssignedToFilterSelectProps) {
  const {
    assignedTo,
    setAssignedTo,
    isPreferenceReady,
    isAdmin,
    memberOptions,
    isPersisting,
  } = useJobAssignedToFilter();

  const value = assignedTo ?? "all";

  const options = useMemo((): DropdownOption<string>[] => {
    const list: DropdownOption<string>[] = [
      { value: "all", label: "All jobs" },
      { value: "me", label: "Assigned to me" },
    ];
    if (isAdmin && memberOptions.length > 0) {
      for (const member of memberOptions) {
        list.push({ value: String(member.id), label: member.label });
      }
    }
    return list;
  }, [isAdmin, memberOptions]);

  const displayLabel = useMemo(() => {
    if (!isPreferenceReady) return "Loading…";
    const selected = options.find((option) => option.value === value);
    return selected?.label ?? "All jobs";
  }, [isPreferenceReady, options, value]);

  const isDisabled = Boolean(disabled || !isPreferenceReady || isPersisting);

  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      {!compact && (
        <span className="text-text-muted shrink-0 text-sm whitespace-nowrap">
          Assigned to
        </span>
      )}
      <Dropdown
        className="w-[min(100vw-2rem,220px)] min-w-[160px] lg:w-[220px]"
        disabled={isDisabled}
        fullWidth={false}
        menuMinWidth={220}
        options={options}
        placeholder="Assigned to"
        trigger={({ isOpen, disabled: triggerDisabled }) => (
          <button
            aria-expanded={isOpen}
            className={cn(
              "border-border-subtle hover:bg-bg-hover focus:ring-border-strong flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 text-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none",
              triggerDisabled && "cursor-not-allowed opacity-50"
            )}
            disabled={triggerDisabled}
            type="button"
          >
            <span className="flex min-w-0 flex-1 items-center gap-2">
              <User aria-hidden className="text-text-muted h-4 w-4 shrink-0" />
              <span className="truncate">{displayLabel}</span>
            </span>
          </button>
        )}
        value={value}
        onChange={setAssignedTo}
      />
    </div>
  );
}
