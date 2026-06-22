"use client";

import { cn } from "@fieldflow360/org-ui";
import { Network } from "lucide-react";

import type { ContactInfoWithFarmManagement } from "@/features/contacts/lib";
import {
  getFarmManagementExtraCount,
  getPrimaryFarmManagementName,
  truncateClientsAndFarmsLabel,
} from "@/features/contacts/lib";

interface FarmManagementContactCellProps {
  contactInfo?: ContactInfoWithFarmManagement | null;
  className?: string;
}

export function FarmManagementContactCell({
  contactInfo,
  className,
}: FarmManagementContactCellProps) {
  const primary = getPrimaryFarmManagementName(contactInfo);
  const extraCount = getFarmManagementExtraCount(contactInfo);

  if (!primary) {
    return (
      <span className={cn("text-text-muted text-sm", className)}>N/A</span>
    );
  }

  return (
    <div className={cn("flex min-w-0 items-center gap-1.5", className)}>
      <Network aria-hidden className="text-text-muted h-3.5 w-3.5 shrink-0" />
      <span className="truncate text-sm">
        {truncateClientsAndFarmsLabel(primary)}
      </span>
      {extraCount > 0 ? (
        <span className="border-border-subtle bg-bg-surface text-text-muted inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-medium">
          +{extraCount}
        </span>
      ) : null}
    </div>
  );
}
