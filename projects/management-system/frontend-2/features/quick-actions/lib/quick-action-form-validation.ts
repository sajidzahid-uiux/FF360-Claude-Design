import type { QuickActionFormValues } from "@/features/quick-actions/model/quickActionForm";
import {
  validateEmail,
  validatePhone,
} from "@/utils/validation/contactValidation";

export function validateQuickActionFormFields(
  values: QuickActionFormValues
): Record<string, string> {
  const errors: Record<string, string> = {};

  const phoneError = validatePhone(values.phone_number);
  if (phoneError) {
    errors.phone_number = phoneError;
  }

  const emailError = validateEmail(values.email);
  if (emailError) {
    errors.email = emailError;
  }

  return errors;
}

export function hasQuickActionFormContent(
  values: QuickActionFormValues,
  keptExistingFileCount = 0
): boolean {
  return Boolean(
    values.name.trim() ||
    values.phone_number.trim() ||
    values.email.trim() ||
    values.description.trim() ||
    values.files.length > 0 ||
    keptExistingFileCount > 0
  );
}

export function isQuickActionFormSubmittable(
  values: QuickActionFormValues,
  keptExistingFileCount = 0
): boolean {
  if (!hasQuickActionFormContent(values, keptExistingFileCount)) {
    return false;
  }
  return Object.keys(validateQuickActionFormFields(values)).length === 0;
}
