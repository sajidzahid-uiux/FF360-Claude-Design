"use client";

import { type ReactNode, useMemo } from "react";

import { FieldFlowRadialChart, sumChartValues } from "@fieldflow360/org-ui";

import { mapLegendToRadialData } from "../lib/map-legend-to-radial-data";
import { DashboardChartCard } from "./DashboardChartCard";

export interface LegendRadialChartProps {
  title: string;
  legend: Record<string, number>;
  /** e.g. tabs placed beside the title */
  headerAfterTitle?: ReactNode;
  className?: string;
  titleClassName?: string;
}

export function LegendRadialChart({
  title,
  legend,
  headerAfterTitle,
  className,
  titleClassName,
}: LegendRadialChartProps) {
  const radialData = useMemo(() => mapLegendToRadialData(legend), [legend]);
  const total = useMemo(() => sumChartValues(radialData), [radialData]);

  return (
    <DashboardChartCard
      className={className}
      headerAfterTitle={headerAfterTitle}
      title={title}
      titleClassName={titleClassName}
    >
      <FieldFlowRadialChart
        legendScrollable
        showLegend
        centerLabel={{ value: total.toLocaleString() }}
        data={radialData}
        emptyTitle="No data"
        height={280}
      />
    </DashboardChartCard>
  );
}
