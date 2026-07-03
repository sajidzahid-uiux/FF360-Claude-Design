import { z } from "zod";

import {
  getContactDetailsErrorMessage,
  validateContactDetails,
} from "@/features/contacts/lib/contactDetails";
import {
  CONTACT_FIELD_LIMITS,
  type ContactFormData,
} from "@/features/contacts/model";
import {
  validatePhone,
  validateZipCode,
} from "@/utils/validation/contactValidation";

const contactDetailRowSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  phone_number: z.string(),
  label: z.string(),
  is_primary: z.boolean(),
});

export const contactFormValidation = z
  .object({
    full_name: z.string().max(CONTACT_FIELD_LIMITS.full_name).optional(),
    email: z
      .string()
      .max(CONTACT_FIELD_LIMITS.email)
      .optional()
      .or(z.literal(""))
      .refine(
        (val) =>
          !val || !val.trim() || z.string().email().safeParse(val).success,
        { message: "Please enter a valid email address" }
      ),
    phone_number: z
      .string()
      .max(CONTACT_FIELD_LIMITS.phone_number)
      .optional()
      .or(z.literal("")),
    home_phone_number: z
      .string()
      .max(CONTACT_FIELD_LIMITS.home_phone_number)
      .optional()
      .or(z.literal(""))
      .superRefine((val, ctx) => {
        if (typeof val !== "string" || !val.trim()) return;
        const err = validatePhone(val);
        if (err) ctx.addIssue({ code: z.ZodIssueCode.custom, message: err });
      }),
    company_name: z
      .string()
      .max(CONTACT_FIELD_LIMITS.company_name)
      .optional()
      .or(z.literal("")),
    description: z
      .string()
      .max(CONTACT_FIELD_LIMITS.description)
      .optional()
      .or(z.literal("")),
    website_link: z
      .string()
      .max(CONTACT_FIELD_LIMITS.website_link)
      .optional()
      .or(z.literal(""))
      .refine((val) => !val || !val.trim() || /^https?:\/\/.+/.test(val), {
        message: "Website link must start with http:// or https://",
      }),
    street_address: z
      .string()
      .max(CONTACT_FIELD_LIMITS.street_address)
      .optional()
      .or(z.literal("")),
    city: z
      .string()
      .max(CONTACT_FIELD_LIMITS.city)
      .optional()
      .or(z.literal("")),
    state: z
      .string()
      .max(CONTACT_FIELD_LIMITS.state)
      .optional()
      .or(z.literal("")),
    zip_code: z
      .string()
      .max(CONTACT_FIELD_LIMITS.zip_code)
      .optional()
      .or(z.literal(""))
      .superRefine((val, ctx) => {
        if (typeof val !== "string" || !val.trim()) return;
        const err = validateZipCode(val);
        if (err) ctx.addIssue({ code: z.ZodIssueCode.custom, message: err });
      }),
    mapData: z.object({
      location: z
        .object({
          lat: z.number(),
          lng: z.number(),
        })
        .nullable(),
      vertices: z.array(
        z.object({
          lat: z.number(),
          lng: z.number(),
        })
      ),
    }),
    // No minimum — when empty, "Client Contact" is assigned automatically
    // (see buildContactCreatePayload).
    category_ids: z
      .array(z.number())
      .transform((ids) =>
        ids.filter(
          (id): id is number => typeof id === "number" && !Number.isNaN(id)
        )
      ),
    contact_details: z.array(contactDetailRowSchema).min(1),
  })
  .superRefine((data, ctx) => {
    const detailsError = validateContactDetails(data.contact_details);
    if (detailsError) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: getContactDetailsErrorMessage(detailsError),
        path: ["contact_details"],
      });
    }

    for (const [index, row] of data.contact_details.entries()) {
      if (!row.phone_number.trim()) continue;
      const err = validatePhone(row.phone_number);
      if (err) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: err,
          path: ["contact_details", index, "phone_number"],
        });
      }
    }
  });

export function isContactFormSubmittable(data: ContactFormData): boolean {
  return contactFormValidation.safeParse(data).success;
}

export function mapContactFormZodErrors(
  error: z.ZodError
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key !== "string" || fieldErrors[key]) continue;
    fieldErrors[key] = issue.message;
  }

  return fieldErrors;
}
