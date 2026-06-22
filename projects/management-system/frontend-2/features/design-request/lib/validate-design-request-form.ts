import type {
  DesignParametersFormValues,
  DesignRequestFormValues,
  LineTypeKey,
} from "./constants";
import {
  DESIGN_REQUEST_NOTE_ALLOWED_EXTENSIONS,
  DESIGN_REQUEST_NOTE_FILE_MAX_BYTES,
  LINE_TYPE_TABS,
} from "./constants";
import {
  ORG_SPACING_MAX_DIGITS,
  REQUEST_SPACING_MAX_DIGITS,
  validateLineTypeParams,
  validateSpacingValue,
} from "./design-parameters-validation";
import { formatMaxFileSize } from "./format-max-file-size";

export type DesignParametersFormErrors = Partial<
  Record<keyof DesignParametersFormValues, string>
> & {
  lineTypes?: Partial<
    Record<LineTypeKey, ReturnType<typeof validateLineTypeParams>>
  >;
};

export type DesignRequestFormErrors = DesignParametersFormErrors;

export function validateDesignParametersForm(
  values: DesignParametersFormValues,
  mode: "required" | "partial",
  spacingMaxDigits: number = ORG_SPACING_MAX_DIGITS
): { ok: true } | { ok: false; errors: DesignParametersFormErrors } {
  const errors: DesignParametersFormErrors = {};
  const lineTypes: DesignParametersFormErrors["lineTypes"] = {};
  let hasLineTypeErrors = false;

  for (const tab of LINE_TYPE_TABS) {
    const typeErrors = validateLineTypeParams(values[tab.id], mode);
    if (Object.keys(typeErrors).length > 0) {
      lineTypes[tab.id] = typeErrors;
      hasLineTypeErrors = true;
    }
  }

  if (hasLineTypeErrors) {
    errors.lineTypes = lineTypes;
  }

  const spacingError = validateSpacingValue(
    values.spacing,
    mode === "required",
    spacingMaxDigits
  );
  if (spacingError) {
    errors.spacing = spacingError;
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true };
}

export function validateDesignRequestForm(
  values: DesignRequestFormValues
): { ok: true } | { ok: false; errors: DesignRequestFormErrors } {
  const base = validateDesignParametersForm(
    values,
    "required",
    REQUEST_SPACING_MAX_DIGITS
  );
  if (!base.ok) {
    return base;
  }

  const errors: DesignRequestFormErrors = {};

  if (!values.direction) {
    errors.direction = "Direction is required";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true };
}

function getFileExtension(fileName: string): string {
  const index = fileName.lastIndexOf(".");
  if (index < 0) return "";
  return fileName.slice(index).toLowerCase();
}

export function validateSubmitFiles(
  files: File[],
  allowedExtensions: readonly string[],
  maxBytes: number
): string | null {
  for (const file of files) {
    if (file.size > maxBytes) {
      return `File "${file.name}" exceeds the maximum size of ${formatMaxFileSize(maxBytes)}.`;
    }
    const ext = getFileExtension(file.name);
    if (!allowedExtensions.includes(ext)) {
      return `File type not allowed: ${file.name}`;
    }
  }
  return null;
}

export function validateNoteInput(
  body: string,
  file: File | null
): string | null {
  if (!body.trim() && !file) {
    return "A note must have either text or a file attachment.";
  }
  if (file) {
    return validateSubmitFiles(
      [file],
      DESIGN_REQUEST_NOTE_ALLOWED_EXTENSIONS,
      DESIGN_REQUEST_NOTE_FILE_MAX_BYTES
    );
  }
  return null;
}
