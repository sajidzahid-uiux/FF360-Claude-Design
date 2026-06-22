import { describe, expect, it } from "vitest";

import type { ContactCategory } from "@/api/types";
import {
  type ContactFormData,
  DEFAULT_CONTACT_FORM_DATA,
} from "@/features/contacts";
import { buildContactCreatePayload } from "@/features/contacts/lib";
import type { ContactDetailFormRow } from "@/features/contacts/lib";

const categories: ContactCategory[] = [
  {
    id: 1,
    name: "Client Contact",
    color: "#f00",
    is_default: true,
  },
  {
    id: 2,
    name: "Vendor",
    color: "#0f0",
    is_default: false,
  },
];

function primaryContactDetails(
  name: string,
  phone_number = ""
): ContactDetailFormRow[] {
  return [
    {
      name,
      phone_number,
      label: "",
      is_primary: true,
    },
  ];
}

function formWithContactDetails(
  name: string,
  overrides: Partial<ContactFormData> = {}
): ContactFormData {
  return {
    ...DEFAULT_CONTACT_FORM_DATA,
    full_name: name,
    contact_details: primaryContactDetails(name),
    ...overrides,
  };
}

describe("buildContactCreatePayload", () => {
  it("trims name and omits empty optional fields", () => {
    const payload = buildContactCreatePayload(
      formWithContactDetails("  Jane Doe  ", {
        email: "  ",
        category_ids: [2],
        contact_details: primaryContactDetails("  Jane Doe  "),
      }),
      categories
    );

    expect(payload.full_name).toBe("Jane Doe");
    expect(payload.category_ids).toEqual([2]);
    expect(payload.email).toBeUndefined();
  });

  it("assigns client contact case-insensitively when none selected", () => {
    const payload = buildContactCreatePayload(
      formWithContactDetails("Test", { category_ids: [] }),
      [{ id: 9, name: "client contact", color: "#f00" }]
    );

    expect(payload.category_ids).toEqual([9]);
  });

  it("assigns Client Contact when no categories selected", () => {
    const payload = buildContactCreatePayload(
      formWithContactDetails("Test", { category_ids: [] }),
      categories
    );

    expect(payload.category_ids).toEqual([1]);
  });

  it("filters invalid category ids from form state", () => {
    const payload = buildContactCreatePayload(
      formWithContactDetails("Test", {
        category_ids: [2, Number.NaN, undefined as unknown as number],
      }),
      categories
    );

    expect(payload.category_ids).toEqual([2]);
  });

  it("builds default vertices from map location when none provided", () => {
    const payload = buildContactCreatePayload(
      formWithContactDetails("Test", {
        category_ids: [2],
        mapData: {
          location: { lat: 42, lng: -94 },
          vertices: [],
        },
      }),
      categories
    );

    expect(payload.latitude).toBe(42);
    expect(payload.longitude).toBe(-94);
    expect(payload.vertices).toHaveLength(4);
    expect(payload.vertices?.[0]).toEqual([-94.001, 41.999]);
  });

  it("uses explicit vertices when present", () => {
    const payload = buildContactCreatePayload(
      formWithContactDetails("Test", {
        category_ids: [2],
        mapData: {
          location: { lat: 42, lng: -94 },
          vertices: [{ lat: 43, lng: -93 }],
        },
      }),
      categories
    );

    expect(payload.vertices).toEqual([[-93, 43]]);
  });
});
