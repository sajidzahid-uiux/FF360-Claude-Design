"use client";

import type { ReactNode } from "react";

import { ArrowLeft } from "lucide-react";

export interface DetailViewPageHeaderProps {
  backLabel: string;
  onBack: () => void;
  /** Shown under breadcrumbs (address, email/phone, etc.). Title lives in breadcrumbs only. */
  subtitle?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
}

export function DetailViewPageHeader({
  backLabel,
  onBack,
  subtitle,
  meta,
  actions,
}: DetailViewPageHeaderProps) {
  return (
    <header className="border-border-subtle bg-bg-surface shrink-0 border-b px-4 py-5 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-3">
          <button
            aria-label={backLabel}
            className="text-text-muted hover:text-text-primary hover:bg-bg-hover mt-0.5 shrink-0 rounded-lg p-1.5 transition-colors"
            type="button"
            onClick={onBack}
          >
            <ArrowLeft aria-hidden className="h-5 w-5" strokeWidth={2} />
          </button>
          <div className="min-w-0 flex-1">
            {subtitle ? (
              <p className="text-text-primary line-clamp-2 text-sm font-medium sm:text-base">
                {subtitle}
              </p>
            ) : null}
            {meta ? (
              <div
                className={
                  subtitle
                    ? "mt-3 flex flex-wrap items-center gap-x-4 gap-y-2"
                    : "flex flex-wrap items-center gap-x-4 gap-y-2"
                }
              >
                {meta}
              </div>
            ) : null}
          </div>
        </div>

        {actions ? (
          <div className="flex max-w-full min-w-0 shrink-0 flex-nowrap items-center gap-2 overflow-x-auto lg:max-w-[55%] lg:justify-end">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}
