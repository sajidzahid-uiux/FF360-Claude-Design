"use client";

import { useMemo } from "react";

import { FieldFlowBarChart } from "@fieldflow360/org-ui";

import { useOrganizationSettingsData } from "@/hooks";

import { DashboardChartCard } from "./DashboardChartCard";

export interface EquipmentMetricsBarChartProps {
  title: string;
  totalEquipment: number;
  inMaintenance: number;
  nearingMaintenance: number;
  className?: string;
}

export function EquipmentMetricsBarChart({
  title,
  totalEquipment,
  inMaintenance,
  nearingMaintenance,
  className,
}: EquipmentMetricsBarChartProps) {
  const { data: settings } = useOrganizationSettingsData();

  const threshold = (
    settings as { near_maintenance_warning_threshold?: number }
  )?.near_maintenance_warning_threshold;

  const data = useMemo(
    () => [
      { category: "Total Equipment", count: totalEquipment },
      { category: "In Maintenance", count: inMaintenance },
      {
        category: `Nearing Maintenance < ${threshold ?? "—"} hrs`,
        count: nearingMaintenance,
      },
    ],
    [inMaintenance, nearingMaintenance, threshold, totalEquipment]
  );

  return (
    <DashboardChartCard className={className} title={title}>
      <FieldFlowBarChart
        legendScrollable
        showLegend
        data={data}
        emptyTitle="No equipment data"
        height={280}
        xKey="category"
        yKey="count"
      />
    </DashboardChartCard>
  );
}
