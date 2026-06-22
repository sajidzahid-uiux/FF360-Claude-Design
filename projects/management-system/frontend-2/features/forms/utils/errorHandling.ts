import { z } from "zod";

import {
  extractApiErrorPayload,
  getErrorMessage,
  getHttpErrorStatus,
  isApiForbiddenError,
} from "@/utils/apiError";

export {
  extractApiErrorPayload,
  getErrorMessage,
  getHttpErrorStatus,
  isApiForbiddenError,
};

const LEAD_FARM_BOUNDARY_ERROR_MESSAGE =
  "The farm you chose has a location but no boundaries. Please select a different farm or add boundaries to this one.";

export function getApiFieldErrorMessages(error: unknown): string[] {
  const payload = extractApiErrorPayload(error);
  if (!payload) return [];

  const messages: string[] = [];
  for (const [field, value] of Object.entries(payload)) {
    if (field === "detail" || field === "message" || field === "error") {
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach((message) => {
        if (message != null && String(message).trim()) {
          messages.push(String(message));
        }
      });
      continue;
    }

    if (typeof value === "string" && value.trim()) {
      messages.push(value);
    }
  }

  return messages;
}

export function getLeadCreateErrorMessage(
  error: unknown,
  defaultMessage = "Failed to create lead"
): string {
  const payload = extractApiErrorPayload(error);
  const nonFieldErrors = payload?.non_field_errors;

  if (Array.isArray(nonFieldErrors) && nonFieldErrors.length > 0) {
    const firstError = String(nonFieldErrors[0]);
    if (firstError.toLowerCase().includes("boundaries")) {
      return LEAD_FARM_BOUNDARY_ERROR_MESSAGE;
    }
  }

  return getErrorMessage(error, defaultMessage);
}

export type FieldErrorMap = Record<string, string>;

export function parseErrorDetails(
  details: unknown
): string | unknown[] | Record<string, unknown> | null {
  if (typeof details === "string") {
    try {
      const parsed = JSON.parse(details);
      if (parsed && typeof parsed === "object") {
        return parsed as Record<string, unknown>;
      }
    } catch {
      const match = details.match(/string="([^"]+)"/);
      if (match) {
        const errorMessage = match[1];
        const innerMatch = errorMessage.match(/'([^']+)'/);
        return [innerMatch ? innerMatch[1] : errorMessage];
      }
    }
    return [details];
  }

  if (Array.isArray(details)) return details;
  if (details && typeof details === "object")
    return details as Record<string, unknown>;
  return null;
}

export function extractFormFieldErrors(formErrors: unknown): FieldErrorMap {
  const fieldErrors: FieldErrorMap = {};
  if (!formErrors || typeof formErrors !== "object") return fieldErrors;

  const errObj = formErrors as Record<string, unknown>;
  for (const [key, value] of Object.entries(errObj)) {
    if (!value || typeof value !== "object") continue;
    const maybeMessage = (value as { message?: unknown }).message;
    if (typeof maybeMessage === "string" && maybeMessage.trim()) {
      fieldErrors[key] = maybeMessage;
    }
  }

  const rootMessage = (errObj as { message?: unknown }).message;
  if (
    typeof rootMessage === "string" &&
    rootMessage.trim() &&
    Object.keys(fieldErrors).length === 0
  ) {
    fieldErrors.general = rootMessage;
  }
  return fieldErrors;
}

function mapContactDetailString(detail: string): FieldErrorMap {
  const lower = detail.toLowerCase();
  if (lower.includes("home phone")) return { home_phone_number: detail };
  if (lower.includes("phone number") || lower.includes("phone_number")) {
    return { phone_number: detail };
  }
  if (lower.includes("zip code") || lower.includes("zip_code")) {
    return { zip_code: detail };
  }
  if (lower.includes("email")) return { email: detail };
  if (
    lower.includes("website") ||
    lower.includes("link") ||
    lower.includes("url")
  ) {
    return { website_link: detail };
  }
  if (lower.includes("name") || lower.includes("full_name")) {
    return { full_name: detail };
  }
  return {};
}

export function mapContactDetailsToFieldErrors(
  details: string | unknown[] | Record<string, unknown> | null
): FieldErrorMap {
  const fieldErrors: FieldErrorMap = {};
  if (!details) return fieldErrors;

  if (typeof details === "string") {
    Object.assign(fieldErrors, mapContactDetailString(details));
    return fieldErrors;
  }

  if (Array.isArray(details)) {
    details.forEach((detail) => {
      if (typeof detail === "string") {
        Object.assign(fieldErrors, mapContactDetailString(detail));
      } else if (
        detail &&
        typeof detail === "object" &&
        "string" in detail &&
        typeof (detail as { string?: unknown }).string === "string"
      ) {
        Object.assign(
          fieldErrors,
          mapContactDetailString((detail as { string: string }).string)
        );
      } else if (
        detail &&
        typeof detail === "object" &&
        "field" in detail &&
        typeof (detail as { field?: unknown }).field === "string"
      ) {
        const d = detail as {
          field: string;
          message?: unknown;
          detail?: unknown;
        };
        const msg =
          typeof d.message === "string"
            ? d.message
            : typeof d.detail === "string"
              ? d.detail
              : String(detail);
        fieldErrors[d.field] = msg;
      }
    });
    return fieldErrors;
  }

  Object.entries(details).forEach(([field, value]) => {
    if (Array.isArray(value)) {
      if (value.length > 0) fieldErrors[field] = String(value[0]);
    } else if (typeof value === "string") {
      fieldErrors[field] = value;
    }
  });
  return fieldErrors;
}

export function applyZodIssuesToForm(
  err: unknown,
  setError: (name: string, error: { type: string; message: string }) => void
): boolean {
  const isZodError =
    err instanceof z.ZodError ||
    (typeof err === "object" &&
      err !== null &&
      "issues" in err &&
      Array.isArray((err as { issues?: unknown[] }).issues));

  if (!isZodError) return false;

  const issues =
    typeof err === "object" && err !== null
      ? ((err as { issues?: Array<{ path?: unknown[]; message?: string }> })
          .issues ?? [])
      : [];

  issues.forEach((issue) => {
    const path = Array.isArray(issue.path) ? issue.path.join(".") : "";
    if (!path) return;
    setError(path, {
      type: "manual",
      message: issue.message || "Invalid value",
    });
  });

  return true;
}
