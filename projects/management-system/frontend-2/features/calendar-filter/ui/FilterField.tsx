"use client";

import { Fragment, useMemo } from "react";

import {
  SearchableDropdown,
  type SearchableDropdownOption,
  cn,
} from "@fieldflow360/org-ui";
import { ChevronDown, ListFilter } from "lucide-react";

import type {
  CalendarFilterFieldConfig,
  CalendarFilterOption,
} from "../model/types";

export interface FilterFieldProps {
  config: CalendarFilterFieldConfig;
  values: string[];
  onValuesChange: (values: string[]) => void;
  className?: string;
}

const PAREN_REGEX = /^(.*?)(\s*\(.*\))$/;

function PlaceholderLabel({ text }: { text: string }) {
  const match = text.match(PAREN_REGEX);
  if (!match) {
    return <span className="text-text-primary">{text}</span>;
  }
  return (
    <Fragment>
      <span className="text-text-primary">{match[1]}</span>
      <span className="text-text-muted">{match[2]}</span>
    </Fragment>
  );
}

function toOptions(
  options: readonly CalendarFilterOption[]
): SearchableDropdownOption<string>[] {
  return options.map((option) => ({
    value: option.value,
    label: option.label,
    group: option.group ?? undefined,
  }));
}

export function FilterField({
  config,
  values,
  onValuesChange,
  className,
}: FilterFieldProps) {
  const dropdownOptions = useMemo(
    () => toOptions(config.options),
    [config.options]
  );
  const hasSelection = values.length > 0;
  const triggerLabel = hasSelection
    ? config.options
        .filter((option) => values.includes(option.value))
        .map((option) => option.label)
        .join(", ")
    : config.placeholder;

  return (
    <SearchableDropdown
      multiple
      className={className}
      emptyStateText="No options found"
      options={dropdownOptions}
      placeholder={config.placeholder}
      searchPlaceholder="Search..."
      trigger={({ isOpen }) => (
        <span
          aria-label={config.placeholder}
          className={cn(
            "border-accent bg-bg-app flex h-10 w-full items-center justify-between gap-2 rounded-full border px-3.5 text-[13px] leading-none font-medium transition-colors",
            "hover:bg-accent-light focus-visible:ring-accent/40 focus-visible:ring-2 focus-visible:outline-none"
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            <ListFilter className="text-text-primary h-4 w-4 shrink-0" />
            <span className="truncate">
              {hasSelection ? (
                <span className="text-text-primary">{triggerLabel}</span>
              ) : (
                <PlaceholderLabel text={triggerLabel} />
              )}
            </span>
          </span>
          <ChevronDown
            className={cn(
              "text-text-primary h-4 w-4 shrink-0 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </span>
      )}
      values={values}
      onValuesChange={onValuesChange}
    />
  );
}
