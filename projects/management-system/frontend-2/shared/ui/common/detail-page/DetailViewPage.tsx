"use client";

import type { ReactNode } from "react";

import { cn } from "@fieldflow360/org-ui";

import {
  DetailViewPageHeader,
  type DetailViewPageHeaderProps,
} from "./DetailViewPageHeader";
import { useAutoHideChrome } from "./useAutoHideChrome";

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
  /**
   * When true, the header and sticky footer slide out of view as the body is
   * scrolled down and slide back in on scroll up. Used by lead/job detail
   * pages to reclaim reading space; off by default for other detail views.
   */
  autoHideChromeOnScroll?: boolean;
}

export function DetailViewPage({
  children,
  constrainBodyWidth = true,
  bodyClassName,
  contentClassName,
  className,
  footer,
  autoHideChromeOnScroll = false,
  ...headerProps
}: DetailViewPageProps) {
  const { scrollRef, headerRef, footerRef, headerStyle, footerStyle } =
    useAutoHideChrome(autoHideChromeOnScroll);

  return (
    <div
      className={cn(
        DETAIL_PAGE_ROOT_CLASS,
        autoHideChromeOnScroll && "overflow-hidden",
        className
      )}
    >
      <div ref={autoHideChromeOnScroll ? headerRef : undefined} style={headerStyle}>
        <DetailViewPageHeader {...headerProps} />
      </div>

      <div
        ref={autoHideChromeOnScroll ? scrollRef : undefined}
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

      {footer ? (
        <div ref={autoHideChromeOnScroll ? footerRef : undefined} style={footerStyle}>
          {footer}
        </div>
      ) : null}
    </div>
  );
}
