export enum ThemeModeEnum {
  LIGHT = 'light',
  DARK = 'dark',
  NIGHT = 'night',
  /** Follow OS light / dark preference (maps to light or dark palette, not night). */
  SYSTEM = 'system',
}

export type ThemeMode = ThemeModeEnum;

/** Palette applied to the document — `system` is resolved to light or dark. */
export type ResolvedThemeMode =
  | ThemeModeEnum.LIGHT
  | ThemeModeEnum.DARK
  | ThemeModeEnum.NIGHT;

export enum ThemeControlsAppearanceStyleEnum {
  SEGMENTED = 'segmented',
  TOGGLE = 'toggle',
}

export type ThemeControlsAppearanceStyle = ThemeControlsAppearanceStyleEnum;

export enum ThemeControlsOrientationEnum {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
}

export type ThemeControlsOrientation = ThemeControlsOrientationEnum;

export enum SurfaceVariantEnum {
  ELEVATED = 'elevated',
  PLAIN = 'plain',
}

export type SurfaceVariant = SurfaceVariantEnum;
