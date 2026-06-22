"use client";

import type { ReactNode } from "react";

import { cn } from "@fieldflow360/org-ui";

export function DashboardChartCard({
  title,
  headerAfterTitle,
  children,
  className,
  titleClassName,
  stretchContent = true,
}: {
  title: string;
  headerAfterTitle?: ReactNode;
  children: ReactNode;
  className?: string;
  titleClassName?: string;
  /** When false, body sizes to content instead of filling the grid cell. */
  stretchContent?: boolean;
}) {
  return (
    <div
      className={cn(
        "border-border-subtle bg-bg-surface-elevated flex h-full min-h-0 flex-col overflow-hidden rounded-xl border p-5 shadow-sm",
        className
      )}
    >
      <div
        className={cn(
          "mb-4 flex shrink-0 items-center gap-3",
          headerAfterTitle ? "justify-between" : "justify-start"
        )}
      >
        <h2
          className={cn(
            "text-text-primary text-lg leading-tight font-semibold",
            titleClassName
          )}
        >
          {title}
        </h2>
        {headerAfterTitle}
      </div>
      <div
        className={cn(
          "flex min-h-0 flex-col",
          stretchContent && "min-h-0 flex-1 overflow-hidden"
        )}
      >
        {children}
      </div>
    </div>
  );
}
