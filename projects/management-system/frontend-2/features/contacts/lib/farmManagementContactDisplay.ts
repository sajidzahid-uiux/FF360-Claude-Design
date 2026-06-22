import type { ContactInfo } from "@/api/types";

type FarmManagementContactRef = NonNullable<
  ContactInfo["farm_management_contacts"]
>[number];

export type FarmManagementContactSummary = Pick<
  FarmManagementContactRef,
  "id" | "full_name" | "phone_number"
>;

/** Contact payload shapes from invoices, vendor forms, jobs, etc. */
export type ContactInfoWithFarmManagement = Partial<
  Pick<
    ContactInfo,
    | "id"
    | "full_name"
    | "contact_subtype"
    | "farm_management_names"
    | "farm_management_contacts"
    | "sub_contact_names"
  >
>;

/** Merge `farm_management_contacts[].full_name` into `farm_management_names` when names are missing. */
export function normalizeContactInfoForClientsAndFarms(
  contactInfo?: ContactInfoWithFarmManagement | null
): ContactInfo | null | undefined {
  if (!contactInfo) {
    return contactInfo ?? undefined;
  }

  const existingNames = (contactInfo.farm_management_names ?? []).filter(
    (name) => Boolean(name?.trim())
  );
  if (existingNames.length > 0) {
    return contactInfo as ContactInfo;
  }

  const fromContacts = (contactInfo.farm_management_contacts ?? [])
    .map((entry) => entry.full_name?.trim())
    .filter((name): name is string => Boolean(name));

  if (fromContacts.length === 0) {
    return contactInfo as ContactInfo;
  }

  return {
    ...contactInfo,
    farm_management_names: fromContacts,
  } as ContactInfo;
}

export function getFarmManagementDisplayNames(
  contactInfo?: ContactInfoWithFarmManagement | null
): string[] {
  const normalized = normalizeContactInfoForClientsAndFarms(contactInfo);
  return (normalized?.farm_management_names ?? []).filter((name) =>
    Boolean(name?.trim())
  );
}

export function getPrimaryFarmManagementName(
  contactInfo?: ContactInfoWithFarmManagement | null
): string | null {
  const names = getFarmManagementDisplayNames(contactInfo);
  const primary = names[0]?.trim();
  return primary || null;
}

export function getFarmManagementExtraCount(
  contactInfo?: ContactInfoWithFarmManagement | null
): number {
  const names = getFarmManagementDisplayNames(contactInfo);
  return Math.max(0, names.length - 1);
}
