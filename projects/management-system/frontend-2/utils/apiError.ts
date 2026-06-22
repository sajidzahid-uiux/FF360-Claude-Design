import { AxiosError } from "axios";

// ============================================================
// Types
// ============================================================

export interface ApiErrorResponse {
  error?: string | { message?: string; details?: Record<string, string[]> };
  detail?: string;
  message?: string;
  non_field_errors?: string[];
  email?: string[];
  role_id?: string[];
}

type SimpleApiError = {
  response?: {
    data?: {
      error?: { message?: string } | string;
      message?: string;
      detail?: string;
    };
  };
  message?: string;
};

type UnknownRecord = Record<string, unknown>;

// ============================================================
// Helpers
// ============================================================

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function getNestedValue(root: unknown, path: string[]): unknown {
  let current: unknown = root;
  for (const key of path) {
    if (!isRecord(current)) return undefined;
    current = current[key];
  }
  return current;
}

function isDuplicateError(errorMessage: string): boolean {
  const duplicateKeywords = [
    "already exists",
    "duplicate",
    "unique",
    "taken",
    "already in use",
    "phone number already",
    "contact with this phone",
    "integrity",
    "constraint",
    "violation",
    "unique constraint",
    "duplicate key",
    "already registered",
    "phone already",
    "number already",
    "email already",
    "contact with this email",
    "exists in contacts",
    "contact exists",
  ];
  const lower = errorMessage.toLowerCase();
  return duplicateKeywords.some((kw) => lower.includes(kw));
}

function getDuplicateErrorMessage(errorMessage: string): string {
  const lower = errorMessage.toLowerCase();
  if (lower.includes("email")) {
    return "A contact with this email address already exists. Please use a different email or check the Contact page for existing contacts.";
  }
  if (lower.includes("phone")) {
    return "A contact with this phone number already exists. Please use a different phone number or check the Contact page for existing contacts.";
  }
  return "This value already exists. Please use a different value or check the Contact page for existing contacts.";
}

function isPhoneNumberField(fieldName: string): boolean {
  return (
    fieldName === "customer_phone_number" ||
    fieldName === "phone_number" ||
    fieldName === "home_phone_number"
  );
}

function isEmailField(fieldName: string): boolean {
  return fieldName === "email";
}

function getFieldDisplayName(fieldName: string): string {
  const fieldMap: Record<string, string> = {
    customer_phone_number: "Phone Number",
    phone_number: "Phone Number",
    email: "Email",
    title: "Customer Name",
    description: "Description",
    lead_type: "Lead Source",
    job_type: "Job Type",
    po_number: "PO Number",
    lead_status: "Lead Status",
    job_status: "Job Status",
    latitude: "Latitude",
    longitude: "Longitude",
    vertices: "Location Boundary",
    equipments: "Equipment",
    designers: "Designers",
    crew: "Crew",
    acers: "Acres",
  };
  return (
    fieldMap[fieldName] ||
    fieldName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  );
}

export function extractApiErrorPayload(
  error: unknown
): Record<string, unknown> | null {
  const rawData =
    getNestedValue(error, ["response", "data"]) ??
    getNestedValue(error, ["originalError", "response", "data"]) ??
    getNestedValue(error, ["data"]);

  if (!isRecord(rawData)) return null;

  const nestedError = rawData.error;
  return isRecord(nestedError) ? nestedError : rawData;
}

export const NOTE_MENTION_SECTION_ACCESS_ERROR =
  "This member cannot access this note section.";

function isNoteSectionMentionAccessError(message: string): boolean {
  return message.toLowerCase().includes("cannot access this note section");
}

function getMentionNoteSectionErrorMessage(
  payload: Record<string, unknown>
): string | null {
  const raw = payload.mentioned_members;
  const candidates: string[] = [];
  if (Array.isArray(raw)) {
    raw.forEach((entry) => candidates.push(String(entry)));
  } else if (typeof raw === "string") {
    candidates.push(raw);
  }
  if (candidates.some(isNoteSectionMentionAccessError)) {
    return NOTE_MENTION_SECTION_ACCESS_ERROR;
  }
  return null;
}

function formatFieldErrorMessage(fieldName: string, msg: string): string {
  if (
    fieldName === "mentioned_members" ||
    isNoteSectionMentionAccessError(msg)
  ) {
    return NOTE_MENTION_SECTION_ACCESS_ERROR;
  }
  if (isDuplicateError(msg)) {
    if (isPhoneNumberField(fieldName)) {
      return "A contact with this phone number already exists. Please use a different phone number or check the Contact page for existing contacts.";
    }
    if (isEmailField(fieldName)) {
      return "A contact with this email address already exists. Please use a different email or check the Contact page for existing contacts.";
    }
    return `${getFieldDisplayName(fieldName)}: This value already exists. Please use a different value.`;
  }
  return `${getFieldDisplayName(fieldName)}: ${msg}`;
}

// ============================================================
// Public API
// ============================================================

/**
 * Extracts a user-friendly error message from any API error object.
 * Handles nested error shapes, field errors, duplicate-entry detection,
 * and 500 server errors.
 */
