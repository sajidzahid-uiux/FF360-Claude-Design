"use client";

import {
  ORDER_PIPE_STATUS_COLORS,
  ORDER_PIPE_STATUS_LABELS,
  OrderPipeStatus,
} from "@/constants";

interface OrderStatusBadgeProps {
  status: string | null;
  showLabel?: boolean;
  onClick?: () => void;
}

export function OrderStatusBadge({
  status,
  showLabel = true,
  onClick,
}: OrderStatusBadgeProps) {
  if (!status) return null;

  const colorClass =
    ORDER_PIPE_STATUS_COLORS[status as OrderPipeStatus] ??
    "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";

  const label = ORDER_PIPE_STATUS_LABELS[status as OrderPipeStatus] ?? status;

  return (
    <div className="flex items-center gap-2">
      {showLabel && (
        <span className="text-text-muted text-sm">Order Status:</span>
      )}
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass} ${
          onClick ? "cursor-pointer transition-opacity hover:opacity-80" : ""
        }`}
        title={onClick ? "Click to view order details" : undefined}
        onClick={onClick}
      >
        {label}
      </span>
    </div>
  );
}
