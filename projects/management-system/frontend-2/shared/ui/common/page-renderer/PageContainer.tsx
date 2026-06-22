"use client";

import { ReactNode } from "react";

import { cn } from "@fieldflow360/org-ui";

import { useIsMobile } from "@/hooks";

export interface PageContainerProps {
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  padding?: "none" | "sm" | "md" | "lg" | "responsive";
  fullHeight?: boolean;
  fullWidth?: boolean;
  className?: string;
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-full",
};

const paddingClasses = {
  none: "",
  sm: "px-4 py-2",
  md: "px-8 pt-4 pb-2",
  lg: "px-10 py-5",
  responsive: "p-4 sm:p-8 py-2 sm:py-4",
};

export function PageContainer({
  children,
  maxWidth = "full",
  padding = "md",
  fullHeight = false,
  fullWidth = false,
  className,
}: PageContainerProps) {
  const isMobile = useIsMobile();
  const paddingClass = isMobile ? "p-4" : paddingClasses[padding];

  return (
    <div
      className={cn(
        "bg-bg-surface flex flex-col gap-4",
        "h-auto min-h-0",
        paddingClass,
        fullHeight && "min-h-screen",
        fullWidth && "w-full",
        maxWidth !== "full" && maxWidthClasses[maxWidth],
        className
      )}
    >
      {children}
    </div>
  );
}
