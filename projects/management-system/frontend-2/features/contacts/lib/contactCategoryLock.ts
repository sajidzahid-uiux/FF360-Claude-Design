import type { ContactCategory } from "@/api/types";

import { CLIENT_CONTACT_CATEGORY_NAME } from "../model/constants";

export function getLockedClientContactCategoryIds(
  categories: Pick<ContactCategory, "id" | "name">[]
): number[] {
  const clientCategory = categories.find(
    (category) =>
      category.name.toLowerCase() === CLIENT_CONTACT_CATEGORY_NAME.toLowerCase()
  );

  return clientCategory ? [clientCategory.id] : [];
}

export function ensureLockedCategoryIds(
  categoryIds: number[],
  lockedCategoryIds: number[]
): number[] {
  if (lockedCategoryIds.length === 0) return categoryIds;

  const merged = new Set([...categoryIds, ...lockedCategoryIds]);
  return Array.from(merged);
}
