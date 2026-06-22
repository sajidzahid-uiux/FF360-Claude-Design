/**
 * Same values as `@fieldflow360/org-ui` `ThemeModeEnum`, kept local so
 * server-safe modules do not pull the org-ui client barrel into RSC builds.
 */
export const ThemeModeEnum = {
  LIGHT: "light",
  DARK: "dark",
  NIGHT: "night",
  SYSTEM: "system",
} as const;

export type ThemeMode = (typeof ThemeModeEnum)[keyof typeof ThemeModeEnum];
export type ResolvedThemeMode =
  | typeof ThemeModeEnum.LIGHT
  | typeof ThemeModeEnum.DARK
  | typeof ThemeModeEnum.NIGHT;
export interface ThemeTransitionOptions {
  origin?: { clientX: number; clientY: number };
}

export const RESOLVED_THEME_MODES = [
  ThemeModeEnum.LIGHT,
  ThemeModeEnum.DARK,
  ThemeModeEnum.NIGHT,
] as const;

export function isResolvedThemeMode(value: string): value is ResolvedThemeMode {
  return (RESOLVED_THEME_MODES as readonly string[]).includes(value);
}

export function isLightResolvedMode(mode: ResolvedThemeMode): boolean {
  return mode === ThemeModeEnum.LIGHT;
}

export function isDarkResolvedMode(mode: ResolvedThemeMode): boolean {
  return mode === ThemeModeEnum.DARK || mode === ThemeModeEnum.NIGHT;
}

export function formatResolvedThemeModeLabel(mode: ResolvedThemeMode): string {
  return `${mode.charAt(0).toUpperCase()}${mode.slice(1)}`;
}
