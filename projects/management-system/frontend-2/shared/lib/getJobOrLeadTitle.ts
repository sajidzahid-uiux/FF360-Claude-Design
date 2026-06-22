import type { Job, Lead } from "@/api/types";
import { getPrimaryContactDisplayName } from "@/features/contacts/lib";

export type JobOrLeadTitleInput = Pick<
  Job | Lead,
  "id" | "description" | "po_number" | "title"
>;

export type JobOrLeadStakeholderSubtitleInput = Pick<
  Job | Lead,
  "contact_info" | "farm_name"
>;

export type JobOrLeadTypeLabel = "Job" | "Lead";

export function getJobOrLeadTitle(
  row: JobOrLeadTitleInput,
  typeLabel: JobOrLeadTypeLabel
): string {
  return (
    row.description?.trim() ||
    row.po_number?.trim() ||
    row.title?.trim() ||
    `${typeLabel} #${row.id}`
  );
}

/** Primary contact + farm line for list, grid, and kanban (no description / PO). */
export function getJobOrLeadStakeholderSubtitle(
  row: JobOrLeadStakeholderSubtitleInput
): string | undefined {
  const contact = row.contact_info
    ? getPrimaryContactDisplayName(row.contact_info).trim()
    : "";
  const farm = row.farm_name?.trim() ?? "";

  if (contact && farm) return `${contact} - ${farm}`;
  if (contact) return contact;
  if (farm) return farm;
  return undefined;
}

/** Display name in list / grid / kanban card headers. */
export function getJobOrLeadListName(
  row: JobOrLeadStakeholderSubtitleInput & Pick<Job | Lead, "id">,
  typeLabel: JobOrLeadTypeLabel
): string {
  return getJobOrLeadStakeholderSubtitle(row) ?? `${typeLabel} #${row.id}`;
}
