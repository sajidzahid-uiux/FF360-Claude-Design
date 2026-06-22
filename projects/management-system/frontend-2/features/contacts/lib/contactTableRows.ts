import type { Contact, SubContactSummary } from "@/api/types";
import { CONTACT_SUBTYPE } from "@/features/contacts/model";

export type ContactRowKind = "parent" | "sub";

export interface ContactTableRow extends Contact {
  rowKind: ContactRowKind;
  parentId?: number;
  isExpandable?: boolean;
}

function subContactToTableRow(
  sub: SubContactSummary,
  parentId: number
): ContactTableRow {
  return {
    id: sub.id,
    full_name: sub.full_name,
    email: sub.email,
    phone_number: sub.phone_number,
    categories: sub.categories ?? [],
    contact_subtype: sub.contact_subtype ?? CONTACT_SUBTYPE.STANDARD,
    created_at: sub.created_at ?? new Date().toISOString(),
    rowKind: "sub",
    parentId,
    isExpandable: false,
  };
}

export function buildContactTableRows(
  contacts: Contact[],
  expandedParentIds: ReadonlySet<number>
): ContactTableRow[] {
  const rows: ContactTableRow[] = [];

  for (const contact of contacts) {
    const isFarmManagement =
      contact.contact_subtype === CONTACT_SUBTYPE.FARM_MANAGEMENT;
    const subContacts = contact.sub_contacts ?? [];
    const isExpandable = isFarmManagement && subContacts.length > 0;

    rows.push({
      ...contact,
      rowKind: "parent",
      isExpandable,
    });

    if (isExpandable && expandedParentIds.has(contact.id)) {
      for (const sub of subContacts) {
        rows.push(subContactToTableRow(sub, contact.id));
      }
    }
  }

  return rows;
}

export function toggleExpandedParentId(
  expanded: Set<number>,
  parentId: number
): Set<number> {
  const next = new Set(expanded);
  if (next.has(parentId)) {
    next.delete(parentId);
  } else {
    next.add(parentId);
  }
  return next;
}

export function isFarmManagementContact(
  contact: Pick<Contact, "contact_subtype">
): boolean {
  return contact.contact_subtype === CONTACT_SUBTYPE.FARM_MANAGEMENT;
}
