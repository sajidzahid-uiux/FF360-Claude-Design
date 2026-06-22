import { ApiError } from "@/api/client";

const DUPLICATE_ACTIVE_MESSAGE =
  "An active design request already exists for this job or lead.";

export function getDesignRequestSubmitErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const fieldErrors = err.getFieldErrors();
    const nonField = fieldErrors.non_field_errors?.[0];
    if (nonField) return nonField;
    const filesError = fieldErrors.files?.[0];
    if (filesError) return filesError;
    if (err.status === 403) {
      return "You do not have permission to send design requests.";
    }
    return err.getUserMessage();
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return "Failed to send design request. Please try again.";
}

export function isDuplicateActiveDesignRequestError(err: unknown): boolean {
  if (!(err instanceof ApiError)) return false;
  const message = getDesignRequestSubmitErrorMessage(err).toLowerCase();
  return (
    message.includes("active design request") ||
    message.includes(DUPLICATE_ACTIVE_MESSAGE.toLowerCase())
  );
}

export function isDesignRequestApiUnreachable(err: unknown): boolean {
  if (!(err instanceof ApiError)) return false;
  return err.status === 0 || err.status >= 500;
}
