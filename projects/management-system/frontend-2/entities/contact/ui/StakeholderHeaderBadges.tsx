"use client";

import { cn } from "@fieldflow360/org-ui";
import { ChevronRight, Network, User } from "lucide-react";

import type { ContactSubtype } from "@/api/types";
import { truncateClientsAndFarmsLabel } from "@/entities/contact/lib/truncateClientsAndFarmsLabel";
import { CONTACT_SUBTYPE } from "@/entities/contact/model/constants";

export type StakeholderHeaderBadgeContactInfo = {
  id?: number;
  full_name?: string;
  contact_subtype?: ContactSubtype;
  farm_management_names?: string[];
};

const badgeBaseClassName =
  "border-border-subtle bg-bg-app inline-flex max-w-[200px] items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium";

const interactiveBadgeClassName = cn(
  badgeBaseClassName,
  "hover:bg-bg-surface transition-colors cursor-pointer"
);

interface StakeholderHeaderBadgesProps {
  contactInfo?: StakeholderHeaderBadgeContactInfo | null;
  onManageStakeholders?: () => void;
  disabled?: boolean;
  className?: string;
}

function HeaderBadge({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: typeof User;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const content = (
    <>
      <Icon aria-hidden className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{truncateClientsAndFarmsLabel(label)}</span>
    </>
  );

  if (!onClick || disabled) {
    return (
      <span className={cn(badgeBaseClassName, disabled && "opacity-60")}>
        {content}
      </span>
    );
  }

  return (
    <button
      className={interactiveBadgeClassName}
      type="button"
      onClick={onClick}
    >
      {content}
      <ChevronRight className="text-text-muted h-3.5 w-3.5 shrink-0" />
    </button>
  );
}

export function StakeholderHeaderBadges({
  contactInfo,
  onManageStakeholders,
  disabled = false,
  className,
}: StakeholderHeaderBadgesProps) {
  if (!contactInfo?.id) return null;

  const isFarmManagementContact =
    contactInfo.contact_subtype === CONTACT_SUBTYPE.FARM_MANAGEMENT;
  const farmManagementNames = contactInfo.farm_management_names ?? [];
  const farmManagementLabel = farmManagementNames[0]?.trim();
  const showFarmManagementBadge =
    !isFarmManagementContact && Boolean(farmManagementLabel);

  const contactLabel = contactInfo.full_name?.trim() || "Contact";
  const contactIcon = isFarmManagementContact ? Network : User;

  const handleClick = disabled ? undefined : onManageStakeholders;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <HeaderBadge
        disabled={disabled}
        icon={contactIcon}
        label={contactLabel}
        onClick={handleClick}
      />
      {showFarmManagementBadge ? (
        <HeaderBadge icon={Network} label={farmManagementLabel!} />
      ) : null}
    </div>
  );
}
