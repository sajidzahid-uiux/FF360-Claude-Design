"use client";

import { useMemo } from "react";

import {
  FieldFlowRadialChart,
  type FieldFlowRadialChartDatum,
  sumChartValues,
} from "@fieldflow360/org-ui";

import type { DashboardInvoiceStatusCounts } from "@/api/types";

import { DashboardChartCard } from "./DashboardChartCard";

export type { DashboardInvoiceStatusCounts as InvoiceStatusChartData };

export interface InvoiceStatusRadialChartProps {
  title: string;
  data: DashboardInvoiceStatusCounts;
  className?: string;
}

export function InvoiceStatusRadialChart({
  title,
  data,
  className,
}: InvoiceStatusRadialChartProps) {
  const radialData = useMemo((): FieldFlowRadialChartDatum[] => {
    return [
      {
        id: "checked-by-admin",
        label: "Checked by Admin",
        value: data.checkedByAdmin,
      },
      {
        id: "sent-to-client",
        label: "Sent to Client",
        value: data.sentToClient,
      },
      { id: "paid", label: "Paid", value: data.paid },
    ];
  }, [data.checkedByAdmin, data.paid, data.sentToClient]);

  const total = useMemo(() => sumChartValues(radialData), [radialData]);

  return (
    <DashboardChartCard className={className} title={title}>
      <FieldFlowRadialChart
        legendScrollable
        showLegend
        centerLabel={{ value: total.toLocaleString(), subtitle: "Invoices" }}
        data={radialData}
        emptyTitle="No invoice data"
        height={280}
      />
    </DashboardChartCard>
  );
}
