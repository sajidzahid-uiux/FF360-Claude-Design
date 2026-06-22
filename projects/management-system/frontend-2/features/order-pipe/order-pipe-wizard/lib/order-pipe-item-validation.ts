export interface OrderPipeItemDraft {
  categoryCode: string;
  typeCode: string;
  optionValue: string;
  quantity: string;
  hasTypes: boolean;
}

export interface OrderPipeItemPayload {
  pipe_type: string;
  sub_type?: string;
  size: string;
  quantity: number;
}

export function validateOrderPipeItemDraft(
  draft: OrderPipeItemDraft
): string | null {
  if (!draft.categoryCode.trim()) {
    return "Select a pipe category.";
  }

  if (draft.hasTypes && !draft.typeCode.trim()) {
    return "Select a pipe type.";
  }

  if (!draft.optionValue.trim()) {
    return "Select a pipe size/option.";
  }

  const qty = Number.parseInt(draft.quantity, 10);
  if (Number.isNaN(qty) || qty < 1) {
    return "Quantity must be at least 1.";
  }

  return null;
}

export function buildOrderPipeItemPayload(
  draft: OrderPipeItemDraft
): OrderPipeItemPayload | null {
  const error = validateOrderPipeItemDraft(draft);
  if (error) return null;

  const qty = Number.parseInt(draft.quantity, 10);

  return {
    pipe_type: draft.categoryCode,
    ...(draft.hasTypes && draft.typeCode.trim()
      ? { sub_type: draft.typeCode }
      : {}),
    size: draft.optionValue,
    quantity: qty,
  };
}

export function validateOrderPipeItemsPayload(
  items: OrderPipeItemPayload[]
): string | null {
  if (items.length === 0) {
    return "Add at least one order item.";
  }

  for (const [index, item] of items.entries()) {
    if (!item.pipe_type?.trim()) {
      return `Item ${index + 1}: pipe category is required.`;
    }
    if (!item.size?.trim()) {
      return `Item ${index + 1}: size is required.`;
    }
    if (!Number.isFinite(item.quantity) || item.quantity < 1) {
      return `Item ${index + 1}: quantity must be at least 1.`;
    }
  }

  return null;
}
