import {
  type ResolvedThemeMode,
  type ThemeMode,
  isResolvedThemeMode,
} from "@/lib/theme-enums";

export const CMS_THEME_MODE_STORAGE_KEY = "cms-theme-mode";
export const CMS_THEME_ACCENT_STORAGE_KEY = "cms-theme-accent";
export const LEGACY_COLOR_MODE_STORAGE_KEY = "colorMode";
export const LEGACY_ACCENT_COLOR_STORAGE_KEY = "accentColor";

/** Brand default — softer lime, less neon/pale on light backgrounds than legacy #DFFF86. */
export const CMS_BRAND_DEFAULT_ACCENT_HEX = "#c2d658";

export const CMS_ACCENT_COLORS = [
  "default",
  "blue",
  "bronze",
  "teal",
  "lime",
  "orange",
  "indigo",
  "green",
  "yellow",
  "red",
  "rose",
  "violet",
] as const;
export type CmsAccentColor = (typeof CMS_ACCENT_COLORS)[number];

export const CMS_ACCENT_HEX_BY_ID: Record<CmsAccentColor, string> = {
  default: "#48484d",
  blue: "#2563eb",
  red: "#ef4444",
  rose: "#e11d48",
  orange: "#f97316",
  green: "#22c55e",
  yellow: "#eab308",
  violet: "#8b5cf6",
  bronze: "#b45309",
  teal: "#14b8a6",
  lime: CMS_BRAND_DEFAULT_ACCENT_HEX,
  indigo: "#6366f1",
};

const CMS_ACCENT_ID_BY_HEX = new Map<string, CmsAccentColor>(
  Object.entries(CMS_ACCENT_HEX_BY_ID).map(([id, hex]) => [
    normalizeAccentHex(hex),
    id as CmsAccentColor,
  ])
);

export const CMS_DEFAULT_ACCENT: CmsAccentColor = "teal";

function normalizeAccentHex(hex: string): string {
  return hex.trim().toLowerCase();
}

export function isCmsAccentColor(value: string): value is CmsAccentColor {
  return (CMS_ACCENT_COLORS as readonly string[]).includes(value);
}

export function cmsAccentHexFromId(id: CmsAccentColor): string {
  return CMS_ACCENT_HEX_BY_ID[id];
}

export function cmsAccentIdFromHex(hex: string): CmsAccentColor {
  return (
    CMS_ACCENT_ID_BY_HEX.get(normalizeAccentHex(hex)) ?? CMS_DEFAULT_ACCENT
  );
}

/** Maps a resolved CMS palette mode to org-ui `ThemeMode` (same string values). */
export function resolvedModeToThemeMode(mode: ResolvedThemeMode): ThemeMode {
  return mode;
}

/** Copies legacy `colorMode` / `accentColor` into org-ui storage keys once. */
export function migrateLegacyThemeStorage(): void {
  if (typeof window === "undefined") return;

  if (!localStorage.getItem(CMS_THEME_MODE_STORAGE_KEY)) {
    const legacyMode = localStorage.getItem(LEGACY_COLOR_MODE_STORAGE_KEY);
    if (legacyMode && isResolvedThemeMode(legacyMode)) {
      localStorage.setItem(CMS_THEME_MODE_STORAGE_KEY, legacyMode);
    }
  }

  if (!localStorage.getItem(CMS_THEME_ACCENT_STORAGE_KEY)) {
    const legacyAccent = localStorage.getItem(LEGACY_ACCENT_COLOR_STORAGE_KEY);
    if (legacyAccent && isCmsAccentColor(legacyAccent)) {
      localStorage.setItem(
        CMS_THEME_ACCENT_STORAGE_KEY,
        cmsAccentHexFromId(legacyAccent)
      );
    }
  }
}

/**
 * Seeds org-ui storage from any legacy reader (localStorage, cookies, etc.)
 * before org-ui ThemeProvider hydrates.
 */
export function seedCmsThemeStorage(
  read: (key: string) => string | null
): void {
  if (typeof window === "undefined") return;

  migrateLegacyThemeStorage();

  if (!localStorage.getItem(CMS_THEME_MODE_STORAGE_KEY)) {
    const legacyMode = read(LEGACY_COLOR_MODE_STORAGE_KEY);
    if (legacyMode && isResolvedThemeMode(legacyMode)) {
      localStorage.setItem(CMS_THEME_MODE_STORAGE_KEY, legacyMode);
    }
  }

  if (!localStorage.getItem(CMS_THEME_ACCENT_STORAGE_KEY)) {
    const legacyAccent = read(LEGACY_ACCENT_COLOR_STORAGE_KEY);
    if (legacyAccent && isCmsAccentColor(legacyAccent)) {
      localStorage.setItem(
        CMS_THEME_ACCENT_STORAGE_KEY,
        cmsAccentHexFromId(legacyAccent)
      );
    }
  }
}
