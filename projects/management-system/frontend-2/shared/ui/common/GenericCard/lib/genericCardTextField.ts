import { formatCardFieldValue } from "@/shared/lib";

import type { GenericCardField } from "../types";

export function genericCardTextField(
  label: string,
  value: string | number | null | undefined
): GenericCardField {
  return {
    label,
    value: formatCardFieldValue(value),
  };
}
