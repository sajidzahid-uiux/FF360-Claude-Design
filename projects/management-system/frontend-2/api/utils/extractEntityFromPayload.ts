export type WithId = { id: unknown };

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function hasId(value: unknown): value is WithId {
  return isObject(value) && "id" in value;
}

/**
 * Normalizes create-entity API responses: bare entity, `{ data: entity }`, or `{ data: entity[] }`.
 */
export function extractEntityFromPayload<T extends WithId>(
  payload: unknown,
  entityName: string
): T {
  if (hasId(payload)) {
    return payload as T;
  }

  if (isObject(payload) && "data" in payload) {
    const nested = (payload as { data?: unknown }).data;

    if (Array.isArray(nested)) {
      const first = nested[0];
      if (hasId(first)) {
        return first as T;
      }
    } else if (hasId(nested)) {
      return nested as T;
    }
  }

  throw new Error(`Invalid create ${entityName} response shape`);
}
