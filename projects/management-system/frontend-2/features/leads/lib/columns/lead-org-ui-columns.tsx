"use client";

import { useMemo } from "react";

import {
  type Column,
  type TableAction,
  TableActions,
  TableHeaderLabel,
} from "@fieldflow360/org-ui";
import {
  Archive,
  Eye,
  FileClock,
  Hash,
  ListChecks,
  Tags,
  Trash2,
  Undo2,
  User,
  Users,
} from "lucide-react";

import type { DesignRequestStatus, Status, TeamMember } from "@/api/types";
import { LeadType } from "@/constants";
import { ClientsAndFarmsCell } from "@/features/contacts";
import { ON_SITE_OPERATIONS_LABEL } from "@/features/contacts/model/constants";
import { DesignRequestListStatusBadge } from "@/features/design-request";
import { LeadStatusCell } from "@/features/leads/ui/LeadStatusCell";
import { INLINE_TABLE_ROW_ACTIONS_PROPS } from "@/shared/lib/table/columns";
import {
  orgUiLastUpdatedWithMemberColumn,
  orgUiPhoneColumn,
  resolveContactPhone,
} from "@/shared/lib/table/org-ui";
import { TableStatusBadge } from "@/shared/ui";

import { LeadNameWithDescriptionCell } from "./LeadNameCell";
import type { LeadTableRow } from "./types";

export interface LeadOrgUiColumnHandlers {
  leadType: LeadType;
  readOnly?: boolean;
  isArchived?: boolean;
  leadStatuses: Status[];
  leadTypes: Status[];
  teamData?: TeamMember[];
  getDesignRequestStatus?: (leadId: number) => DesignRequestStatus | undefined;
  onShowMore: (id: number, isArchived?: boolean) => void;
  onLogs?: (id: number, isArchived?: boolean) => void;
  onTrash: (id: number) => void;
  onUnarchive: (id: number) => void;
  onArchive: (id: number) => void;
}

export function resolveLeadItemStatusKey(
  lead: Pick<LeadTableRow, "lead_status">
): string {
  const value = lead.lead_status;
  if (!value) return "";
  if (typeof value === "object") return String(value.id);
  return String(value);
}

function resolveStatus(
  value: LeadTableRow["lead_status"] | LeadTableRow["lead_type"],
  options: Status[]
) {
  if (!value) return undefined;
  if (typeof value === "object") return value;
  return options.find((option) => option.id === value);
}

function LeadTypeBadgeCell({ status }: { status: Status | undefined }) {
  if (!status) return <span className="text-text-muted">N/A</span>;
  return (
    <TableStatusBadge
      color={status.color || "#3b82f6"}
      title={status.title || "N/A"}
    />
  );
}

export function buildLeadTableActions(
  lead: LeadTableRow,
  handlers: LeadOrgUiColumnHandlers
): TableAction<LeadTableRow>[] {
  const isArchived = Boolean(handlers.isArchived);
  const viewActions: TableAction<LeadTableRow>[] = [
    {
      label: "View details",
      icon: <Eye aria-hidden className="h-4 w-4" strokeWidth={2} />,
      onClick: () => handlers.onShowMore(lead.id, isArchived),
    },
  ];

  if (handlers.onLogs) {
    viewActions.push({
      label: "View logs",
      icon: <FileClock aria-hidden className="h-4 w-4" strokeWidth={2} />,
      onClick: () => handlers.onLogs?.(lead.id, isArchived),
    });
  }

  if (handlers.readOnly) return viewActions;

  const manageActions: TableAction<LeadTableRow>[] = isArchived
    ? [
        {
          label: "Unarchive",
          icon: <Undo2 aria-hidden className="h-4 w-4" strokeWidth={2} />,
          onClick: () => handlers.onUnarchive(lead.id),
        },
        {
          label: "Move to Trash",
          icon: <Trash2 aria-hidden className="h-4 w-4" strokeWidth={2} />,
          variant: "danger",
          onClick: () => handlers.onTrash(lead.id),
        },
      ]
    : [
        {
          label: "Archive",
          icon: <Archive aria-hidden className="h-4 w-4" strokeWidth={2} />,
          onClick: () => handlers.onArchive(lead.id),
        },
        {
          label: "Move to Trash",
          icon: <Trash2 aria-hidden className="h-4 w-4" strokeWidth={2} />,
          variant: "danger",
          onClick: () => handlers.onTrash(lead.id),
        },
      ];

  return [...manageActions, ...viewActions];
}

