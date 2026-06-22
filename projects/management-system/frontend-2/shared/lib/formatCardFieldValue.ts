export const CARD_FIELD_MAX_LENGTH = 15;

/** Truncate grid/kanban card field text; empty values become N/A. */
export function formatCardFieldValue(
  value: string | number | null | undefined,
  maxLength: number = CARD_FIELD_MAX_LENGTH
): string {
  if (value == null || (typeof value === "string" && !value.trim())) {
    return "N/A";
  }

  const text = String(value).trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)} ... `;
}
