import { tokens as designTokens } from "./tokens";

export { ACCENT_PRESET_PALETTE } from "./accent-preset-palette";
export type { AccentPreset } from "./accent-preset-palette";

export { colors } from "./colors";
export type { Colors } from "./colors";

export { tokens } from "./tokens";
export type { Tokens } from "./tokens";

export { darkTheme, lightTheme, nightTheme } from "./themes";
export type { Theme } from "./themes";
export { ThemeModeEnum } from "../constants";
export type { ResolvedThemeMode, ThemeMode } from "../constants";

export { resolveThemeMode, ThemeProvider, useTheme } from "./ThemeProvider";
export type { ThemeProviderProps, ThemeTransitionOptions } from "./ThemeProvider";

export const theme = {
  get colors() {
    return designTokens.colors;
  },
};
