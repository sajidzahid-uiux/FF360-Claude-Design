"use client";

import { cn } from "@fieldflow360/org-ui";

import { Skeleton } from "@/shared/ui";

const CARD_COUNT = 4;

export interface MobileTimelineSkeletonProps {
  className?: string;
}

export function MobileTimelineSkeleton({
  className,
}: MobileTimelineSkeletonProps) {
  return (
    <div
      className={cn("bg-bg-app flex flex-col gap-3 px-4 py-3 pb-6", className)}
    >
      {Array.from({ length: CARD_COUNT }).map((_, i) => (
        <div
          key={i}
          className="border-border-subtle bg-bg-surface-elevated rounded-[12px] border p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.06)]"
        >
          <div className="flex flex-wrap items-center gap-1.5">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>

          <Skeleton className="mt-2 h-5 w-3/4" />
          <Skeleton className="mt-1.5 h-4 w-1/2" />

          <div className="bg-bg-surface/40 mt-3 rounded-[8px] p-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="mt-2 h-[6px] w-full rounded-full" />
            <div className="mt-2 flex items-center justify-between">
              {Array.from({ length: 5 }).map((__, j) => (
                <Skeleton key={j} className="h-2.5 w-3" />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
