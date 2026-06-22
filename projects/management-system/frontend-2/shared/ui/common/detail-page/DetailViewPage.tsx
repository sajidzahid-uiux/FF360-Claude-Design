"use client";

import type { ReactNode } from "react";

import { cn } from "@fieldflow360/org-ui";

import {
  DetailViewPageHeader,
  type DetailViewPageHeaderProps,
} from "./DetailViewPageHeader";

const DETAIL_PAGE_ROOT_CLASS = "flex h-full min-h-0 flex-col";

export interface DetailViewPageProps extends DetailViewPageHeaderProps {
  children: ReactNode;
  /** When true (default), body content uses `max-w-5xl` centered layout. */
  constrainBodyWidth?: boolean;
  bodyClassName?: string;
  contentClassName?: string;
  className?: string;
  /** Optional nodes rendered outside the scroll area (modals, dialog managers). */
  footer?: ReactNode;
}

export function DetailViewPage({
  children,
  constrainBodyWidth = true,
  bodyClassName,
  contentClassName,
  className,
  footer,
  ...headerProps
}: DetailViewPageProps) {
  return (
    <div className={cn(DETAIL_PAGE_ROOT_CLASS, className)}>
      <DetailViewPageHeader {...headerProps} />

      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto px-4 pb-8 sm:px-6",
          bodyClassName
        )}
      >
        <div
          className={cn(
            constrainBodyWidth && "mx-auto max-w-5xl space-y-5 pt-5",
            contentClassName
          )}
        >
          {children}
        </div>
      </div>

      {footer}
    </div>
  );
}
