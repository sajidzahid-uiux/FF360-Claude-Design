import { ACCENT_PRESET_PALETTE, colors } from '../../../theme';

const brandAccentLower = colors.accent.toLowerCase();

/** Brand first, then curated presets (no duplicate if palette matches `colors.accent`). */
export const DEFAULT_ACCENT_PRESETS = [
  colors.accent,
  ...ACCENT_PRESET_PALETTE.filter((hex) => hex.toLowerCase() !== brandAccentLower),
] as const;

export function normalizeHexForColorInput(value: string): string {
  if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
    return value;
  }
  return colors.accent;
}

export function parseHexInput(input: string): string | null {
  const t = input.trim();
  if (/^#[0-9A-Fa-f]{6}$/i.test(t)) {
    return t.toLowerCase();
  }
  if (/^#[0-9A-Fa-f]{3}$/i.test(t)) {
    const r = t[1]!;
    const g = t[2]!;
    const b = t[3]!;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return null;
}
