/**
 * Django backend validation messages (ContactValidationMixin + contact_entries).
 * Frontend Zod rules should reject the same inputs before API submit.
 */
export const BACKEND_CONTACT_VALIDATION = {
  entriesRequired: "At least one contact entry is required.",
  exactlyOnePrimary: "Exactly one entry must be marked as primary.",
  primaryNameRequired:
    "Primary entry must include a name. Phone-only primary is not allowed.",
  entryNameOrPhone: (index: number) =>
    `Entry ${index}: at least one of name or phone_number is required.`,
  phoneChars:
    "Phone number may contain only digits, spaces, '+', '-', and parentheses.",
  phoneDigits: "Phone number must contain between 7 and 15 digits.",
  zipChars: "Zip code may contain letters, numbers, spaces, and hyphens only.",
  zipAlphanumeric: "Zip code must include at least one letter or number.",
  categoryRequired: "At least one category is required.",
  duplicatePhone:
    "A contact with this phone number already exists in this organization.",
} as const;

export const FRONTEND_CONTACT_DETAILS_MESSAGES = {
  empty: "At least one contact detail is required.",
  no_primary: "Select a primary contact detail.",
  multiple_primary: "Only one contact detail can be primary.",
  primary_missing_name: "Primary contact detail must include a name.",
  row_empty: "Each contact detail must have a name or phone number.",
} as const;

/** Maps backend contact_entries errors to frontend contactDetails messages. */
export const CONTACT_ENTRIES_PARITY: Array<{
  backend: string;
  frontend: string;
}> = [
  {
    backend: BACKEND_CONTACT_VALIDATION.entriesRequired,
    frontend: FRONTEND_CONTACT_DETAILS_MESSAGES.empty,
  },
  {
    backend: BACKEND_CONTACT_VALIDATION.exactlyOnePrimary,
    frontend: FRONTEND_CONTACT_DETAILS_MESSAGES.no_primary,
  },
  {
    backend: BACKEND_CONTACT_VALIDATION.primaryNameRequired,
    frontend: FRONTEND_CONTACT_DETAILS_MESSAGES.primary_missing_name,
  },
];
