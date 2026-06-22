export interface PinCategoryColorOption {
  label: string;
  value: string;
}

export const PIN_CATEGORY_COLOR_OPTIONS: PinCategoryColorOption[] = [
  { label: "Gray", value: "#6B7280" },
  { label: "Blue", value: "#3B82F6" },
  { label: "Green", value: "#22C55E" },
  { label: "Red", value: "#EF4444" },
  { label: "Orange", value: "#F97316" },
  { label: "Yellow", value: "#EAB308" },
  { label: "Pink", value: "#EC4899" },
  { label: "Purple", value: "#A855F7" },
];

export const DEFAULT_PIN_CATEGORY_COLOR = PIN_CATEGORY_COLOR_OPTIONS[0].value;

function normalizePinCategoryHex(hex: string): string {
  const trimmed = hex.trim();
  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  return withHash.toUpperCase();
}

const COLOR_LABEL_ALIASES: Record<string, string> = {
  "#808080": "Gray",
};

const colorLabelByValue = new Map(
  PIN_CATEGORY_COLOR_OPTIONS.map(
    (option) => [option.value.toUpperCase(), option.label] as const
  )
);

export function getPinCategoryColorLabel(hex: string): string {
  const normalized = normalizePinCategoryHex(hex);
  return (
    colorLabelByValue.get(normalized) ?? COLOR_LABEL_ALIASES[normalized] ?? hex
  );
}

export function arePinCategoryColorsEqual(a: string, b: string): boolean {
  return normalizePinCategoryHex(a) === normalizePinCategoryHex(b);
}

export function isValidPinCategoryColor(hex: string): boolean {
  return PIN_CATEGORY_COLOR_OPTIONS.some(
    (option) => option.value.toUpperCase() === hex.toUpperCase()
  );
}

export function canDeletePinCategory(pinCount: number | undefined): boolean {
  return (pinCount ?? 0) === 0;
}
