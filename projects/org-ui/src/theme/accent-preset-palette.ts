/**
 * Curated accent presets for ThemeControls — distilled from CMS tokens + brand,
 * tuned as a compact, harmonious set (not every CMS swatch).
 */
export const ACCENT_PRESET_PALETTE = [
  '#d9f46e', // brand lime (Tile Design), cleaner midpoint
  '#6366f1', // indigo — CMS accent-indigo
  '#14b8a6', // teal — CMS accent-teal
  '#3b82f6', // sky-blue — CMS accent-blue family
  '#ec4899', // pink — CMS accent-rose family, softened for UI
  '#64748b', // slate — neutral that pairs with deep nights
] as const;

export type AccentPreset = (typeof ACCENT_PRESET_PALETTE)[number];
