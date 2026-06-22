"use client";

import { ComponentProps } from "react";

import { cn } from "@fieldflow360/org-ui";

type SeparatorProps = ComponentProps<"div"> & {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
};

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: SeparatorProps) {
  return (
    <div
      aria-orientation={orientation}
      className={cn(
        "bg-border shrink-0",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className
      )}
      data-slot="separator-root"
      role={decorative ? "none" : "separator"}
      {...props}
    />
  );
}

export { Separator };
