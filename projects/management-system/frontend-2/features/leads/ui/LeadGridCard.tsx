"use client";

import { memo } from "react";

import { TableActions, TableGridCard } from "@fieldflow360/org-ui";

import type { Status, TeamMember } from "@/api/types";
import { ClientsAndFarmsCell } from "@/features/contacts";
import { ON_SITE_OPERATIONS_LABEL } from "@/features/contacts/model/constants";
import {
  type LeadOrgUiColumnHandlers,
  LeadTableRow,
  buildLeadTableActions,
} from "@/features/leads/lib/columns";
import { LeadStatusCell } from "@/features/leads/ui/LeadStatusCell";
import { getJobOrLeadListName } from "@/shared/lib";
import { INLINE_TABLE_ROW_ACTIONS_PROPS } from "@/shared/lib/table/columns";
import { formatTableLastUpdatedWithMemberId } from "@/shared/lib/table/org-ui";
import { TableStatusBadge } from "@/shared/ui";

function resolveStatus(
  value: LeadTableRow["lead_status"] | LeadTableRow["lead_type"],
  options: Status[]
) {
  if (!value) return undefined;
  if (typeof value === "object") return value;
  return options.find((option) => option.id === value);
}

export interface LeadGridCardProps {
  lead: LeadTableRow;
  handlers: LeadOrgUiColumnHandlers;
  leadStatuses: Status[];
  leadTypes: Status[];
  teamData?: TeamMember[];
  selected: boolean;
  onSelectedChange: (selected: boolean) => void;
  selectable?: boolean;
  onDoubleClick?: () => void;
}

export const LeadGridCard = memo(function LeadGridCard({
  lead,
  handlers,
  leadStatuses,
  leadTypes,
  teamData,
  selected,
  onSelectedChange,
  selectable = false,
  onDoubleClick,
}: LeadGridCardProps) {
  const title = getJobOrLeadListName(lead, "Lead");
  const secondary = lead.description?.trim() || undefined;
  const leadSource = resolveStatus(lead.lead_type, leadTypes);
  const phone =
    lead.contact_info?.phone_number ||
    lead.contact_info?.home_phone_number ||
    "N/A";

  return (
    <div className="h-full cursor-pointer" onDoubleClick={onDoubleClick}>
      <TableGridCard
        actions={
          <TableActions
            actions={buildLeadTableActions(lead, handlers)}
            item={lead}
            {...INLINE_TABLE_ROW_ACTIONS_PROPS}
          />
        }
        headerContent={
          secondary || lead.last_updated ? (
            <>
              {secondary ? (
                <p className="text-text-muted truncate">{secondary}</p>
              ) : null}
              {lead.last_updated ? (
                <p className="truncate">
                  Last updated:{" "}
                  {formatTableLastUpdatedWithMemberId(
                    lead.last_updated,
                    lead.last_updated_by,
                    teamData
                  )}
                </p>
              ) : null}
            </>
          ) : undefined
        }
        selectable={selectable}
        selected={selected}
        title={title}
        onSelectedChange={onSelectedChange}
      >
        <dl className="flex flex-col gap-2">
          {lead.estimate_number ? (
            <div className="flex items-center justify-between gap-2">
              <dt className="text-text-muted text-xs">Estimate</dt>
              <dd className="text-text-primary text-xs font-medium tabular-nums">
                {lead.estimate_number}
              </dd>
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-2">
            <dt className="text-text-muted text-xs">Phone</dt>
            <dd className="text-text-primary text-xs font-medium tabular-nums">
              {phone}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-text-muted mb-1 text-xs">
              {`Clients / ${ON_SITE_OPERATIONS_LABEL}`}
            </dt>
            <dd>
              <ClientsAndFarmsCell
                compact
                contactInfo={lead.contact_info}
                farmName={lead.farm_name}
              />
            </dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt className="text-text-muted text-xs">Source</dt>
            <dd>
              {leadSource ? (
                <TableStatusBadge
                  color={leadSource.color || "#3b82f6"}
                  title={leadSource.title}
                />
              ) : (
                <span className="text-text-muted text-xs">N/A</span>
              )}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt className="text-text-muted text-xs">Status</dt>
            <dd>
              <LeadStatusCell
                isArchived={handlers.isArchived}
                lead={lead}
                leadStatuses={leadStatuses}
                leadType={handlers.leadType}
              />
            </dd>
          </div>
        </dl>
      </TableGridCard>
    </div>
  );
});
