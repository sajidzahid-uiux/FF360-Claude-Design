import type {
  DesignRequestStatus,
  DesignRequestStatusItem,
} from "@/api/types/designRequest";

import {
  DESIGN_REQUEST_ACTIVE_STATUSES,
  DESIGN_REQUEST_NOTE_WRITABLE_STATUSES,
} from "./constants";

export const DESIGN_REQUEST_STATUS_LABELS: Record<DesignRequestStatus, string> =
  {
    pending: "Waiting for Approval",
    approved: "Approved",
    rejected: "Rejected",
    in_progress: "Work in Progress",
    shared: "Shared",
    cancelled: "Cancelled",
  };

export function isActiveDesignRequestStatus(status: string): boolean {
  return (DESIGN_REQUEST_ACTIVE_STATUSES as readonly string[]).includes(status);
}

export function canWriteDesignRequestNotes(status: string): boolean {
  return (DESIGN_REQUEST_NOTE_WRITABLE_STATUSES as readonly string[]).includes(
    status
  );
}

export function canResubmitDesignRequest(status: string): boolean {
  return status === "rejected";
}

/** Submit form only before the first request, or when user explicitly starts a resubmit. */
export function shouldShowDesignRequestSubmitForm(
  statusItem: DesignRequestStatusItem | null,
  resubmitMode: boolean
): boolean {
  if (!statusItem) return true;
  return resubmitMode;
}

export function isDesignRequestThreadReadOnly(status: string): boolean {
  return !canWriteDesignRequestNotes(status);
}

export function getDesignRequestStatusLabel(
  status: DesignRequestStatus
): string {
  return DESIGN_REQUEST_STATUS_LABELS[status] ?? status;
}

export function getDesignRequestStatusBadgeClass(
  status: DesignRequestStatus
): string {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-900 border-amber-200";
    case "approved":
    case "in_progress":
    case "shared":
      return "bg-amber-100 text-amber-900 border-amber-200";
    case "rejected":
      return "bg-red-100 text-red-800 border-red-200";
    case "cancelled":
      return "bg-gray-100 text-gray-700 border-gray-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}