export function getErrorMessage(
  error: unknown,
  defaultMessage = "Operation failed"
): string {
  if (!error || typeof error !== "object") return defaultMessage;

  const err = error as {
    response?: { status?: number; data?: Record<string, unknown> };
    message?: string;
    status?: number;
  };

  // Check the raw error message first for duplicate indicators
  if (err.message && isDuplicateError(err.message)) {
    return getDuplicateErrorMessage(err.message);
  }

  const payload = extractApiErrorPayload(error);
  if (payload) {
    const payloadStr = JSON.stringify(payload).toLowerCase();
    if (
      payloadStr.includes("does not belong to any selected client") ||
      payloadStr.includes("primary farm must be included in farm_ids")
    ) {
      return "Before deleting this client, change the farm primary to another contact.";
    }
    const mentionError = getMentionNoteSectionErrorMessage(payload);
    if (mentionError) return mentionError;
  }

  const data = (err.response?.data ?? payload) as
    | Record<string, unknown>
    | undefined;

  if (!data) {
    if (
      err.message &&
      err.message !== "An unexpected error occurred" &&
      err.message !== defaultMessage
    ) {
      return err.message;
    }
    return defaultMessage;
  }

  // { error: { message, details } }  — VendorForm / nested shape
  const errorField = data.error;
  if (
    errorField &&
    typeof errorField === "object" &&
    !Array.isArray(errorField)
  ) {
    const nested = errorField as {
      message?: string;
      details?: Record<string, string[]>;
    };
    if (nested.message) {
      const detailStr = nested.details
        ? typeof nested.details === "string"
          ? nested.details
          : Object.entries(nested.details)
              .flatMap(([k, v]) =>
                (Array.isArray(v) ? v : [v]).map((m) => `${k}: ${m}`)
              )
              .join("; ")
        : "";
      const msg = detailStr
        ? `${nested.message} — ${detailStr}`
        : nested.message;
      return isDuplicateError(msg) ? getDuplicateErrorMessage(msg) : msg;
    }
  }

  // { error: "string" }
  if (typeof errorField === "string" && errorField.length > 0) {
    return isDuplicateError(errorField)
      ? getDuplicateErrorMessage(errorField)
      : errorField;
  }

  // { non_field_errors: ["..."] }
  const nonFieldErrors = data.non_field_errors;
  if (Array.isArray(nonFieldErrors) && nonFieldErrors.length > 0) {
    const msg = nonFieldErrors[0] as string;
    return isDuplicateError(msg) ? getDuplicateErrorMessage(msg) : msg;
  }

  // { message: "..." }
  if (typeof data.message === "string" && data.message.length > 0) {
    return isDuplicateError(data.message)
      ? getDuplicateErrorMessage(data.message)
      : data.message;
  }

  // { detail: "..." }
  if (typeof data.detail === "string" && data.detail.length > 0) {
    return isDuplicateError(data.detail)
      ? getDuplicateErrorMessage(data.detail)
      : data.detail;
  }

  // Field array errors: { fieldName: ["error msg"] }
  const arrayFieldErrors = Object.entries(data).filter(
    ([, v]) => Array.isArray(v) && (v as unknown[]).length > 0
  );
  if (arrayFieldErrors.length > 0) {
    const [fieldName, errors] = arrayFieldErrors[0];
    const msg = (errors as string[])[0];
    return formatFieldErrorMessage(fieldName, msg);
  }

  // Field string errors: { fieldName: "error msg" }
  const stringFieldErrors = Object.entries(data).filter(
    ([k, v]) =>
      typeof v === "string" &&
      (v as string).length > 0 &&
      k !== "message" &&
      k !== "detail"
  );
  if (stringFieldErrors.length > 0) {
    const [fieldName, msg] = stringFieldErrors[0];
    return formatFieldErrorMessage(fieldName, msg as string);
  }

  if (
    err.message === "An unexpected error occurred" &&
    payload &&
    Object.keys(payload).length > 0
  ) {
    return defaultMessage;
  }

  // 500 fallback
  const status = err.response?.status ?? err.status;
  if (status === 500) {
    const raw = JSON.stringify(data).toLowerCase();
    if (isDuplicateError(raw)) return getDuplicateErrorMessage(raw);
    return "Server error occurred. Please try again or contact support if the problem persists.";
  }

  if (err.message && err.message !== "An unexpected error occurred") {
    return err.message;
  }

  return defaultMessage;
}

/**
 * Variant that accepts a typed AxiosError — useful when the error type is known.
 */
export function parseAxiosErrorMessage(
  error: AxiosError<ApiErrorResponse>,
  defaultMessage: string
): string {
  return getErrorMessage(error, defaultMessage);
}

/**
 * Lightweight extraction — fast path for simple error shapes.
 */
export function getSimpleErrorMessage(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  const err = error as SimpleApiError;
  const data = err.response?.data;

  if (data && typeof data === "object") {
    const dataStr = JSON.stringify(data).toLowerCase();
    if (
      dataStr.includes("does not belong to any selected client") ||
      dataStr.includes("primary farm must be included in farm_ids")
    ) {
      return "Before deleting this client, change the farm primary to another contact.";
    }
  }

  if (typeof data?.error === "string") return data.error;
  if (typeof data?.error === "object" && data.error?.message)
    return data.error.message;
  if (data?.message) return data.message;
  if (data?.detail) return data.detail;

  if (data && typeof data === "object") {
    for (const value of Object.values(data)) {
      if (
        Array.isArray(value) &&
        value.length > 0 &&
        typeof value[0] === "string"
      ) {
        const msg = value[0];
        return msg.replace(
          /^Member \d+ cannot access/i,
          "A mentioned user cannot access"
        );
      }
    }
  }

  const msg = err.message;
  if (msg && /request failed with status code/i.test(msg)) {
    return undefined;
  }

  return msg;
}

export function isApiForbiddenError(error: unknown): boolean {
  return getHttpErrorStatus(error) === 403;
}

/** HTTP status from Axios-style errors; undefined when not available. */
export function getHttpErrorStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  const response = (error as { response?: { status?: number } }).response;
  return typeof response?.status === "number" ? response.status : undefined;
}
