import { SortOrder } from "@/constants/enums";

import type { SortDirection } from "../presets/types";

/**
 * Converts SortDirection string to SortOrder enum
 */
export function directionToSortOrder(
  direction: SortDirection
): SortOrder | null {
  if (direction === "asc") return SortOrder.ASC;
  if (direction === "desc") return SortOrder.DESC;
  return null;
}

/**
 * Creates a sort change handler that converts between SortDirection and SortOrder.
 * This is used when the backend expects SortOrder enum but the UI uses SortDirection strings.
 *
 * @param onSortChange - Callback that receives (sortBy: string, sortOrder: SortOrder | null)
 * @returns Handler that receives (sortBy: string, direction: SortDirection)
 */
export function createSortChangeHandler(
  onSortChange?: (sortBy: string, sortOrder: SortOrder | null) => void
): ((sortBy: string, direction: SortDirection) => void) | undefined {
  if (!onSortChange) return undefined;

  return (sortBy: string, direction: SortDirection) => {
    const sortOrder = directionToSortOrder(direction);
    onSortChange(sortBy, sortOrder);
  };
}

/**
 * Creates a sort change handler for a specific sortBy field.
 * This is a convenience function to avoid repeating the sortBy value.
 *
 * @param sortBy - The field name to sort by
 * @param onSortChange - Callback that receives (sortBy: string, sortOrder: SortOrder | null)
 * @returns Handler that receives (sortBy: string, direction: SortDirection)
 */
export function createSortHandlerForField(
  sortBy: string,
  onSortChange?: (sortBy: string, sortOrder: SortOrder | null) => void
): ((sortBy: string, direction: SortDirection) => void) | undefined {
  const handler = createSortChangeHandler(onSortChange);
  if (!handler) return undefined;

  return (_sortBy: string, direction: SortDirection) => {
    handler(sortBy, direction);
  };
}
