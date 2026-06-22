import { describe, expect, it } from "vitest";

import {
  buildContactRowActions,
  getContactRowActionDescriptors,
} from "@/features/contacts/lib/columns/contact-org-ui-row-actions";

describe("getContactRowActionDescriptors", () => {
  it("includes view and logs when user can read", () => {
    const actions = getContactRowActionDescriptors({
      canReadContacts: true,
      canDeleteContacts: false,
    });

    expect(actions.map((a) => a.label)).toEqual(["View details", "Logs"]);
  });

  it("omits view and logs when user cannot read", () => {
    const actions = getContactRowActionDescriptors({
      canReadContacts: false,
      canDeleteContacts: true,
    });

    expect(actions.map((a) => a.label)).toEqual(["Delete"]);
  });

  it("includes delete only when user can delete", () => {
    const withDelete = getContactRowActionDescriptors({
      canReadContacts: true,
      canDeleteContacts: true,
    });
    const withoutDelete = getContactRowActionDescriptors({
      canReadContacts: true,
      canDeleteContacts: false,
    });

    expect(withDelete.map((a) => a.label)).toContain("Delete");
    expect(withoutDelete.map((a) => a.label)).not.toContain("Delete");
  });

  it("returns no actions when user lacks read and delete", () => {
    const actions = getContactRowActionDescriptors({
      canReadContacts: false,
      canDeleteContacts: false,
    });

    expect(actions).toHaveLength(0);
  });
});

describe("buildContactRowActions", () => {
  it("wires handlers for each action key", () => {
    const contact = {
      id: 42,
      full_name: "Lera",
      categories: [],
      created_at: "2026-05-26T00:00:00Z",
    };
    let viewCalled = false;
    let logsCalled = false;

    const actions = buildContactRowActions(contact, {
      canReadContacts: true,
      canDeleteContacts: false,
      onViewContact: () => {
        viewCalled = true;
      },
      onContactLogs: () => {
        logsCalled = true;
      },
      onDeleteContact: () => undefined,
    });

    actions.find((a) => a.key === "view")?.onClick();
    actions.find((a) => a.key === "logs")?.onClick();

    expect(viewCalled).toBe(true);
    expect(logsCalled).toBe(true);
  });
});
