"use client";

import { cn } from "@fieldflow360/org-ui";

import { Skeleton } from "@/shared/ui";

export interface StatsRowSkeletonProps {
  className?: string;
}

export function StatsRowSkeleton({ className }: StatsRowSkeletonProps) {
  return (
    <>
      <div
        className={cn(
          "bg-bg-app flex flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4 py-2 md:hidden",
          className
        )}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="inline-flex items-center gap-1.5">
            <Skeleton className="h-2 w-2 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>

      <div
        className={cn(
          "bg-bg-app hidden flex-wrap items-center justify-between gap-3 px-4 py-2 sm:px-6 md:flex",
          className
        )}
      >
        <Skeleton className="h-[41px] w-[230px] rounded-[8px]" />

        <div className="flex flex-wrap items-center gap-[8px]">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[41px] w-[140px] rounded-[14px]" />
          ))}
        </div>
      </div>
    </>
  );
}
