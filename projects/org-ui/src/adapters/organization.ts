import type { OrganizationInfoData } from "../components/widgets/OrganizationSwitcher/OrganizationInfo";
import type { OrganizationCardItem } from "../components/widgets/OrganizationSwitcher/OrganizationCard";

export enum FieldFlowOrganizationSourceEnum {
  TILE_DESIGN = "tile-design",
  CMS = "cms",
}

/** CMS organizations support logo upload and display; Tile Design does not. */
export function organizationSourceSupportsLogo(
  source?: FieldFlowOrganizationSourceEnum
): boolean {
  return source === FieldFlowOrganizationSourceEnum.CMS;
}

export interface FieldFlowOrganizationNormalized {
  id: OrganizationCardItem["id"];
  name: string;
  email?: string;
  user_type?: string;
  current_plan?: string;
  owner?: boolean;
  /** Tile Design: FieldFlow360 service org (CMS hub) — surfaced separately in the org switcher. */
  is_service_org?: boolean;
  isActive?: boolean;
  phoneNumber?: string;
  address?: OrganizationInfoData["address"];
  memberCount?: OrganizationInfoData["memberCount"];
  createdAt?: OrganizationInfoData["createdAt"];
  latitude?: number | null;
  longitude?: number | null;
  companyAbbreviation?: string;
  logo?: string;
  canDeleteOrganization?: boolean;
}

function pickString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value
    : undefined;
}

function pickNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function inferSource(
  record: Record<string, unknown>
): FieldFlowOrganizationSourceEnum {
  if ("company_abbreviation" in record || "current_plan" in record) {
    return FieldFlowOrganizationSourceEnum.CMS;
  }
  return FieldFlowOrganizationSourceEnum.TILE_DESIGN;
}

export function mapOrganizationToFieldFlow(
  organization: unknown,
  source?: FieldFlowOrganizationSourceEnum
): FieldFlowOrganizationNormalized {
  const record =
    organization && typeof organization === "object"
      ? (organization as Record<string, unknown>)
      : {};
  const resolvedSource = source ?? inferSource(record);

  const id = (record.id as string | number | undefined) ?? "";
  const name =
    pickString(record.name) ??
    pickString(record.company_abbreviation) ??
    "Organization";
  const email = pickString(record.email);
  const address = pickString(record.address) ?? null;
  const createdAt =
    pickString(record.created_at) ?? pickString(record.createdAt) ?? null;
  const memberCount =
    pickNumber(record.member_count) ?? pickNumber(record.memberCount) ?? null;
  const owner =
    typeof record.owner === "boolean"
      ? record.owner
      : pickString(record.role)?.toLowerCase() === "owner";
  const canDeleteOrganization =
    typeof record.can_delete_organization === "boolean"
      ? record.can_delete_organization
      : typeof record.canDeleteOrganization === "boolean"
        ? record.canDeleteOrganization
        : typeof record.can_delete === "boolean"
          ? record.can_delete
          : owner;
  const userType =
    pickString(record.user_type) ??
    pickString(record.userType) ??
    (resolvedSource === FieldFlowOrganizationSourceEnum.CMS
      ? pickString(record.role)
      : undefined);
  const currentPlan =
    pickString(record.current_plan) ?? pickString(record.currentPlan);

  const phoneNumber = pickString(record.phone_number) ?? pickString(record.phoneNumber);
  const latitudeRaw = record.latitude;
  const longitudeRaw = record.longitude;
  const latitude = latitudeRaw === null ? null : pickNumber(latitudeRaw) ?? null;
  const longitude = longitudeRaw === null ? null : pickNumber(longitudeRaw) ?? null;

  const isServiceOrg =
    typeof record.is_service_org === "boolean"
      ? record.is_service_org
      : typeof record.isServiceOrg === "boolean"
        ? record.isServiceOrg
        : false;

  return {
    id,
    name,
    email,
    address,
    createdAt,
    memberCount,
    phoneNumber,
    user_type: userType,
    current_plan: currentPlan,
    owner,
    is_service_org: isServiceOrg,
    isActive:
      typeof record.is_active === "boolean"
        ? record.is_active
        : typeof record.isActive === "boolean"
          ? record.isActive
          : undefined,
    latitude,
    longitude,
    companyAbbreviation: pickString(record.company_abbreviation),
    logo: pickString(record.logo),
    canDeleteOrganization,
  };
}

export function mapOrganizationsToFieldFlow(
  organizations: unknown[],
  source?: FieldFlowOrganizationSourceEnum
): FieldFlowOrganizationNormalized[] {
  return organizations.map((organization) =>
    mapOrganizationToFieldFlow(organization, source)
  );
}

