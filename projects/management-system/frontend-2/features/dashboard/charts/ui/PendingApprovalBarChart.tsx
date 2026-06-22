"use client";

import { FieldFlowBarChart, cn } from "@fieldflow360/org-ui";

import { DashboardChartCard } from "./DashboardChartCard";

export interface PendingApprovalBarChartProps {
  title: string;
  data: Array<{ type: string; Count: number }>;
  className?: string;
}

export function PendingApprovalBarChart({
  title,
  data,
  className,
}: PendingApprovalBarChartProps) {
  return (
    <DashboardChartCard className={cn(className)} title={title}>
      <FieldFlowBarChart
        data={data}
        emptyTitle="No data"
        height={280}
        labelFormatter={(value) => value.slice(0, 3)}
        showLegend={false}
        xKey="type"
        yKey="Count"
      />
    </DashboardChartCard>
  );
}
