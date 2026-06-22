"use client";

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

import {
  CMS_DEFAULT_ACCENT,
  type CmsAccentColor,
  cmsAccentHexFromId,
} from "@/lib/cms-theme";
import {
  RESOLVED_THEME_MODES,
  type ResolvedThemeMode,
  type ThemeMode,
  ThemeModeEnum,
  type ThemeTransitionOptions,
} from "@/lib/theme-enums";

import { getThemeActions } from "./theme-actions";

export interface UserSettingsAppearance {
  mode: ThemeMode;
  resolvedMode: ResolvedThemeMode;
  accentColor: string;
  accentId: CmsAccentColor;
}

interface UserSettingsState extends UserSettingsAppearance {
  setAppearance: (patch: Partial<UserSettingsAppearance>) => void;
  setMode: (mode: ThemeMode, options?: ThemeTransitionOptions) => void;
  toggleMode: (options?: ThemeTransitionOptions) => void;
  cycleResolvedMode: () => void;
  setAccentColor: (hex: string) => void;
  setAccentId: (id: CmsAccentColor) => void;
}

const initialAppearance: UserSettingsAppearance = {
  mode: ThemeModeEnum.LIGHT,
  resolvedMode: ThemeModeEnum.LIGHT,
  accentColor: cmsAccentHexFromId(CMS_DEFAULT_ACCENT),
  accentId: CMS_DEFAULT_ACCENT,
};

export const useUserSettingsStore = create<UserSettingsState>((set, get) => ({
  ...initialAppearance,

  setAppearance: (patch) => set((state) => ({ ...state, ...patch })),

  setMode: (mode, options) => {
    getThemeActions()?.setMode(mode, options);
  },

  toggleMode: (options) => {
    getThemeActions()?.toggleMode(options);
  },

  cycleResolvedMode: () => {
    const { resolvedMode } = get();
    const index = RESOLVED_THEME_MODES.indexOf(resolvedMode);
    const next =
      RESOLVED_THEME_MODES[(index + 1) % RESOLVED_THEME_MODES.length] ??
      ThemeModeEnum.LIGHT;
    getThemeActions()?.setMode(next as ResolvedThemeMode);
  },

  setAccentColor: (hex) => {
    getThemeActions()?.setAccentColor(hex);
  },

  setAccentId: (id) => {
    getThemeActions()?.setAccentColor(cmsAccentHexFromId(id));
  },
}));

export function useUserSettingsAppearance() {
  return useUserSettingsStore(
    useShallow((state) => ({
      mode: state.mode,
      resolvedMode: state.resolvedMode,
      accentColor: state.accentColor,
      accentId: state.accentId,
    }))
  );
}

export function useResolvedThemeMode(): ResolvedThemeMode {
  return useUserSettingsStore((state) => state.resolvedMode);
}

export function useThemeMode(): ThemeMode {
  return useUserSettingsStore((state) => state.mode);
}

export function useThemeAccent() {
  return useUserSettingsStore(
    useShallow((state) => ({
      accentColor: state.accentColor,
      accentId: state.accentId,
    }))
  );
}

export function useThemeActions() {
  return useUserSettingsStore(
    useShallow((state) => ({
      setMode: state.setMode,
      toggleMode: state.toggleMode,
      cycleResolvedMode: state.cycleResolvedMode,
      setAccentColor: state.setAccentColor,
      setAccentId: state.setAccentId,
    }))
  );
}

/** Full theme surface (replaces legacy context `useTheme`). */
export function useThemeFromStore() {
  return useUserSettingsStore(
    useShallow((state) => ({
      mode: state.mode,
      resolvedMode: state.resolvedMode,
      setMode: state.setMode,
      toggleMode: state.toggleMode,
      cycleResolvedMode: state.cycleResolvedMode,
      accentColor: state.accentColor,
      setAccentColor: state.setAccentColor,
      accentId: state.accentId,
      setAccentId: state.setAccentId,
    }))
  );
}

export function useSetUserSettingsAppearance() {
  return useUserSettingsStore(
    useShallow((state) => ({ setAppearance: state.setAppearance }))
  );
}
