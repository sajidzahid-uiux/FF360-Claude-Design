"use client";

import { cn } from "@fieldflow360/org-ui";

import {
  type ActiveEquipmentCounts,
  MAINTENANCE_EQUIPMENT_INDICATOR_COLORS,
  MAINTENANCE_EQUIPMENT_INDICATOR_ORDER,
  MAINTENANCE_EQUIPMENT_TYPE_LABELS,
} from "@/api/types/maintenance";
import { Tooltip } from "@/shared/ui/primitives/tooltip";

interface MaintenanceIndicatorsProps {
  counts: ActiveEquipmentCounts;
  className?: string;
}

export function MaintenanceIndicators({
  counts,
  className,
}: MaintenanceIndicatorsProps) {
  return (
    <span className={cn("flex shrink-0 items-center gap-1.5", className)}>
      {MAINTENANCE_EQUIPMENT_INDICATOR_ORDER.map((type) => {
        const count = counts[type];
        if (count <= 0) return null;

        const colorClass = MAINTENANCE_EQUIPMENT_INDICATOR_COLORS[type];
        const label = MAINTENANCE_EQUIPMENT_TYPE_LABELS[type];
        const tooltipClassName = cn(
          "rounded-full border-0 px-2.5 py-1 text-[10px] font-semibold text-white shadow-md",
          colorClass
        );

        return (
          <Tooltip
            key={type}
            arrowClassName={cn("border-0", colorClass)}
            content={`${label}: ${count}`}
            contentClassName={tooltipClassName}
          >
            <span
              className={cn(
                "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold text-white",
                colorClass
              )}
            >
              {count}
            </span>
          </Tooltip>
        );
      })}
    </span>
  );
}
