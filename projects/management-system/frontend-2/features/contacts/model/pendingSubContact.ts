import type {
  Contact,
  ContactCategory,
  SubContactCreateAndLinkPayload,
} from "@/api/types";

export type PendingSubContactEntry =
  | { kind: "existing"; contact: Contact }
  | {
      kind: "new";
      tempId: string;
      displayName: string;
      payload: SubContactCreateAndLinkPayload;
      categories?: ContactCategory[];
    };

/** Table row shape required by org-ui tables (`id` on each row). */
export type PendingSubContactTableRow = PendingSubContactEntry & {
  id: string;
};

export function pendingSubContactKey(entry: PendingSubContactEntry): string {
  return entry.kind === "existing"
    ? `existing-${entry.contact.id}`
    : entry.tempId;
}

export function toPendingSubContactTableRow(
  entry: PendingSubContactEntry
): PendingSubContactTableRow {
  return { ...entry, id: pendingSubContactKey(entry) };
}

export function pendingSubContactDisplayName(
  entry: PendingSubContactEntry
): string {
  return entry.kind === "existing"
    ? entry.contact.full_name
    : entry.displayName;
}

export function pendingSubContactCategories(
  entry: PendingSubContactEntry
): ContactCategory[] {
  if (entry.kind === "existing") {
    return entry.contact.categories ?? [];
  }
  return entry.categories ?? [];
}

export function getPendingExistingSubContactIds(
  pending: PendingSubContactEntry[]
): number[] {
  return pending
    .filter(
      (entry): entry is { kind: "existing"; contact: Contact } =>
        entry.kind === "existing"
    )
    .map((entry) => entry.contact.id);
}

export function getPendingNewSubContactEntries(
  pending: PendingSubContactEntry[]
): Extract<PendingSubContactEntry, { kind: "new" }>[] {
  return pending.filter(
    (entry): entry is Extract<PendingSubContactEntry, { kind: "new" }> =>
      entry.kind === "new"
  );
}
