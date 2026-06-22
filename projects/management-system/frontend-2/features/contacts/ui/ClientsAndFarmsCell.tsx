"use client";

import { Fragment } from "react";

import { cn } from "@fieldflow360/org-ui";
import { Map, Network, User } from "lucide-react";

import type { ContactInfo } from "@/api/types";
import {
  type ClientsAndFarmsInlineSegment,
  ContactInfoWithFarmManagement,
  buildClientsAndFarmsDisplay,
  buildClientsAndFarmsInlineSegments,
  buildClientsAndFarmsInlineText,
  normalizeContactInfoForClientsAndFarms,
  truncateClientsAndFarmsLabel,
} from "@/features/contacts/lib";
import { ON_SITE_OPERATIONS_LABEL } from "@/features/contacts/model/constants";
import { CLIENTS_AND_FARMS_CARD_MIN_HEIGHT } from "@/shared/ui/common/GenericCard/lib/cardFieldLayout";
import { TouchSlideRow } from "@/shared/ui/common/TouchSlideRow";

type ClientsAndFarmsLayout = "stack" | "inline";
type ClientsAndFarmsVariant = "default" | "card";

interface ClientsAndFarmsCellProps {
  contactInfo?: ContactInfo | ContactInfoWithFarmManagement | null;
  farmName?: string | null;
  contactsCount?: number;
  farmsCount?: number;
  className?: string;
  compact?: boolean;
  /** Stack vertically (tables); inline row for grid/kanban cards. */
  layout?: ClientsAndFarmsLayout;
  /** Grid/kanban card styling: icon rows with badge pills, no section title. */
  variant?: ClientsAndFarmsVariant;
}

function LabelPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="border-border-subtle bg-bg-app inline-flex max-w-[140px] items-center rounded-full border px-2.5 py-0.5 text-xs font-medium">
      <span className="truncate">{children}</span>
    </span>
  );
}

function InlineLabelPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="border-border-subtle bg-bg-app inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap">
      {children}
    </span>
  );
}

function ExtraCountPill({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="border-border-subtle bg-bg-surface text-text-muted inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-medium">
      +{count}
    </span>
  );
}

function CardValueBadge({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <span
      className="border-border-subtle bg-bg-app text-text-primary inline-flex max-w-[9.5rem] min-w-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-medium"
      title={title}
    >
      <span className="truncate">{children}</span>
    </span>
  );
}

function CardBadgeRow({
  icon: Icon,
  primary,
  extraCount,
}: {
  icon: typeof User;
  primary: string;
  extraCount: number;
}) {
  return (
    <div className="flex min-h-[1.5rem] min-w-0 items-center gap-1.5">
      <Icon aria-hidden className="text-text-muted h-3.5 w-3.5 shrink-0" />
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
        <CardValueBadge title={primary}>{primary}</CardValueBadge>
        <ExtraCountPill count={extraCount} />
      </div>
    </div>
  );
}

function segmentIcon(
  segment: ClientsAndFarmsInlineSegment,
  isFarmManagementContact: boolean
) {
  if (segment.kind === "farm") return Map;
  if (segment.kind === "farm_management") return Network;
  return isFarmManagementContact ? Network : User;
}

function InlineSegment({
  segment,
  isFarmManagementContact,
}: {
  segment: ClientsAndFarmsInlineSegment;
  isFarmManagementContact: boolean;
}) {
  const Icon = segmentIcon(segment, isFarmManagementContact);

  return (
    <span className="inline-flex shrink-0 items-center gap-1.5">
      <Icon aria-hidden className="text-text-muted h-3.5 w-3.5 shrink-0" />
      <InlineLabelPill>{segment.primary}</InlineLabelPill>
      <ExtraCountPill count={segment.extraCount} />
    </span>
  );
}

