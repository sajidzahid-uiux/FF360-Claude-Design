import { describe, expect, it } from "vitest";

import {
  bulkConfirmationCopy,
  bulkDeleteSuccessMessage,
} from "../bulkConfirmationCopy";

describe("bulkConfirmationCopy", () => {
  it("uses singular copy for one item", () => {
    expect(
      bulkConfirmationCopy({
        count: 1,
        entitySingular: "contact",
        entityPlural: "contacts",
        action: "delete",
      })
    ).toEqual({
      title: "Delete Contact",
      description: "Are you sure you want to permanently delete this contact?",
      confirmButtonText: "Delete",
    });
  });

  it("uses plural copy for multiple items", () => {
    expect(
      bulkConfirmationCopy({
        count: 3,
        entitySingular: "task",
        entityPlural: "tasks",
        action: "delete",
        suffix: " This cannot be undone.",
      })
    ).toEqual({
      title: "Delete 3 Tasks",
      description:
        "Are you sure you want to permanently delete 3 tasks? This cannot be undone.",
      confirmButtonText: "Delete All",
    });
  });
});

describe("bulkDeleteSuccessMessage", () => {
  it("formats singular and plural success messages", () => {
    expect(bulkDeleteSuccessMessage(1, "quick action", "quick actions")).toBe(
      "Quick action deleted."
    );
    expect(bulkDeleteSuccessMessage(2, "quick action", "quick actions")).toBe(
      "2 quick actions deleted."
    );
  });
});
