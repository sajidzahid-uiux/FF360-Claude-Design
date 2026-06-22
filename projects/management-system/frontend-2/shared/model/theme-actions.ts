import type { ThemeMode, ThemeTransitionOptions } from "@/lib/theme-enums";

export type ThemeActions = {
  setMode: (mode: ThemeMode, options?: ThemeTransitionOptions) => void;
  toggleMode: (options?: ThemeTransitionOptions) => void;
  setAccentColor: (hex: string) => void;
};

let themeActions: ThemeActions | null = null;

export function registerThemeActions(actions: ThemeActions): void {
  themeActions = actions;
}

export function unregisterThemeActions(): void {
  themeActions = null;
}

export function getThemeActions(): ThemeActions | null {
  return themeActions;
}
