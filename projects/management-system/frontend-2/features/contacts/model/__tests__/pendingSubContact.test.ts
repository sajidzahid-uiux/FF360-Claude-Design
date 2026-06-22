import { describe, expect, it } from "vitest";

import type { Contact } from "@/api/types";

import {
  type PendingSubContactEntry,
  getPendingExistingSubContactIds,
  getPendingNewSubContactEntries,
} from "../pendingSubContact";

const existingContact = {
  id: 10,
  full_name: "John Smith",
  categories: [],
  created_at: "2025-01-01T00:00:00Z",
} as Contact;

describe("pendingSubContact helpers", () => {
  it("extracts existing sub-contact ids for create payload", () => {
    const pending: PendingSubContactEntry[] = [
      { kind: "existing", contact: existingContact },
      {
        kind: "new",
        tempId: "new-1",
        displayName: "Jane Doe",
        payload: { full_name: "Jane Doe", category_ids: [1] },
      },
      {
        kind: "existing",
        contact: { ...existingContact, id: 11, full_name: "Other" },
      },
    ];

    expect(getPendingExistingSubContactIds(pending)).toEqual([10, 11]);
  });

  it("extracts only new sub-contact entries for create-and-link", () => {
    const pending: PendingSubContactEntry[] = [
      { kind: "existing", contact: existingContact },
      {
        kind: "new",
        tempId: "new-1",
        displayName: "Jane Doe",
        payload: { full_name: "Jane Doe", category_ids: [1] },
      },
    ];

    expect(getPendingNewSubContactEntries(pending)).toHaveLength(1);
    expect(getPendingNewSubContactEntries(pending)[0]?.kind).toBe("new");
  });
});
