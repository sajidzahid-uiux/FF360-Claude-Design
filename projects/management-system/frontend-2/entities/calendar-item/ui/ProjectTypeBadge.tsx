"use client";

import { cn } from "@fieldflow360/org-ui";

import type { CalendarItem } from "../model/types";

const SIZE_CLASS = {
  xs: "h-[15px] max-w-[8rem] overflow-hidden rounded-[6px] px-1.5 text-[7px]",
  sm: "h-[22px] max-w-[11rem] overflow-hidden rounded-[6px] px-2.5 text-[11px]",
  pill: "h-6 max-w-[12rem] overflow-hidden rounded-full px-2.5 text-[11px]",
  md: "h-[25px] max-w-[14rem] overflow-hidden rounded-md px-3 text-[13px]",
} as const;

export type ProjectTypeBadgeSize = keyof typeof SIZE_CLASS;

/** True when the item has an assigned project type from scheduling API. */
export function calendarItemHasProjectType(
  item: CalendarItem
): item is CalendarItem & {
  projectType: NonNullable<CalendarItem["projectType"]>;
} {
  return item.projectType != null;
}

export interface ProjectTypeBadgeProps {
  name: string;
  color: string;
  /** Layout variant aligned with neighbouring `Pill` sizes */
  size?: ProjectTypeBadgeSize;
  className?: string;
}

/**
 * Chromed label for org project type (`SchedulingItem.project_type`), matching list UIs that use Badge + backgroundColor.
 */
export function ProjectTypeBadge({
  name,
  color,
  size = "md",
  className,
}: ProjectTypeBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center font-medium text-white",
        SIZE_CLASS[size],
        className
      )}
      style={{ backgroundColor: color }}
      title={name}
    >
      <span className="min-w-0 truncate">{name}</span>
    </span>
  );
}
