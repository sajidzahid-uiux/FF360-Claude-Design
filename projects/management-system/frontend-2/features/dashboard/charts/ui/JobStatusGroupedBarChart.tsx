"use client";

import { FieldFlowGroupedBarChart } from "@fieldflow360/org-ui";

import { DashboardChartCard } from "./DashboardChartCard";

export type JobStatusChartRow = Record<string, string | number>;

export interface JobStatusGroupedBarChartProps {
  title: string;
  data: JobStatusChartRow[];
  className?: string;
}

export function JobStatusGroupedBarChart({
  title,
  data,
  className,
}: JobStatusGroupedBarChartProps) {
  return (
    <DashboardChartCard className={className} title={title}>
      <div className="flex min-h-0 flex-1 flex-col justify-center">
        <FieldFlowGroupedBarChart
          ariaLabel={title}
          data={data}
          emptyTitle="No job status data"
          height={280}
          xKey="type"
        />
      </div>
    </DashboardChartCard>
  );
}
