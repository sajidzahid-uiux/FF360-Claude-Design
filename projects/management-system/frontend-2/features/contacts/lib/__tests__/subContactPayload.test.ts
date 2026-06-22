import { describe, expect, it } from "vitest";

import type { ContactFormData } from "@/features/contacts/model";

import {
  contactFormDataToSubContactCreateAndLink,
  mapContactFormVertices,
  subContactCreateAndLinkToContactCreate,
} from "../subContactPayload";

describe("subContactCreateAndLinkToContactCreate", () => {
  it("maps new sub-contact fields to a standard contact create payload", () => {
    expect(
      subContactCreateAndLinkToContactCreate({
        full_name: "Jane Doe",
        category_ids: [3],
        email: "jane@example.com",
        phone_number: "555-0100",
        contact_details: [
          { name: "Jane Doe", phone_number: "555-0100", is_primary: true },
        ],
      })
    ).toEqual({
      contact_subtype: "standard",
      full_name: "Jane Doe",
      category_ids: [3],
      email: "jane@example.com",
      phone_number: "555-0100",
      company_name: undefined,
      description: undefined,
      website_link: undefined,
      street_address: undefined,
      city: undefined,
      state: undefined,
      zip_code: undefined,
      longitude: undefined,
      latitude: undefined,
      vertices: undefined,
      contact_details: [
        { name: "Jane Doe", phone_number: "555-0100", is_primary: true },
      ],
    });
  });
});

describe("contactFormDataToSubContactCreateAndLink", () => {
  it("maps full contact form to payload with client category", () => {
    const formData: ContactFormData = {
      full_name: "",
      email: "a@b.com",
      phone_number: "",
      home_phone_number: "",
      company_name: "Acme",
      description: "Note",
      website_link: "https://x.com",
      street_address: "1 Main",
      city: "Town",
      state: "CA",
      zip_code: "90210",
      mapData: {
        location: { lat: 37, lng: -119 },
        vertices: [],
      },
      category_ids: [],
      contact_details: [
        {
          name: "Primary Name",
          phone_number: "555",
          label: "",
          is_primary: true,
        },
      ],
    };

    expect(contactFormDataToSubContactCreateAndLink(formData, 7)).toMatchObject(
      {
        full_name: "Primary Name",
        category_ids: [7],
        email: "a@b.com",
        phone_number: "555",
        company_name: "Acme",
        longitude: -119,
        latitude: 37,
      }
    );
  });
});

describe("mapContactFormVertices", () => {
  it("builds default square from location when no vertices", () => {
    const verts = mapContactFormVertices({
      location: { lat: 10, lng: 20 },
      vertices: [],
    });
    expect(verts).toHaveLength(4);
    expect(verts?.[0]).toEqual([19.999, 9.999]);
  });
});
