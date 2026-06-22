import { describe, expect, it } from "vitest";

import { DEFAULT_CONTACT_FORM_DATA } from "@/features/contacts";
import {
  contactFormValidation,
  isContactFormSubmittable,
  mapContactFormZodErrors,
} from "@/features/contacts/lib";
import type { ContactDetailFormRow } from "@/features/contacts/lib";
import {
  BACKEND_CONTACT_VALIDATION,
  CONTACT_ENTRIES_PARITY,
  FRONTEND_CONTACT_DETAILS_MESSAGES,
} from "@/features/contacts/lib/contact-backend-validation";
import { CONTACT_FIELD_LIMITS } from "@/features/contacts/model";
import {
  validatePhone,
  validateZipCode,
} from "@/utils/validation/contactValidation";

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

function validContactForm(
  overrides: Partial<typeof DEFAULT_CONTACT_FORM_DATA> = {}
) {
  return {
    ...DEFAULT_CONTACT_FORM_DATA,
    contact_details: primaryContactDetails("Jane"),
    category_ids: [1],
    ...overrides,
  };
}

describe("contactFormValidation", () => {
  it("requires primary contact detail name", () => {
    const result = contactFormValidation.safeParse({
      ...DEFAULT_CONTACT_FORM_DATA,
    });

    expect(result.success).toBe(false);
    expect(isContactFormSubmittable(DEFAULT_CONTACT_FORM_DATA)).toBe(false);
  });

  it("requires at least one category (backend validate_category_ids)", () => {
    const result = contactFormValidation.safeParse(
      validContactForm({ category_ids: [] })
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.message.includes("category"))
      ).toBe(true);
    }
  });

  it("isContactFormSubmittable matches successful validation", () => {
    const data = validContactForm();

    expect(isContactFormSubmittable(data)).toBe(true);
    expect(contactFormValidation.safeParse(data).success).toBe(true);
  });

  it("accepts empty optional email", () => {
    const result = contactFormValidation.safeParse(
      validContactForm({ email: "" })
    );

    expect(result.success).toBe(true);
  });

  it("rejects invalid zip when provided", () => {
    const result = contactFormValidation.safeParse(
      validContactForm({ zip_code: "!!!" })
    );

    expect(result.success).toBe(false);
  });

  it("rejects zip with only hyphens (backend validate_zip_code)", () => {
    expect(validateZipCode("---")).toBe(
      "Postal/zip code must include at least one letter or number"
    );
    expect(
      contactFormValidation.safeParse(validContactForm({ zip_code: "---" }))
        .success
    ).toBe(false);
  });

  it("rejects phone numbers with too few digits", () => {
    const result = contactFormValidation.safeParse(
      validContactForm({
        contact_details: primaryContactDetails("Jane", "123"),
      })
    );

    expect(result.success).toBe(false);
  });

  it("rejects phone numbers with more than 15 digits (backend)", () => {
    const tooLong = "1".repeat(16);
    expect(validatePhone(`(${tooLong})`)).toBe(
      "Phone number must have between 7 and 15 digits"
    );
    expect(
      contactFormValidation.safeParse(
        validContactForm({
          contact_details: primaryContactDetails("Jane", tooLong),
        })
      ).success
    ).toBe(false);
  });

  it("rejects phone numbers with invalid characters (backend PHONE_ALLOWED_PATTERN)", () => {
    expect(validatePhone("555-1234 ext 9")).toBe(
      "Use only digits, +, -, spaces, and parentheses in phone numbers"
    );
    expect(
      contactFormValidation.safeParse(
        validContactForm({
          contact_details: primaryContactDetails("Jane", "555-1234 ext 9"),
        })
      ).success
    ).toBe(false);
  });

  it("rejects invalid email and website", () => {
    const emailResult = contactFormValidation.safeParse(
      validContactForm({ email: "not-an-email" })
    );
    const websiteResult = contactFormValidation.safeParse(
      validContactForm({ website_link: "example.com" })
    );

    expect(emailResult.success).toBe(false);
    expect(websiteResult.success).toBe(false);
  });

  it("rejects field values exceeding backend max_length", () => {
    const longEmail = `${"a".repeat(CONTACT_FIELD_LIMITS.email - 10)}@example.com`;
    const result = contactFormValidation.safeParse(
      validContactForm({ email: longEmail })
    );

    expect(result.success).toBe(false);
  });

  it("rejects NaN and non-numeric category ids before transform", () => {
    const nanResult = contactFormValidation.safeParse(
      validContactForm({ category_ids: [1, Number.NaN] })
    );
    const undefinedResult = contactFormValidation.safeParse(
      validContactForm({
        category_ids: [1, undefined as unknown as number],
      })
    );

    expect(nanResult.success).toBe(false);
    expect(undefinedResult.success).toBe(false);
  });

  it("rejects multiple primary contact details (backend exactly one primary)", () => {
    const result = contactFormValidation.safeParse(
      validContactForm({
        contact_details: [
          { name: "A", phone_number: "", label: "", is_primary: true },
          { name: "B", phone_number: "", label: "", is_primary: true },
        ],
      })
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) =>
          issue.message.includes(
            FRONTEND_CONTACT_DETAILS_MESSAGES.multiple_primary
          )
        )
      ).toBe(true);
    }
  });

  it("rejects secondary row with neither name nor phone (backend entry rule)", () => {
    const result = contactFormValidation.safeParse(
      validContactForm({
        contact_details: [
          { name: "Jane", phone_number: "", label: "", is_primary: true },
          { name: "", phone_number: "", label: "Alt", is_primary: false },
        ],
      })
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) =>
          issue.message.includes(FRONTEND_CONTACT_DETAILS_MESSAGES.row_empty)
        )
      ).toBe(true);
    }
  });

  it("rejects home phone with invalid format", () => {
    expect(
      contactFormValidation.safeParse(
        validContactForm({ home_phone_number: "abc" })
      ).success
    ).toBe(false);
  });
});

describe("backend ↔ frontend contact entry messages", () => {
  it("documents parity between Django contact_entries and contactDetails helpers", () => {
    expect(CONTACT_ENTRIES_PARITY.length).toBeGreaterThan(0);
    expect(BACKEND_CONTACT_VALIDATION.categoryRequired).toBe(
      "At least one category is required."
    );
  });
});

describe("mapContactFormZodErrors", () => {
  it("maps first issue per top-level field", () => {
    const parsed = contactFormValidation.safeParse({
      ...DEFAULT_CONTACT_FORM_DATA,
      contact_details: primaryContactDetails(""),
      email: "bad",
    });

    if (parsed.success) {
      throw new Error("expected validation failure");
    }

    const errors = mapContactFormZodErrors(parsed.error);
    expect(errors.contact_details).toBeDefined();
    expect(errors.email).toBeDefined();
  });
});
