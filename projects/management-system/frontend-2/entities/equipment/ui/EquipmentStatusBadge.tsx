"use client";

import { cn } from "@fieldflow360/org-ui";

import { SERVICE_STATUS_LABELS, ServiceStatus } from "@/constants";

function getServiceStatusLabel(status: string | undefined): string {
  if (status === ServiceStatus.ACTIVE || status === ServiceStatus.UNAVAILABLE) {
    return SERVICE_STATUS_LABELS[status];
  }
  return "Unknown";
}

export interface EquipmentStatusBadgeProps {
  serviceStatus?: string;
  className?: string;
}

export function EquipmentStatusBadge({
  serviceStatus,
  className,
}: EquipmentStatusBadgeProps) {
  const isActive = serviceStatus === ServiceStatus.ACTIVE;

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
        isActive
          ? "bg-green-500/15 text-green-600 dark:text-green-400"
          : "bg-red-500/15 text-red-600 dark:text-red-400",
        className
      )}
    >
      {getServiceStatusLabel(serviceStatus)}
    </span>
  );
}
