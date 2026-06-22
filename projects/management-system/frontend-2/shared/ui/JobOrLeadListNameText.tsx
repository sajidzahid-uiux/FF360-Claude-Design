"use client";

import { cn } from "@fieldflow360/org-ui";

import { TouchSlideText } from "@/shared/ui/common";

/** Fixed cap so table cells detect overflow (td layout + w-full alone often does not). */
const TABLE_NAME_MAX_WIDTH = "w-full max-w-[240px]";
const CARD_NAME_MAX_WIDTH = "w-full min-w-0";

export interface JobOrLeadListNameTextProps {
  name: string;
  className?: string;
  /** TouchSlideText maxWidth utility classes */
  maxWidth?: string;
}

/** Primary contact + farm label in list / table cells (slide when overflow). */
export function JobOrLeadListNameText({
  name,
  className,
  maxWidth = TABLE_NAME_MAX_WIDTH,
}: JobOrLeadListNameTextProps) {
  return (
    <div className="min-w-0">
      <TouchSlideText
        className={cn("font-medium", className)}
        maxWidth={maxWidth}
        text={name}
      />
    </div>
  );
}

/** Same label in grid / kanban card headers. */
export function JobOrLeadListNameCardText({
  name,
  className,
}: Pick<JobOrLeadListNameTextProps, "name" | "className">) {
  return (
    <JobOrLeadListNameText
      className={cn("text-text-primary text-[16px] font-semibold", className)}
      maxWidth={CARD_NAME_MAX_WIDTH}
      name={name}
    />
  );
}
