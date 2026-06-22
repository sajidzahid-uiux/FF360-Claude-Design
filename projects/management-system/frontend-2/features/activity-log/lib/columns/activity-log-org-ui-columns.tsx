"use client";

import { type Column, TableHeaderLabel } from "@fieldflow360/org-ui";
import { FileText, User } from "lucide-react";

import type { LeadLogRow } from "@/features/activity-log";

export function getActivityLogOrgUiColumns(): Column<LeadLogRow>[] {
  return [
    {
      key: "user",
      label: "User",
      width: "14rem",
      header: <TableHeaderLabel icon={User} label="User" />,
      render: (row) => (
        <span className="text-text-primary text-sm">{row.user}</span>
      ),
    },
    {
      key: "action",
      label: "Action",
      width: "12rem",
      header: <TableHeaderLabel icon={FileText} label="Action" />,
      render: (row) => (
        <span className="text-text-primary text-sm">{row.action}</span>
      ),
    },
    {
      key: "actionDetail",
      label: "Action detail",
      header: "Action detail",
      render: (row) => (
        <span className="text-text-primary text-sm break-words">
          {row.actionDetail}
        </span>
      ),
    },
  ];
}
