"use client";

import { cn } from "@fieldflow360/org-ui";
import { AlertTriangle, CheckCircle2, Clock, Wrench } from "lucide-react";

type MaintenanceState = "overdue" | "due_soon" | "ok";

interface MaintenanceRow {
  equipment: string;
  item: string;
  /** Hours until (or past, when negative) the service threshold. */
  hoursRemaining: number;
  state: MaintenanceState;
}

// Demo data derived from the equipment module fixtures (filters + thresholds).
const MAINTENANCE_ROWS: MaintenanceRow[] = [
  {
    equipment: "CAT 336 Excavator",
    item: "Hydraulic filter (HF-336-B)",
    hoursRemaining: -180,
    state: "overdue",
  },
  {
    equipment: "Soil-Max Gold Tile Plow",
    item: "Hydraulic filter (HF-SM-9)",
    hoursRemaining: -75,
    state: "overdue",
  },
  {
    equipment: "Bobcat T770 Track Loader",
    item: "Oil filter (OF-T770-1)",
    hoursRemaining: 110,
    state: "due_soon",
  },
  {
    equipment: "CAT 336 Excavator",
    item: "Fuel filter (FF-336-A)",
    hoursRemaining: 420,
    state: "ok",
  },
];

const STATE_META: Record<
  MaintenanceState,
  { label: string; badge: string; Icon: typeof Wrench }
> = {
  overdue: {
    label: "Overdue",
    badge: "bg-feedback-error/15 text-feedback-error border-feedback-error/30",
    Icon: AlertTriangle,
  },
  due_soon: {
    label: "Due soon",
    badge: "bg-feedback-warning/15 text-feedback-warning border-feedback-warning/30",
    Icon: Clock,
  },
  ok: {
    label: "OK",
    badge: "bg-feedback-success/15 text-feedback-success border-feedback-success/30",
    Icon: CheckCircle2,
  },
};

function hoursLabel(row: MaintenanceRow): string {
  if (row.hoursRemaining < 0) {
    return `${Math.abs(row.hoursRemaining)} hrs past due`;
  }
  return `${row.hoursRemaining} hrs left`;
}

/**
 * Maintenance status across the job's assigned equipment — filter/service items
 * with their overdue / due-soon / ok state. Presentational demo card for the
 * On-Site Tracking page.
 */
export function JobMaintenanceStatusSection() {
  const overdueCount = MAINTENANCE_ROWS.filter(
    (row) => row.state === "overdue"
  ).length;

  return (
    <section className="border-border-subtle bg-bg-surface-elevated min-w-0 space-y-4 overflow-hidden rounded-xl border p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-text-primary truncate text-base font-semibold">
            Maintenance status
          </h2>
          <p className="text-text-muted mt-0.5 truncate text-sm">
            Filter and service items across assigned equipment.
          </p>
        </div>
        {overdueCount > 0 ? (
          <span className="bg-feedback-error/15 text-feedback-error border-feedback-error/30 shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap">
            {overdueCount} overdue
          </span>
        ) : null}
      </div>

      <ul className="divide-border-subtle divide-y">
        {MAINTENANCE_ROWS.map((row, index) => {
          const meta = STATE_META[row.state];
          const { Icon } = meta;
          return (
            <li
              key={`${row.equipment}-${row.item}-${index}`}
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <Wrench
                  aria-hidden
                  className="text-text-muted h-4 w-4 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-text-primary truncate text-sm font-medium">
                    {row.equipment}
                  </p>
                  <p className="text-text-muted truncate text-xs">{row.item}</p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold",
                    meta.badge
                  )}
                >
                  <Icon aria-hidden className="h-3 w-3" />
                  {meta.label}
                </span>
                <span className="text-text-muted text-xs whitespace-nowrap">
                  {hoursLabel(row)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
