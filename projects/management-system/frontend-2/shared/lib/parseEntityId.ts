/** Parse a backend entity primary key (`id: number`) from route params or API values. */
export function parseEntityId(
  value: string | number | null | undefined,
  fieldName = "id"
): number {
  const parsed = tryParseEntityId(value);
  if (parsed == null) {
    if (value == null || (typeof value === "string" && value.trim() === "")) {
      throw new Error(`${fieldName} is required`);
    }
    throw new Error(`Invalid ${fieldName}`);
  }
  return parsed;
}

export function tryParseEntityId(
  value: string | number | null | undefined
): number | null {
  if (typeof value === "number") {
    return Number.isSafeInteger(value) ? value : null;
  }
  if (value == null) return null;
  const raw = value.trim();
  if (raw === "" || !/^\d+$/.test(raw)) return null;
  const parsed = Number(raw);
  return Number.isSafeInteger(parsed) ? parsed : null;
}
