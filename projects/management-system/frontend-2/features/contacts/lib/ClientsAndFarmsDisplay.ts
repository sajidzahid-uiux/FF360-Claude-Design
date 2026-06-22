import type { ContactInfo } from "@/api/types";
import { CONTACT_SUBTYPE } from "@/features/contacts/model";

export interface ClientsAndFarmsDisplayInput {
  contactInfo?: ContactInfo | null;
  farmName?: string | null;
  contactsCount?: number;
  farmsCount?: number;
}

export interface ClientsAndFarmsDisplay {
  contactPrimary: string;
  contactExtraCount: number;
  farmManagementPrimary?: string;
  farmManagementExtraCount: number;
  showFarmManagementRow: boolean;
  farmPrimary?: string;
  farmExtraCount: number;
  isFarmManagementContact: boolean;
  showFarmRow: boolean;
  hasContact: boolean;
}

export { truncateClientsAndFarmsLabel } from "@/entities/contact/lib/truncateClientsAndFarmsLabel";

export function buildClientsAndFarmsDisplay({
  contactInfo,
  farmName,
  contactsCount,
  farmsCount,
}: ClientsAndFarmsDisplayInput): ClientsAndFarmsDisplay {
  if (!contactInfo?.full_name?.trim()) {
    return {
      contactPrimary: "N/A",
      contactExtraCount: 0,
      farmManagementExtraCount: 0,
      showFarmManagementRow: false,
      farmExtraCount: 0,
      isFarmManagementContact: false,
      showFarmRow: false,
      hasContact: false,
    };
  }

  const isFarmManagementContact =
    contactInfo.contact_subtype === CONTACT_SUBTYPE.FARM_MANAGEMENT;
  const farmManagementNames = contactInfo.farm_management_names ?? [];
  const subContactNames = contactInfo.sub_contact_names ?? [];

  if (isFarmManagementContact) {
    const extraLabelCount =
      farmManagementNames.length > 0
        ? farmManagementNames.length
        : subContactNames.length;
    return {
      contactPrimary: contactInfo.full_name,
      contactExtraCount: extraLabelCount,
      farmManagementExtraCount: 0,
      showFarmManagementRow: false,
      farmExtraCount: 0,
      isFarmManagementContact: true,
      showFarmRow: false,
      hasContact: true,
    };
  }

  const hasFarmManagementParents = farmManagementNames.length > 0;
  const farmManagementPrimary = hasFarmManagementParents
    ? farmManagementNames[0]
    : undefined;
  const farmManagementExtraCount = hasFarmManagementParents
    ? Math.max(0, farmManagementNames.length - 1)
    : 0;

  const trimmedFarm = farmName?.trim();
  const hasFarm = Boolean(trimmedFarm);

  const contactExtraCount =
    contactsCount != null && contactsCount > 1 ? contactsCount - 1 : 0;
  const farmExtraCount =
    farmsCount != null && farmsCount > 1 ? farmsCount - 1 : 0;

  return {
    contactPrimary: contactInfo.full_name,
    contactExtraCount,
    farmManagementPrimary,
    farmManagementExtraCount,
    showFarmManagementRow: hasFarmManagementParents,
    farmPrimary: hasFarm ? trimmedFarm : undefined,
    farmExtraCount,
    isFarmManagementContact: false,
    showFarmRow: hasFarm,
    hasContact: true,
  };
}

function formatClientsAndFarmsSegment(
  primary: string,
  extraCount: number
): string {
  return extraCount > 0 ? `${primary} +${extraCount}` : primary;
}

/** Single-line label for grid/kanban cards (farm mgmt · contact · farm). */
export function buildClientsAndFarmsInlineText(
  display: ClientsAndFarmsDisplay
): string {
  if (!display.hasContact) return "N/A";

  const segments: string[] = [];

  if (display.showFarmManagementRow && display.farmManagementPrimary) {
    segments.push(
      formatClientsAndFarmsSegment(
        display.farmManagementPrimary,
        display.farmManagementExtraCount
      )
    );
  }

  segments.push(
    formatClientsAndFarmsSegment(
      display.contactPrimary,
      display.contactExtraCount
    )
  );

  if (display.showFarmRow && display.farmPrimary) {
    segments.push(
      formatClientsAndFarmsSegment(display.farmPrimary, display.farmExtraCount)
    );
  }

  return segments.join(" · ");
}

export type ClientsAndFarmsInlineSegmentKind =
  | "farm_management"
  | "contact"
  | "farm";

export interface ClientsAndFarmsInlineSegment {
  kind: ClientsAndFarmsInlineSegmentKind;
  primary: string;
  extraCount: number;
}

/** Ordered segments for grid/kanban inline row (icons + badges applied in UI). */
export function buildClientsAndFarmsInlineSegments(
  display: ClientsAndFarmsDisplay
): ClientsAndFarmsInlineSegment[] {
  if (!display.hasContact) return [];

  const segments: ClientsAndFarmsInlineSegment[] = [];

  if (display.showFarmManagementRow && display.farmManagementPrimary) {
    segments.push({
      kind: "farm_management",
      primary: display.farmManagementPrimary,
      extraCount: display.farmManagementExtraCount,
    });
  }

  segments.push({
    kind: "contact",
    primary: display.contactPrimary,
    extraCount: display.contactExtraCount,
  });

  if (display.showFarmRow && display.farmPrimary) {
    segments.push({
      kind: "farm",
      primary: display.farmPrimary,
      extraCount: display.farmExtraCount,
    });
  }

  return segments;
}
