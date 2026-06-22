"use client";

import { cn } from "@fieldflow360/org-ui";

import { DASHBOARD_CHART_ROW_SIZES } from "../lib/dashboard-chart-rows";
import {
  dashboardBentoCell,
  dashboardChartRowClassName,
  dashboardPriorityCardClassName,
  dashboardPriorityRowClassName,
} from "./dashboard-grid";

function DashboardSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("bg-bg-surface animate-pulse rounded-md", className)}
    />
  );
}

export function DashboardLoading() {
  return (
    <div className="space-y-5">
      <div className={dashboardPriorityRowClassName}>
        <DashboardSkeleton className={dashboardPriorityCardClassName} />
        <DashboardSkeleton className={dashboardPriorityCardClassName} />
      </div>
      <div className={dashboardChartRowClassName(3)}>
        {Array.from({ length: 3 }, (_, cellIndex) => (
          <DashboardSkeleton key={cellIndex} className={dashboardBentoCell} />
        ))}
      </div>
      {DASHBOARD_CHART_ROW_SIZES.map((size, rowIndex) => (
        <div key={rowIndex} className={dashboardChartRowClassName(size)}>
          {Array.from({ length: size }, (_, cellIndex) => (
            <DashboardSkeleton key={cellIndex} className={dashboardBentoCell} />
          ))}
        </div>
      ))}
    </div>
  );
}
