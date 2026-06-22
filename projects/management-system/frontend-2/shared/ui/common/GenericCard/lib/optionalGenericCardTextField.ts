import type { GenericCardField } from "../types";
import { genericCardTextField } from "./genericCardTextField";

export function hasCardFieldValue(
  value: string | number | null | undefined
): boolean {
  if (value == null) return false;
  return String(value).trim() !== "";
}

export function optionalGenericCardTextField(
  label: string,
  value: string | number | null | undefined
): GenericCardField | null {
  if (!hasCardFieldValue(value)) return null;
  return genericCardTextField(label, value);
}
