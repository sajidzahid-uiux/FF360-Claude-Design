"use client";

import { useCallback, useMemo } from "react";

import type { LeadStatus, Status } from "@/api/types";
import { LeadType } from "@/constants";
import type { LeadTableRow } from "@/features/leads/lib/columns";
import { useRoutePermissions } from "@/hooks/permissions";
import { useInlineLeadStatusChange } from "@/hooks/useInlineLeadStatusChange";
import { InlineEntityStatusDropdown } from "@/shared/ui/InlineEntityStatusDropdown";

function resolveLeadStatus(
  leadStatus: LeadTableRow["lead_status"],
  leadStatuses: Status[]
): LeadStatus | undefined {
  if (leadStatus == null) return undefined;
  if (typeof leadStatus === "object") return leadStatus;
  return leadStatuses.find((status) => status.id === leadStatus);
}

export interface LeadStatusCellProps {
  lead: LeadTableRow;
  leadType: LeadType;
  leadStatuses: Status[];
  isArchived?: boolean;
}

export function LeadStatusCell({
  lead,
  leadType,
  leadStatuses,
  isArchived = false,
}: LeadStatusCellProps) {
  const perms = useRoutePermissions();
  const canEdit = perms?.write === true;
  const { handleInlineLeadStatusChange } = useInlineLeadStatusChange(leadType);

  const currentStatus = useMemo(
    () => resolveLeadStatus(lead.lead_status, leadStatuses),
    [lead.lead_status, leadStatuses]
  );

  const disabled = !canEdit || isArchived;

  const handleStatusChange = useCallback(
    (statusId: number) => {
      void handleInlineLeadStatusChange(lead.id, statusId);
    },
    [handleInlineLeadStatusChange, lead.id]
  );

  return (
    <InlineEntityStatusDropdown
      currentStatus={currentStatus}
      disabled={disabled}
      statusTypes={leadStatuses}
      onStatusChange={handleStatusChange}
    />
  );
}
