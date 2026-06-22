"use client";

import { useMemo } from "react";

import { cn } from "@fieldflow360/org-ui";

import type { DashboardInvoiceDisplayRow } from "@/api/types";

import { DashboardChartCard } from "../charts/ui/DashboardChartCard";

export type { DashboardInvoiceDisplayRow as DashboardInvoiceRow };

export interface DashboardInvoiceTableProps {
  data: DashboardInvoiceDisplayRow[];
  className?: string;
}

function StatusPill({ value }: { value: string }) {
  const isYes = value.toLowerCase() === "yes";
  return (
    <span
      className={cn(
        "inline-flex rounded-md border px-2.5 py-0.5 text-xs font-medium",
        isYes
          ? "border-[var(--color-feedback-success)]/40 text-[var(--color-feedback-success)]"
          : "border-[var(--color-feedback-error)]/40 text-[var(--color-feedback-error)]"
      )}
    >
      {value}
    </span>
  );
}

export function DashboardInvoiceTable({
  data = [],
  className,
}: DashboardInvoiceTableProps) {
  const countLabel = useMemo(
    () => (data.length === 1 ? "1 invoice" : `${data.length} invoices`),
    [data.length]
  );

  return (
    <DashboardChartCard
      className={className}
      headerAfterTitle={
        data.length > 0 ? (
          <span className="text-text-muted text-sm tabular-nums">
            {countLabel}
          </span>
        ) : undefined
      }
      title="Invoices"
    >
      <div className="min-h-0 flex-1 overflow-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-bg-surface/50 border-b">
              <th className="text-text-muted px-3 py-2 text-left font-medium">
                Customer
              </th>
              <th className="text-text-muted px-3 py-2 text-left font-medium">
                PO Number
              </th>
              <th className="text-text-muted px-3 py-2 text-left font-medium">
                Checked by Admin
              </th>
              <th className="text-text-muted px-3 py-2 text-left font-medium">
                Sent to Client
              </th>
              <th className="text-text-muted px-3 py-2 text-left font-medium">
                Paid
              </th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  className="text-text-muted h-24 px-3 text-center"
                  colSpan={5}
                >
                  No invoices available
                </td>
              </tr>
            ) : (
              data.map((invoice, index) => (
                <tr
                  key={`${invoice.poNumber}-${index}`}
                  className="border-b last:border-b-0"
                >
                  <td className="px-3 py-2 font-medium">
                    {invoice.customerName}
                  </td>
                  <td className="px-3 py-2">{invoice.poNumber}</td>
                  <td className="px-3 py-2">
                    <StatusPill value={invoice.checkedByAdmin} />
                  </td>
                  <td className="px-3 py-2">
                    <StatusPill value={invoice.sentToClient} />
                  </td>
                  <td className="px-3 py-2">
                    <StatusPill value={invoice.paid} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </DashboardChartCard>
  );
}
