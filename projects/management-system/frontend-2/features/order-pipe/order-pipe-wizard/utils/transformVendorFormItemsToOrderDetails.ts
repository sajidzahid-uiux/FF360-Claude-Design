import type { OrderPipeCategory, VendorFormItemV2 } from "@/api/types";

import type { OrderDetailsItem } from "../context";

/**
 * Resolve the option label for an item from categories (for API-loaded items that only have codes).
 * Category and type are always displayed as their codes, so only optionLabel needs resolving.
 */
export function getItemDisplayLabels(
  item: { pipe_type: string; sub_type?: string; size: string },
  categories: OrderPipeCategory[]
): { optionLabel: string } {
  const category = categories.find((c) => c.code === item.pipe_type);

  const hasTypes = (category?.types?.length ?? 0) > 0;
  const type = category?.types?.find((t) => t.code === item.sub_type);

  const options = hasTypes ? (type?.options ?? []) : (category?.options ?? []);
  const option = options.find((o) => o.value === item.size);
  const optionLabel = option?.label ?? `${item.size}″`;

  return { optionLabel };
}

/**
 * Parse item_key (e.g. "S-8" or "C-I-8") into pipe_type, optional sub_type, and size.
 */
function parseItemKey(
  itemKey: string,
  fallbackSize: string
): { pipe_type: string; sub_type?: string; size: string } {
  const parts = itemKey.split("-").filter(Boolean);
  if (parts.length >= 3) {
    return {
      pipe_type: parts[0],
      sub_type: parts[1],
      size: parts.slice(2).join("-") || fallbackSize,
    };
  }
  if (parts.length === 2) {
    return { pipe_type: parts[0], size: parts[1] };
  }
  if (parts.length === 1) {
    return { pipe_type: parts[0], size: fallbackSize };
  }
  return { pipe_type: itemKey, size: fallbackSize };
}

/**
 * Resolve the option label from item_key and size using order pipe categories.
 */
export function getDisplayLabelsForItemKey(
  itemKey: string,
  size: string,
  categories: OrderPipeCategory[] | null | undefined
): { optionLabel: string } {
  if (!categories?.length) {
    return { optionLabel: `${size}″` };
  }
  const parsed = parseItemKey(itemKey, size);
  return getItemDisplayLabels(parsed, categories);
}

/**
 * Transforms vendor form items from the API (pipe_type, sub_type, size, quantity)
 * to OrderDetailsItem[] for the order details context / table.
 * When categories are provided, resolves categoryName, typeName, optionLabel from the categories tree.
 */
export function vendorFormItemsToOrderDetailsItems(
  items: VendorFormItemV2[] | null | undefined,
  categories?: OrderPipeCategory[] | null
): OrderDetailsItem[] {
  if (!items || !Array.isArray(items)) return [];
  const hasCategories = categories && categories.length > 0;

  return items.map((item) => {
    const base = {
      pipe_type: item.pipe_type,
      ...(item.sub_type != null && item.sub_type !== ""
        ? { sub_type: item.sub_type }
        : {}),
      size: String(item.size),
      quantity: Number(item.quantity),
    };
    if (hasCategories) {
      const { optionLabel } = getItemDisplayLabels(
        {
          pipe_type: item.pipe_type,
          sub_type: item.sub_type,
          size: String(item.size),
        },
        categories
      );
      return { ...base, optionLabel } as OrderDetailsItem;
    }
    return base as OrderDetailsItem;
  });
}
