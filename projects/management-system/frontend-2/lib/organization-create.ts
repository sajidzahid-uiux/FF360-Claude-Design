import type { OrganizationCreateFieldErrors } from "@fieldflow360/org-ui";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Maps CMS API validation payloads to org-ui create form field errors. */
export function mapOrganizationCreateApiErrors(
  data: unknown
): OrganizationCreateFieldErrors {
  if (!isRecord(data)) {
    return { general: ["Failed to create organization. Please try again."] };
  }

  const errors: OrganizationCreateFieldErrors = {};

  for (const [key, value] of Object.entries(data)) {
    if (!Array.isArray(value)) continue;
    const messages = value.filter(
      (item): item is string => typeof item === "string"
    );
    if (messages.length === 0) continue;

    if (key === "phone_number") {
      errors.phone_number = messages;
      errors.phoneNumber = messages;
    } else if (
      key === "name" ||
      key === "email" ||
      key === "address" ||
      key === "logo"
    ) {
      errors[key] = messages;
    } else if (key === "latitude" || key === "longitude") {
      errors[key] = messages;
    } else {
      errors.general = [...(errors.general ?? []), ...messages];
    }
  }

  if (Object.keys(errors).length === 0) {
    return { general: ["Failed to create organization. Please try again."] };
  }

  return errors;
}
