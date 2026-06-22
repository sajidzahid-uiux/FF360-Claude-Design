import { describe, expect, it } from "vitest";

import {
  addContactDetailRow,
  createDefaultContactDetails,
  formatContactDisplayLabel,
  formatSecondaryContactNames,
  getPrimaryContactDetail,
  getPrimaryContactDisplayName,
  mapApiContactDetailsToForm,
  mapContactDetailsToApi,
  orderContactDetailsForApiWrite,
  removeContactDetailRow,
  setPrimaryDetail,
  syncLegacyFieldsFromDetails,
  validateContactDetails,
} from "../contactDetails";

describe("contactDetails", () => {
  it("creates default with one primary row", () => {
    const rows = createDefaultContactDetails();
    expect(rows).toHaveLength(1);
    expect(rows[0].is_primary).toBe(true);
  });

  it("validates primary name requirement", () => {
    const rows = [
      { name: "", phone_number: "555", label: "", is_primary: true },
    ];
    expect(validateContactDetails(rows)).toBe("primary_missing_name");
  });

  it("validates exactly one primary", () => {
    const rows = [
      { name: "A", phone_number: "", label: "", is_primary: true },
      { name: "B", phone_number: "", label: "", is_primary: true },
    ];
    expect(validateContactDetails(rows)).toBe("multiple_primary");
  });

  it("syncs legacy fields from primary", () => {
    const rows = [
      {
        name: "Layla Everett",
        phone_number: "+1 555",
        label: "",
        is_primary: true,
      },
    ];
    expect(syncLegacyFieldsFromDetails(rows)).toEqual({
      full_name: "Layla Everett",
      phone_number: "+1 555",
    });
  });

  it("orders existing entries with primary last for PATCH", () => {
    const rows = [
      {
        id: 5,
        name: "New Primary",
        phone_number: "",
        label: "",
        is_primary: true,
      },
      { id: 4, name: "Old", phone_number: "", label: "", is_primary: false },
    ];
    const ordered = orderContactDetailsForApiWrite(rows);
    expect(ordered.map((r) => r.id)).toEqual([4, 5]);
    const api = mapContactDetailsToApi(rows);
    expect(api.map((e) => e.id)).toEqual([4, 5]);
    expect(api[1]?.is_primary).toBe(true);
  });

  it("maps API details to form and back", () => {
    const api = [
      {
        id: 1,
        name: "Primary",
        phone_number: "111",
        label: "",
        is_primary: true,
      },
      {
        id: 2,
        name: "Secondary",
        phone_number: "222",
        label: "Office",
        is_primary: false,
      },
    ];
    const form = mapApiContactDetailsToForm(api);
    expect(form).toHaveLength(2);
    const back = mapContactDetailsToApi(form);
    const primary = back.find((e) => e.id === 1);
    const secondary = back.find((e) => e.id === 2);
    expect(primary).toMatchObject({ name: "Primary", is_primary: true });
    expect(secondary?.label).toBe("Office");
  });

  it("setPrimaryDetail marks only one primary", () => {
    const rows = createDefaultContactDetails();
    const updated = setPrimaryDetail(
      [...rows, { name: "B", phone_number: "", label: "", is_primary: false }],
      1
    );
    expect(getPrimaryContactDetail(updated)?.name).toBe("B");
  });

  it("addContactDetailRow appends non-primary row", () => {
    const rows = addContactDetailRow(createDefaultContactDetails());
    expect(rows).toHaveLength(2);
    expect(rows[1].is_primary).toBe(false);
  });

  it("removeContactDetailRow resets to one empty primary when removing the only row", () => {
    const rows = removeContactDetailRow(
      [{ name: "Solo", phone_number: "1", label: "", is_primary: true }],
      0
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual({
      name: "",
      phone_number: "",
      label: "",
      is_primary: true,
    });
  });

  it("removing the primary promotes the next row to primary", () => {
    const rows = [
      { id: 1, name: "Primary", phone_number: "", label: "", is_primary: true },
      { id: 2, name: "Other", phone_number: "", label: "", is_primary: false },
    ];
    const next = removeContactDetailRow(rows, 0);
    expect(next).toHaveLength(1);
    expect(next[0].id).toBe(2);
    expect(next[0].is_primary).toBe(true);
  });

  it("getPrimaryContactDisplayName prefers primary detail name", () => {
    expect(
      getPrimaryContactDisplayName({
        id: 1,
        full_name: "Legacy Name",
        contact_details: [
          { name: "Display Primary", phone_number: "", is_primary: true },
          { name: "Other", phone_number: "", is_primary: false },
        ],
      })
    ).toBe("Display Primary");
    expect(
      getPrimaryContactDisplayName({ id: 2, full_name: "Legacy Only" })
    ).toBe("Legacy Only");
  });

  it("formatSecondaryContactNames lists non-primary names", () => {
    const result = formatSecondaryContactNames(
      [
        { name: "Primary", phone_number: "", is_primary: true },
        { name: "Other", phone_number: "", is_primary: false },
        { name: "Third", phone_number: "", is_primary: false },
      ],
      "Primary"
    );
    expect(result).toContain("Other");
    expect(result).toContain("Third");
  });

  it("formatContactDisplayLabel combines primary and secondary names", () => {
    const details = [
      { name: "SingleContactName1", phone_number: "", is_primary: true },
      { name: "SingleContactName2", phone_number: "", is_primary: false },
    ];
    expect(
      getPrimaryContactDisplayName({
        full_name: "Legacy",
        contact_details: details,
      })
    ).toBe("SingleContactName1");
    expect(
      formatContactDisplayLabel({
        full_name: "Legacy",
        contact_details: details,
      })
    ).toBe("SingleContactName1 (SingleContactName2)");
  });

  it("formatContactDisplayLabel truncates long secondary lists with +N", () => {
    const details = [
      { name: "Primary", phone_number: "", is_primary: true },
      { name: "A", phone_number: "", is_primary: false },
      { name: "B", phone_number: "", is_primary: false },
      { name: "C", phone_number: "", is_primary: false },
      { name: "D", phone_number: "", is_primary: false },
    ];
    expect(
      formatContactDisplayLabel({
        full_name: "Primary",
        contact_details: details,
      })
    ).toBe("Primary (A, B, C, +1)");
  });
});
