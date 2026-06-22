"use client";

import type { DesignRequestStatus } from "@/api/types/designRequest";

import {
  getDesignRequestStatusBadgeClass,
  getDesignRequestStatusLabel,
} from "../../lib/design-request-status";

export interface DesignRequestListStatusBadgeProps {
  status: DesignRequestStatus;
  className?: string;
}

export function DesignRequestListStatusBadge({
  status,
  className = "",
}: DesignRequestListStatusBadgeProps) {
  return (
    <span
      className={`inline-flex max-w-full items-center truncate rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${getDesignRequestStatusBadgeClass(status)} ${className}`}
      title={getDesignRequestStatusLabel(status)}
    >
      {getDesignRequestStatusLabel(status)}
    </span>
  );
}
