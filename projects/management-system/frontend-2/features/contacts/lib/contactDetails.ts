import type { ContactDetail } from "@/api/types";

export interface ContactDetailFormRow {
  id?: number;
  name: string;
  phone_number: string;
  label: string;
  is_primary: boolean;
}

export function createEmptyContactDetailRow(
  isPrimary = false
): ContactDetailFormRow {
  return {
    name: "",
    phone_number: "",
    label: "",
    is_primary: isPrimary,
  };
}

export function createDefaultContactDetails(): ContactDetailFormRow[] {
  return [createEmptyContactDetailRow(true)];
}

export function mapApiContactDetailsToForm(
  details?: ContactDetail[]
): ContactDetailFormRow[] {
  if (!details || details.length === 0) {
    return createDefaultContactDetails();
  }
  return details.map((d) => ({
    id: d.id ?? undefined,
    name: d.name ?? "",
    phone_number: d.phone_number ?? "",
    label: d.label ?? "",
    is_primary: d.is_primary,
  }));
}

export function hydrateContactDetailsForForm(
  details: ContactDetail[] | undefined,
  legacy: { full_name?: string | null; phone_number?: string | null }
): ContactDetailFormRow[] {
  if (details && details.length > 0) {
    return mapApiContactDetailsToForm(details);
  }
  const name = (legacy.full_name ?? "").trim();
  const phone = (legacy.phone_number ?? "").trim();
  if (!name && !phone) {
    return createDefaultContactDetails();
  }
  return [
    {
      name,
      phone_number: phone,
      label: "",
      is_primary: true,
    },
  ];
}

/**
 * When updating existing entries, apply non-primary rows before primary so the DB
 * unique_primary_entry_per_contact constraint is not violated mid-update.
 */
export function orderContactDetailsForApiWrite(
  rows: ContactDetailFormRow[]
): ContactDetailFormRow[] {
  const hasExisting = rows.some((row) => row.id !== undefined);
  if (!hasExisting) return rows;

  return [...rows].sort((a, b) => {
    if (a.is_primary === b.is_primary) return 0;
    return a.is_primary ? 1 : -1;
  });
}

export function mapContactDetailsToApi(
  rows: ContactDetailFormRow[]
): ContactDetail[] {
  return orderContactDetailsForApiWrite(rows).map((row) => ({
    ...(row.id != null ? { id: row.id } : {}),
    name: row.name.trim(),
    phone_number: row.phone_number.trim() || undefined,
    label: row.label.trim() || undefined,
    is_primary: row.is_primary,
  }));
}

export function getPrimaryContactDetail(
  rows: ContactDetailFormRow[]
): ContactDetailFormRow | undefined {
  return rows.find((r) => r.is_primary);
}

export function syncLegacyFieldsFromDetails(rows: ContactDetailFormRow[]): {
  full_name: string;
  phone_number: string;
} {
  const primary = getPrimaryContactDetail(rows);
  return {
    full_name: primary?.name?.trim() ?? "",
    phone_number: primary?.phone_number?.trim() ?? "",
  };
}

export type ContactDetailsValidationError =
  | "empty"
  | "no_primary"
  | "multiple_primary"
  | "primary_missing_name"
  | "row_empty";

/** Coerce API `id: null` before validation or API mapping. */
export function normalizeContactDetailRows(
  rows: Array<ContactDetailFormRow & { id?: number | null }>
): ContactDetailFormRow[] {
  return rows.map((row) => ({
    ...row,
    id: row.id ?? undefined,
  }));
}

export function validateContactDetails(
  rows: ContactDetailFormRow[]
): ContactDetailsValidationError | null {
  if (rows.length === 0) return "empty";

  const primaryCount = rows.filter((r) => r.is_primary).length;
  if (primaryCount === 0) return "no_primary";
  if (primaryCount > 1) return "multiple_primary";

  const primary = getPrimaryContactDetail(rows);
  if (!primary?.name?.trim()) return "primary_missing_name";

  for (const row of rows) {
    const hasName = Boolean(row.name?.trim());
    const hasPhone = Boolean(row.phone_number?.trim());
    if (!hasName && !hasPhone) return "row_empty";
  }

  return null;
}

export function getContactDetailsErrorMessage(
  error: ContactDetailsValidationError
): string {
  switch (error) {
    case "empty":
      return "At least one contact detail is required.";
    case "no_primary":
      return "Select a primary contact detail.";
    case "multiple_primary":
      return "Only one contact detail can be primary.";
    case "primary_missing_name":
      return "Primary contact detail must include a name.";
    case "row_empty":
      return "Each contact detail must have a name or phone number.";
    default:
      return "Invalid contact details.";
  }
}

export function setPrimaryDetail(
  rows: ContactDetailFormRow[],
  index: number
): ContactDetailFormRow[] {
  return rows.map((row, i) => ({
    ...row,
    is_primary: i === index,
  }));
}

export function addContactDetailRow(
  rows: ContactDetailFormRow[]
): ContactDetailFormRow[] {
  return [...rows, createEmptyContactDetailRow(false)];
}

export function removeContactDetailRow(
  rows: ContactDetailFormRow[],
  index: number
): ContactDetailFormRow[] {
  if (rows.length <= 1) {
    return createDefaultContactDetails();
  }
  const next = rows.filter((_, i) => i !== index);
  if (!next.some((r) => r.is_primary)) {
    next[0] = { ...next[0], is_primary: true };
  }
  return next;
}

export function updateContactDetailRow(
  rows: ContactDetailFormRow[],
  index: number,
  patch: Partial<ContactDetailFormRow>
): ContactDetailFormRow[] {
  return rows.map((row, i) => (i === index ? { ...row, ...patch } : row));
}

/** Display name for list/dropdown: primary contact detail name, else legacy full_name. */
export function getPrimaryContactDisplayName(contact: {
  id?: number;
  full_name?: string | null;
  contact_details?: ContactDetail[];
}): string {
  const fromDetail = contact.contact_details
    ?.find((d) => d.is_primary)
    ?.name?.trim();
  if (fromDetail) return fromDetail;
  const legacy = contact.full_name?.trim();
  if (legacy) return legacy;
  return contact.id != null ? `Client #${contact.id}` : "";
}

export function formatSecondaryContactNames(
  contactDetails?: ContactDetail[],
  fullName?: string
): string {
  if (!contactDetails?.length) return "";
  const others = contactDetails
    .filter((d) => !d.is_primary && d.name?.trim())
    .map((d) => d.name!.trim());
  if (others.length === 0) return "";
  const display = others.slice(0, 3).join(", ");
  const extra = others.length > 3 ? `, +${others.length - 3}` : "";
  const primaryName = fullName?.trim();
  if (primaryName && others.every((n) => n === primaryName)) return "";
  return `(${display}${extra})`;
}

/** e.g. "Primary Name (Other Name 1, Other Name 2, +1)" */
export function formatContactDisplayLabel(contact: {
  full_name?: string;
  contact_details?: ContactDetail[];
}): string {
  const primary = getPrimaryContactDisplayName(contact);
  const secondary = formatSecondaryContactNames(
    contact.contact_details,
    primary
  );
  return secondary ? `${primary} ${secondary}`.trim() : primary;
}
