import { describe, expect, it } from "vitest";

import { contactDetailRowSchema } from "../contactFormZodSchemas";

describe("contactDetailRowSchema", () => {
  it("accepts null contact detail id from API-shaped rows", () => {
    expect(
      contactDetailRowSchema.safeParse({
        id: null,
        name: "Primary",
        phone_number: "555",
        label: "",
        is_primary: true,
      }).success
    ).toBe(true);
  });
});
