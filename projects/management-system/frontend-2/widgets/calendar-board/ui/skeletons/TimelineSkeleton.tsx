"use client";

import { cn } from "@fieldflow360/org-ui";

import { Skeleton } from "@/shared/ui";

const LEFT_COL_WIDTH_PX = 280;
const TIMELINE_MIN_WIDTH_PX = 780;
const HEADER_ROW_HEIGHT_PX = 38;
const ROW_HEIGHT_PX = 72;
const ROW_COUNT = 6;

export interface TimelineSkeletonProps {
  /** Number of day cells in the axis header (7 for week, 28-31 for month). */
  daysCount: number;
  className?: string;
}

export function TimelineSkeleton({
  daysCount,
  className,
}: TimelineSkeletonProps) {
  const gridStyle = {
    gridTemplateColumns: `${LEFT_COL_WIDTH_PX}px minmax(${TIMELINE_MIN_WIDTH_PX}px, 1fr)`,
    gridTemplateRows: `${HEADER_ROW_HEIGHT_PX}px repeat(${ROW_COUNT}, ${ROW_HEIGHT_PX}px) 1fr`,
  } as const;

  return (
    <div className={cn("flex flex-1 flex-col px-4 pb-4 sm:px-6", className)}>
      <div className="border-border-subtle bg-bg-app flex flex-1 flex-col overflow-hidden rounded-xl border shadow-sm">
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="relative grid flex-1" style={gridStyle}>
            <div className="border-border-subtle from-muted/50 to-muted flex items-center gap-2 border-r bg-gradient-to-r px-3">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-20" />
            </div>
            <div
              className="from-muted/50 to-muted grid bg-gradient-to-r"
              style={{
                gridTemplateColumns: `repeat(${daysCount}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: daysCount }).map((_, i) => (
                <div key={i} className="flex items-center justify-center">
                  <Skeleton className="h-3 w-6" />
                </div>
              ))}
            </div>

            {Array.from({ length: ROW_COUNT }).map((_, rowIndex) => {
              const left = ((rowIndex * 11) % 60) + 2;
              const width = 18 + ((rowIndex * 7) % 40);
              return (
                <div key={rowIndex} className="contents">
                  <div className="border-border-subtle flex items-center gap-3 border-t border-r px-3">
                    <Skeleton className="h-9 w-9 rounded-md" />
                    <div className="flex flex-1 flex-col gap-1.5">
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-2.5 w-1/2" />
                    </div>
                  </div>
                  <div className="border-border-subtle relative border-t">
                    <Skeleton
                      className="absolute top-1/2 h-5 -translate-y-1/2 rounded-full"
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}

            <div className="border-border-subtle border-t border-r" />
            <div />
          </div>
        </div>
      </div>
    </div>
  );
}
