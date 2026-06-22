"use client";

import { ComponentProps } from "react";

import { cn } from "@fieldflow360/org-ui";

function Progress({
  className,
  max = 100,
  value,
  ...props
}: ComponentProps<"div"> & { max?: number; value?: number }) {
  const safeMax = max > 0 ? max : 100;
  const clampedValue = Math.min(safeMax, Math.max(0, value ?? 0));
  const percent = (clampedValue / safeMax) * 100;

  return (
    <div
      aria-valuemax={safeMax}
      aria-valuemin={0}
      aria-valuenow={clampedValue}
      className={cn(
        "bg-accent/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      data-slot="progress"
      role="progressbar"
      {...props}
    >
      <div
        className="bg-accent h-full w-full flex-1 transition-all"
        data-slot="progress-indicator"
        style={{ transform: `translateX(-${100 - percent}%)` }}
      />
    </div>
  );
}

export { Progress };