function DisplayRow({
  icon: Icon,
  primary,
  extraCount,
  compact = false,
}: {
  icon: typeof User;
  primary: string;
  extraCount: number;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-start gap-1.5",
        compact && "min-h-[1.125rem]"
      )}
    >
      <Icon
        aria-hidden
        className="text-text-muted mt-0.5 h-3.5 w-3.5 shrink-0"
      />
      {compact ? (
        <span className="min-w-0 flex-1 truncate text-xs font-medium">
          {primary}
        </span>
      ) : (
        <LabelPill>{truncateClientsAndFarmsLabel(primary)}</LabelPill>
      )}
      <ExtraCountPill count={extraCount} />
    </div>
  );
}

export function ClientsAndFarmsCell({
  contactInfo,
  farmName,
  contactsCount,
  farmsCount,
  className,
  compact = false,
  layout = "stack",
  variant = "default",
}: ClientsAndFarmsCellProps) {
  const display = buildClientsAndFarmsDisplay({
    contactInfo: normalizeContactInfoForClientsAndFarms(contactInfo),
    farmName,
    contactsCount,
    farmsCount,
  });

  if (layout === "inline") {
    if (!display.hasContact) {
      return (
        <span className={cn("text-text-muted text-sm", className)}>N/A</span>
      );
    }
    const segments = buildClientsAndFarmsInlineSegments(display);
    const slideTitle = buildClientsAndFarmsInlineText(display);

    return (
      <div className={cn("min-w-0", className)}>
        <TouchSlideRow
          className="text-xs"
          contentKey={slideTitle}
          maxWidth="w-full min-w-0"
          title={slideTitle}
        >
          {segments.map((segment, index) => (
            <Fragment key={`${segment.kind}-${segment.primary}`}>
              {index > 0 ? (
                <span
                  aria-hidden
                  className="text-text-muted shrink-0 px-0.5 text-xs"
                >
                  ·
                </span>
              ) : null}
              <InlineSegment
                isFarmManagementContact={display.isFarmManagementContact}
                segment={segment}
              />
            </Fragment>
          ))}
        </TouchSlideRow>
      </div>
    );
  }

  if (variant === "card") {
    const hasFarmManagement =
      display.showFarmManagementRow && Boolean(display.farmManagementPrimary);
    const hasContact = display.hasContact;
    const hasFarm = display.showFarmRow && Boolean(display.farmPrimary);
    const contactIcon = display.isFarmManagementContact ? Network : User;

    return (
      <div
        aria-label={`Clients and ${ON_SITE_OPERATIONS_LABEL}`}
        className={cn(
          "flex flex-col gap-1.5",
          CLIENTS_AND_FARMS_CARD_MIN_HEIGHT,
          className
        )}
        role="group"
      >
        {hasFarmManagement ? (
          <CardBadgeRow
            extraCount={display.farmManagementExtraCount}
            icon={Network}
            primary={display.farmManagementPrimary ?? ""}
          />
        ) : null}
        {hasContact ? (
          <CardBadgeRow
            extraCount={display.contactExtraCount}
            icon={contactIcon}
            primary={display.contactPrimary}
          />
        ) : null}
        {hasFarm ? (
          <CardBadgeRow
            extraCount={display.farmExtraCount}
            icon={Map}
            primary={display.farmPrimary ?? ""}
          />
        ) : null}
      </div>
    );
  }

  if (!display.hasContact) {
    return (
      <span className={cn("text-text-muted text-sm", className)}>N/A</span>
    );
  }

  const contactIcon = display.isFarmManagementContact ? Network : User;

  const clientRow = (
    <DisplayRow
      compact={compact}
      extraCount={display.contactExtraCount}
      icon={contactIcon}
      primary={display.contactPrimary}
    />
  );

  const farmRow =
    display.showFarmRow && display.farmPrimary ? (
      <DisplayRow
        compact={compact}
        extraCount={display.farmExtraCount}
        icon={Map}
        primary={display.farmPrimary}
      />
    ) : null;

  const farmManagementRow =
    display.showFarmManagementRow && display.farmManagementPrimary ? (
      <DisplayRow
        compact={compact}
        extraCount={display.farmManagementExtraCount}
        icon={Network}
        primary={display.farmManagementPrimary}
      />
    ) : null;

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col",
        compact ? "gap-1" : "gap-1.5",
        className
      )}
    >
      {farmManagementRow}
      {clientRow}
      {farmRow}
    </div>
  );
}
