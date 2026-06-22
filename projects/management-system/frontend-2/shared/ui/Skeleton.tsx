import type { HTMLAttributes } from "react";

import { cn } from "@fieldflow360/org-ui";

export type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn("bg-bg-surface animate-pulse rounded-md", className)}
      {...props}
    />
  );
}