function LeadActionsCell({
  lead,
  handlers,
}: {
  lead: LeadTableRow;
  handlers: LeadOrgUiColumnHandlers;
}) {
  const items = useMemo(
    () => buildLeadTableActions(lead, handlers),
    [handlers, lead]
  );

  return (
    <TableActions
      actions={items}
      item={lead}
      {...INLINE_TABLE_ROW_ACTIONS_PROPS}
    />
  );
}

export function getLeadOrgUiColumns(
  handlers: LeadOrgUiColumnHandlers
): Column<LeadTableRow>[] {
  return [
    {
      key: "customer_name",
      label: "Lead Name",
      sortable: true,
      header: <TableHeaderLabel truncate icon={User} label="Lead Name" />,
      render: (lead) => {
        const designRequestStatus = handlers.getDesignRequestStatus?.(lead.id);
        return (
          <div className="flex min-w-0 flex-col gap-1">
            <LeadNameWithDescriptionCell row={lead} />
            {designRequestStatus ? (
              <DesignRequestListStatusBadge status={designRequestStatus} />
            ) : null}
          </div>
        );
      },
      width: "220px",
      cellClassName: "min-w-0 max-w-[220px]",
    },
    {
      key: "estimate_number",
      label: "Estimate Number",
      header: <TableHeaderLabel truncate icon={Hash} label="Estimate Number" />,
      render: (lead) => (
        <span className="block truncate" title={String(lead.estimate_number)}>
          {lead.estimate_number || "N/A"}
        </span>
      ),
      width: "128px",
    },
    orgUiPhoneColumn<LeadTableRow>({
      key: "customer_phone_number",
      getPhone: (lead) => resolveContactPhone(lead.contact_info),
    }),
    {
      key: "clients_and_farms",
      label: `Clients and ${ON_SITE_OPERATIONS_LABEL}`,
      header: (
        <TableHeaderLabel
          truncate
          icon={Users}
          label={`Clients and ${ON_SITE_OPERATIONS_LABEL}`}
        />
      ),
      render: (lead) => (
        <ClientsAndFarmsCell
          contactInfo={lead.contact_info}
          farmName={lead.farm_name}
        />
      ),
      width: "200px",
      cellClassName: "min-w-0",
    },
    {
      key: "lead_type",
      label: "Lead Source",
      header: <TableHeaderLabel truncate icon={Tags} label="Lead Source" />,
      render: (lead) => (
        <LeadTypeBadgeCell
          status={resolveStatus(lead.lead_type, handlers.leadTypes)}
        />
      ),
      width: "132px",
    },
    {
      key: "lead_status",
      label: "Status",
      header: <TableHeaderLabel truncate icon={ListChecks} label="Status" />,
      render: (lead) => (
        <LeadStatusCell
          isArchived={handlers.isArchived}
          lead={lead}
          leadStatuses={handlers.leadStatuses}
          leadType={handlers.leadType}
        />
      ),
      width: "132px",
    },
    orgUiLastUpdatedWithMemberColumn<LeadTableRow>({
      teamData: handlers.teamData,
      getDate: (lead) => lead.last_updated,
      getMemberId: (lead) => lead.last_updated_by,
    }),
    {
      key: "actions",
      label: "Actions",
      header: "",
      width: "9.5rem",
      align: "right",
      hideable: false,
      cellClassName: "min-w-0 overflow-visible",
      render: (lead) => <LeadActionsCell handlers={handlers} lead={lead} />,
    },
  ];
}
