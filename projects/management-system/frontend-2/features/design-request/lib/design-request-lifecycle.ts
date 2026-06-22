import {
  DesignRequestStatus,
  type DesignRequestStatusItem,
} from "@/api/types/designRequest";

import { isActiveDesignRequestStatus } from "./design-request-status";

export type DesignRequestFooterVariant =
  | "request"
  | "open"
  | "completed"
  | "view_only";

export function buildDesignRequestStatusMap(
  items: DesignRequestStatusItem[]
): Map<number, DesignRequestStatus> {
  const latestByTarget = new Map<number, DesignRequestStatusItem>();

  for (const item of items) {
    const existing = latestByTarget.get(item.target_id);
    if (
      !existing ||
      new Date(item.updated_at).getTime() >
        new Date(existing.updated_at).getTime()
    ) {
      latestByTarget.set(item.target_id, item);
    }
  }

  return new Map(
    [...latestByTarget.entries()].map(([targetId, item]) => [
      targetId,
      item.status,
    ])
  );
}

export function blocksNewDesignRequestSubmit(
  status: DesignRequestStatus | null | undefined
): boolean {
  if (!status) return false;
  if (status === DesignRequestStatus.Shared) return true;
  return isActiveDesignRequestStatus(status);
}

export function getDesignRequestFooterVariant(
  status: DesignRequestStatus | null,
  canSubmit: boolean
): DesignRequestFooterVariant {
  if (!status) {
    return canSubmit ? "request" : "view_only";
  }
  if (status === DesignRequestStatus.Shared) {
    return "completed";
  }
  if (isActiveDesignRequestStatus(status)) {
    return canSubmit ? "open" : "view_only";
  }
  return "open";
}

export function getDesignRequestFooterStatusMessage(
  variant: DesignRequestFooterVariant
): string | null {
  switch (variant) {
    case "completed":
      return "Design completed";
    case "open":
      return "Design request in progress";
    default:
      return null;
  }
}

export function getDesignRequestFooterButtonTitle(
  variant: DesignRequestFooterVariant
): string | null {
  switch (variant) {
    case "request":
      return "Request Design from FF360";
    case "completed":
      return "View design";
    case "open":
      return "FieldFlow360 Design";
    case "view_only":
      return "View FF360 Design";
    default:
      return null;
  }
}

export function shouldShowDesignRequestFooterButton(
  variant: DesignRequestFooterVariant
): boolean {
  return variant !== "completed";
}
