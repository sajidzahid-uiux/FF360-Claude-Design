"use client";

import type { ContactSummaryPartial } from "@/api/types";
import { StakeholderHeaderBadges } from "@/entities/contact/ui/StakeholderHeaderBadges";

export type ContactTypeBadgeContactInfo = ContactSummaryPartial;

interface ContactNumberRowProps {
  number?: string | null;
  contactInfo?: ContactTypeBadgeContactInfo | null;
  className?: string;
  onManageStakeholders?: () => void;
  /** When true, the Clients & Farms badge opens the stakeholder dialog (read or edit). */
  canOpenStakeholders?: boolean;
}

export function ContactNumberRow({
  number,
  contactInfo,
  className,
  onManageStakeholders,
  canOpenStakeholders = false,
}: ContactNumberRowProps) {
  const trimmed = number?.trim();
  if (!trimmed && !contactInfo?.id) return null;

  return (
    <div className={className ?? "flex flex-wrap items-center gap-2"}>
      {trimmed ? <p className="text-text-muted text-sm">PO:{trimmed}</p> : null}
      <StakeholderHeaderBadges
        contactInfo={contactInfo}
        disabled={!canOpenStakeholders}
        onManageStakeholders={onManageStakeholders}
      />
    </div>
  );
}
