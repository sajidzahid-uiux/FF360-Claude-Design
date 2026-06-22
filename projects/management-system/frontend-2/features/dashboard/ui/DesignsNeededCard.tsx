"use client";

import { useMemo } from "react";

import { cn } from "@fieldflow360/org-ui";
import { CheckCircle2, ChevronRight, Loader2, PenLine } from "lucide-react";

import type { DashboardDesignNeededRow } from "@/api/types";

import { DashboardChartCard } from "../charts/ui/DashboardChartCard";
import { useDesignsTableNavigation } from "../hooks/useDesignsTableNavigation";

export type { DashboardDesignNeededRow as DesignNeededItem };

export interface DesignsNeededCardProps {
  data: DashboardDesignNeededRow[];
  className?: string;
}

function rowNavigationKey(job: DashboardDesignNeededRow): string {
  return (
    job.rowKey ??
    (job.designId != null
      ? String(job.designId)
      : `${job.customerName}::${job.poNumber}`)
  );
}

export function DesignsNeededCard({
  data = [],
  className,
}: DesignsNeededCardProps) {
  const { navigatingKey, handleNavigate } = useDesignsTableNavigation();
  const count = data.length;
  const countLabel = useMemo(
    () => (count === 1 ? "1 item" : `${count} items`),
    [count]
  );

  return (
    <DashboardChartCard
      className={className}
      headerAfterTitle={
        count > 0 ? (
          <span className="bg-bg-surface text-text-muted shrink-0 rounded-md px-2 py-0.5 text-xs font-medium tabular-nums">
            {countLabel}
          </span>
        ) : undefined
      }
      title="Designs needed"
    >
      {count === 0 ? (
        <div className="border-border-subtle bg-bg-surface/30 flex flex-1 items-center gap-3 rounded-lg border border-dashed px-4 py-3">
          <span
            aria-hidden
            className="bg-bg-surface text-text-muted flex size-9 shrink-0 items-center justify-center rounded-full"
          >
            <CheckCircle2 className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-text-primary text-sm font-medium">
              You&apos;re all caught up
            </p>
            <p className="text-text-muted text-xs leading-snug">
              New tile leads and jobs that need design will show up here
            </p>
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="border-border-subtle bg-bg-surface/40 mb-3 flex shrink-0 items-baseline gap-2 rounded-lg border px-3 py-2.5">
            <p className="text-text-primary text-2xl leading-none font-bold tabular-nums">
              {count}
            </p>
            <p className="text-text-muted text-xs font-medium tracking-wide uppercase">
              pending
            </p>
          </div>
          <ul className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
            {data.map((job) => {
              const rowClickable =
                (job.canNavigate ?? true) &&
                (job.href != null || job.designId != null);
              const rowNavKey = rowNavigationKey(job);
              const isNavigating =
                navigatingKey != null && navigatingKey === rowNavKey;

              return (
                <li key={rowNavKey}>
                  <button
                    aria-busy={isNavigating || undefined}
                    className={cn(
                      "border-border-subtle bg-bg-app hover:border-accent/35 hover:bg-bg-hover focus-visible:ring-border-strong flex w-full items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none",
                      !rowClickable && "cursor-default opacity-80",
                      isNavigating && "pointer-events-none opacity-70"
                    )}
                    disabled={!rowClickable || isNavigating}
                    type="button"
                    onClick={() => {
                      if (!rowClickable) return;
                      void handleNavigate({
                        href: job.href,
                        designId: job.designId,
                        navigationKey: rowNavKey,
                      });
                    }}
                  >
                    <span
                      aria-hidden
                      className="bg-accent/10 text-accent flex size-8 shrink-0 items-center justify-center rounded-md"
                    >
                      <PenLine className="size-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-text-primary block truncate text-sm font-semibold">
                        {job.customerName}
                      </span>
                      <span className="text-text-muted block truncate text-xs">
                        PO {job.poNumber}
                      </span>
                    </span>
                    {isNavigating ? (
                      <Loader2
                        aria-hidden
                        className="text-text-muted size-4 shrink-0 animate-spin"
                      />
                    ) : rowClickable ? (
                      <ChevronRight
                        aria-hidden
                        className="text-text-muted size-4 shrink-0"
                      />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </DashboardChartCard>
  );
}
