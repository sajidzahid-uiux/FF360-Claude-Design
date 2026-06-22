"use client";

import { Clock } from "lucide-react";

import type { DesignRequestStatus } from "@/api/types/designRequest";

import {
  getDesignRequestStatusBadgeClass,
  getDesignRequestStatusLabel,
} from "../../lib/design-request-status";

export interface DesignRequestStatusBadgeProps {
  status: DesignRequestStatus;
  className?: string;
}

export function DesignRequestStatusBadge({
  status,
  className = "",
}: DesignRequestStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide uppercase ${getDesignRequestStatusBadgeClass(status)} ${className}`}
    >
      <Clock aria-hidden className="h-3.5 w-3.5" strokeWidth={2} />
      {getDesignRequestStatusLabel(status)}
    </span>
  );
}
