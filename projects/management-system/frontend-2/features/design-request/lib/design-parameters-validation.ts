import type { LineTypeParamsFormFields } from "./constants";

export const DEPTH_MIN_FEET = 0.1;
export const DEPTH_MAX_FEET = 20;
export const DEPTH_MIN_RANGE_FEET = 0.5;
export const MIN_SLOPE_PERCENT = 0.05;
export const MAX_SLOPE_PERCENT = 5;
export const MIN_OUTLET_DISTANCE_FEET = 0;
export const SPACING_DECIMAL_PLACES = 2;
export const ORG_SPACING_MAX_DIGITS = 8;
export const REQUEST_SPACING_MAX_DIGITS = 10;

export function spacingMaxValue(maxDigits: number): number {
  const integerDigits = maxDigits - SPACING_DECIMAL_PLACES;
  return Number(
    `${"9".repeat(integerDigits)}.${"9".repeat(SPACING_DECIMAL_PLACES)}`
  );
}

export function parseNumericInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const num = Number(trimmed.replace(",", "."));
  return Number.isFinite(num) ? num : null;
}

export function sanitizeSpacingInput(value: string): string {
  const normalized = value.replace(",", ".");
  if (!normalized) return "";
  const match = normalized.match(/^\d*\.?\d{0,2}/);
  return match?.[0] ?? "";
}

export function sanitizeNumericInput(value: string): string {
  return value.replace(/[^\d.,]/g, "");
}

export type LineTypeParamsFormErrors = Partial<LineTypeParamsFormFields>;

export type LineTypeValidationMode = "required" | "partial";

function validateDepthValue(
  raw: string,
  required: boolean
): string | undefined {
  if (!raw.trim()) {
    return required ? "Required" : undefined;
  }
  const num = parseNumericInput(raw);
  if (num == null || num < DEPTH_MIN_FEET || num > DEPTH_MAX_FEET) {
    return `Must be between ${DEPTH_MIN_FEET} and ${DEPTH_MAX_FEET} ft`;
  }
  return undefined;
}

function validateSlopeValue(
  raw: string,
  required: boolean
): string | undefined {
  if (!raw.trim()) {
    return required ? "Required" : undefined;
  }
  const num = parseNumericInput(raw);
  if (num == null || num < MIN_SLOPE_PERCENT) {
    return `Must be at least ${MIN_SLOPE_PERCENT}%`;
  }
  if (num > MAX_SLOPE_PERCENT) {
    return `Must be at most ${MAX_SLOPE_PERCENT}%`;
  }
  return undefined;
}

function validateOutletValue(
  raw: string,
  required: boolean
): string | undefined {
  if (!raw.trim()) {
    return required ? "Required" : undefined;
  }
  const num = parseNumericInput(raw);
  if (num == null || num < MIN_OUTLET_DISTANCE_FEET) {
    return "Must be 0 or greater";
  }
  return undefined;
}

export function validateLineTypeParams(
  fields: LineTypeParamsFormFields,
  mode: LineTypeValidationMode
): LineTypeParamsFormErrors {
  const required = mode === "required";
  const errors: LineTypeParamsFormErrors = {};

  const minError = validateDepthValue(fields.min_depth, required);
  const optimalError = validateDepthValue(fields.optimal_depth, required);
  const maxError = validateDepthValue(fields.max_depth, required);
  const slopeError = validateSlopeValue(fields.min_slope, required);
  const outletError = validateOutletValue(
    fields.outlet_to_optimal_distance,
    required
  );

  if (minError) errors.min_depth = minError;
  if (optimalError) errors.optimal_depth = optimalError;
  if (maxError) errors.max_depth = maxError;
  if (slopeError) errors.min_slope = slopeError;
  if (outletError) errors.outlet_to_optimal_distance = outletError;

  const min = parseNumericInput(fields.min_depth);
  const optimal = parseNumericInput(fields.optimal_depth);
  const max = parseNumericInput(fields.max_depth);

  if (min != null && optimal != null && min >= optimal) {
    errors.optimal_depth = "Must be greater than minimum depth";
  }
  if (optimal != null && max != null && optimal >= max) {
    errors.optimal_depth =
      errors.optimal_depth ?? "Must be less than maximum depth";
    errors.max_depth = errors.max_depth ?? "Must be greater than optimal depth";
  }
  if (min != null && max != null && max - min < DEPTH_MIN_RANGE_FEET) {
    errors.max_depth =
      errors.max_depth ??
      `Depth range must be at least ${DEPTH_MIN_RANGE_FEET} ft`;
  }

  return errors;
}

export function validateSpacingValue(
  raw: string,
  required: boolean,
  maxDigits: number = ORG_SPACING_MAX_DIGITS
): string | undefined {
  if (!raw.trim()) {
    return required ? "Required" : undefined;
  }
  const num = parseNumericInput(raw);
  if (num == null || num < 0) {
    return "Must be a valid number";
  }
  if (num > spacingMaxValue(maxDigits)) {
    return "Value is too large";
  }
  const [whole = "", fraction = ""] = raw.trim().replace(",", ".").split(".");
  const integerDigits = maxDigits - SPACING_DECIMAL_PLACES;
  if (whole.length > integerDigits) {
    return "Value is too large";
  }
  if (fraction.length > SPACING_DECIMAL_PLACES) {
    return `At most ${SPACING_DECIMAL_PLACES} decimal places`;
  }
  return undefined;
}

export function formatSpacingForApi(
  value: string,
  maxDigits: number = ORG_SPACING_MAX_DIGITS
): number | null {
  if (!value.trim()) return null;
  const num = parseNumericInput(value);
  if (num == null || num < 0) return null;
  const factor = 10 ** SPACING_DECIMAL_PLACES;
  const rounded = Math.round(num * factor) / factor;
  const error = validateSpacingValue(String(rounded), false, maxDigits);
  if (error) return null;
  return rounded;
}
