"use client";

import type { ReactNode } from "react";

import { cn } from "@fieldflow360/org-ui";

export interface DetailFormSectionProps {
  title: string;
  description?: string;
  /** Rendered at the end of the title row (edit, add, etc.). */
  actions?: ReactNode;
  children: ReactNode;
  /** Extra classes for the outer <section> (e.g. flex sizing when in a row). */
  className?: string;
}

export function DetailFormSection({
  title,
  description,
  actions,
  children,
  className,
}: DetailFormSectionProps) {
  return (
    <section
      className={cn(
        "border-border-subtle bg-bg-surface-elevated min-w-0 space-y-4 overflow-hidden rounded-xl border p-4 sm:p-5",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-text-primary truncate text-base font-semibold">
            {title}
          </h2>
          {description ? (
            <p className="text-text-muted mt-0.5 truncate text-sm">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          // Single non-wrapping row that scrolls horizontally when the actions
          // outgrow the available width (e.g. many "Go to <file>" buttons), so
          // the title/farm name is never squeezed or forced to wrap. The block
          // stays right-aligned via the title's flex-1; we intentionally avoid
          // justify-end here because it makes overflow spill off the left edge
          // (unreachable) instead of scrolling.
          <div className="flex min-w-0 max-w-[75%] items-center gap-2 overflow-x-auto [&>*]:shrink-0">
            {actions}
          </div>
        ) : null}
      </div>
      {children}
    </section>
  );
}
