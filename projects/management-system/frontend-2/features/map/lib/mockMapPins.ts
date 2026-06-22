/** Mock pin categories until backend is ready. */
export interface MockMapPinCategory {
  id: string;
  name: string;
  color: string;
}

/** Mock pin list item (label + category) until backend is ready. */
export interface MockMapPinListItem {
  id: string;
  label: string;
  categoryId: string;
}

export const MOCK_MAP_PIN_CATEGORIES: MockMapPinCategory[] = [
  { id: "irrigation", name: "Irrigation", color: "#3B82F6" },
  { id: "equipment", name: "Equipment", color: "#22C55E" },
  { id: "safety", name: "Safety", color: "#EF4444" },
];

export const MOCK_MAP_PIN_LIST_ITEMS: MockMapPinListItem[] = [
  { id: "1", label: "Water Source", categoryId: "irrigation" },
  { id: "2", label: "Main Valve", categoryId: "irrigation" },
  { id: "3", label: "Equipment Storage", categoryId: "equipment" },
  { id: "4", label: "Safety Inspection", categoryId: "safety" },
];

const categoryById = new Map(
  MOCK_MAP_PIN_CATEGORIES.map((c) => [c.id, c] as const)
);

export function getMockMapPinCategory(
  categoryId: string
): MockMapPinCategory | undefined {
  return categoryById.get(categoryId);
}
