"use client";

import { useMemo } from "react";

import { FieldFlowBarChart } from "@fieldflow360/org-ui";

import { DashboardChartCard } from "./DashboardChartCard";

export interface JobsMetricsBarChartProps {
  title: string;
  totalJobs: number;
  sharedWithDesigners: number;
  className?: string;
}

export function JobsMetricsBarChart({
  title,
  totalJobs,
  sharedWithDesigners,
  className,
}: JobsMetricsBarChartProps) {
  const data = useMemo(
    () => [
      { category: "Total Jobs", count: totalJobs },
      {
        category: "Not Shared",
        count: Math.max(0, totalJobs - sharedWithDesigners),
      },
      {
        category: "Shared with Designers",
        count: sharedWithDesigners,
      },
    ],
    [sharedWithDesigners, totalJobs]
  );

  return (
    <DashboardChartCard className={className} title={title}>
      <FieldFlowBarChart
        legendScrollable
        showLegend
        data={data}
        emptyTitle="No job data"
        height={280}
        xKey="category"
        yKey="count"
      />
    </DashboardChartCard>
  );
}
