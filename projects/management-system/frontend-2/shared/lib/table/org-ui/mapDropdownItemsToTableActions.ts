import type { ReactNode } from "react";

import type { TableAction } from "@fieldflow360/org-ui";

import type { DropdownItem } from "@/shared/ui/common/Dropdown";

export type DropdownActionItem = Extract<DropdownItem, { type?: "item" }>;

export function isDropdownActionItem(
  item: DropdownItem
): item is DropdownActionItem {
  return item.type !== "separator" && item.type !== "header";
}

function dropdownActionLabel(label: DropdownActionItem["label"]): string {
  return typeof label === "string" ? label : "";
}

export function mapDropdownItemsToTableActions<T>({
  items,
  iconByKey,
}: {
  items: DropdownItem[];
  iconByKey?: Record<string, ReactNode>;
}): TableAction<T>[] {
  return items.filter(isDropdownActionItem).map((item) => ({
    label: dropdownActionLabel(item.label),
    icon: iconByKey?.[item.id] ?? item.icon,
    variant: item.destructive ? "danger" : "default",
    onClick: () => {
      item.onSelect?.(new Event("click"));
    },
  }));
}
