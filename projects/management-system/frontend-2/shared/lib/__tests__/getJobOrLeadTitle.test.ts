import { describe, expect, it } from "vitest";

import type { ContactInfo } from "@/api/types";

import {
  type JobOrLeadStakeholderSubtitleInput,
  getJobOrLeadListName,
  getJobOrLeadStakeholderSubtitle,
  getJobOrLeadTitle,
} from "../getJobOrLeadTitle";

function contactInfo(
  overrides: Partial<ContactInfo> & Pick<ContactInfo, "full_name">
): ContactInfo {
  return {
    id: 1,
    phone_number: "",
    email: "",
    ...overrides,
  };
}

describe("getJobOrLeadTitle", () => {
  it("prefers description, then po_number, then title", () => {
    expect(
      getJobOrLeadTitle(
        { id: 1, description: "  Drain  ", po_number: "PO-1", title: "T" },
        "Job"
      )
    ).toBe("Drain");
    expect(
      getJobOrLeadTitle(
        { id: 2, description: "", po_number: " PO-2 ", title: "T" },
        "Lead"
      )
    ).toBe("PO-2");
    expect(
      getJobOrLeadTitle(
        { id: 3, description: "", po_number: "", title: " Title " },
        "Job"
      )
    ).toBe("Title");
  });

  it("falls back to type label and id", () => {
    expect(
      getJobOrLeadTitle(
        { id: 9, description: "", po_number: "", title: "" },
        "Lead"
      )
    ).toBe("Lead #9");
    expect(
      getJobOrLeadTitle(
        { id: 10, description: "", po_number: "", title: "" },
        "Job"
      )
    ).toBe("Job #10");
  });
});

describe("getJobOrLeadStakeholderSubtitle", () => {
  it("formats primary contact and farm", () => {
    expect(
      getJobOrLeadStakeholderSubtitle({
        contact_info: contactInfo({ full_name: "John Smith" }),
        farm_name: "North Farm",
      })
    ).toBe("John Smith - North Farm");
  });

  it("uses primary contact detail name when present", () => {
    expect(
      getJobOrLeadStakeholderSubtitle({
        contact_info: {
          id: 1,
          full_name: "Legacy",
          phone_number: "",
          email: "",
          contact_details: [{ is_primary: true, name: "Jane Doe" }],
        } as unknown as ContactInfo,
        farm_name: "North Farm",
      } as JobOrLeadStakeholderSubtitleInput)
    ).toBe("Jane Doe - North Farm");
  });

  it("returns single side when only contact or farm exists", () => {
    expect(
      getJobOrLeadStakeholderSubtitle({
        contact_info: contactInfo({ full_name: "John Smith" }),
      })
    ).toBe("John Smith");
    expect(
      getJobOrLeadStakeholderSubtitle({
        farm_name: "North Farm",
      } as JobOrLeadStakeholderSubtitleInput)
    ).toBe("North Farm");
  });

  it("returns undefined when both are missing", () => {
    expect(
      getJobOrLeadStakeholderSubtitle({} as JobOrLeadStakeholderSubtitleInput)
    ).toBeUndefined();
  });
});

describe("getJobOrLeadListName", () => {
  it("shows primary contact and farm only, not description or PO", () => {
    expect(
      getJobOrLeadListName(
        {
          id: 1,
          contact_info: contactInfo({ full_name: "John Smith" }),
          farm_name: "North Farm",
        },
        "Job"
      )
    ).toBe("John Smith - North Farm");
  });

  it("falls back to type and id when no primary stakeholders", () => {
    expect(
      getJobOrLeadListName(
        {
          id: 5,
          contact_info: {
            full_name: "",
            phone_number: "",
            email: "",
          } as unknown as ContactInfo,
        } as JobOrLeadStakeholderSubtitleInput & { id: number },
        "Lead"
      )
    ).toBe("Lead #5");
  });
});
