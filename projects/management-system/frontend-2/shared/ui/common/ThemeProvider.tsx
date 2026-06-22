"use client";

import { ReactNode, useEffect } from "react";

import {
  ThemeProvider as OrgUiThemeProvider,
  ThemeModeEnum,
  useTheme as useOrgUiTheme,
} from "@fieldflow360/org-ui";

import { usePersistentStorage } from "@/hooks/usePersistentStorage";
import {
  CMS_BRAND_DEFAULT_ACCENT_HEX,
  CMS_THEME_ACCENT_STORAGE_KEY,
  CMS_THEME_MODE_STORAGE_KEY,
  LEGACY_ACCENT_COLOR_STORAGE_KEY,
  LEGACY_COLOR_MODE_STORAGE_KEY,
  cmsAccentIdFromHex,
  seedCmsThemeStorage,
} from "@/lib/cms-theme";
import { getCookie } from "@/lib/cookies";
import {
  type ResolvedThemeMode,
  type ThemeMode,
  isLightResolvedMode,
} from "@/lib/theme-enums";
import {
  registerThemeActions,
  unregisterThemeActions,
} from "@/shared/model/theme-actions";
import { useSetUserSettingsAppearance } from "@/shared/model/user-settings-store";

/** Default brand accent (Tile Design / CMS). */
const TILE_DESIGN_DEFAULT_ACCENT = CMS_BRAND_DEFAULT_ACCENT_HEX;

if (typeof window !== "undefined") {
  seedCmsThemeStorage((key) => localStorage.getItem(key) ?? getCookie(key));
}

function CmsThemeSyncBridge({ children }: { children: ReactNode }) {
  const storage = usePersistentStorage();
  const {
    mode,
    resolvedMode,
    setMode,
    toggleMode,
    accentColor: accentHex,
    setAccentColor: setAccentHex,
  } = useOrgUiTheme();

  const accentId = cmsAccentIdFromHex(accentHex);
  const { setAppearance } = useSetUserSettingsAppearance();

  useEffect(() => {
    registerThemeActions({
      setMode: (nextMode, options) =>
        setMode(nextMode as Parameters<typeof setMode>[0], options),
      toggleMode,
      setAccentColor: setAccentHex,
    });
    return () => unregisterThemeActions();
  }, [setMode, toggleMode, setAccentHex]);

  useEffect(() => {
    setAppearance({
      mode: mode as unknown as ThemeMode,
      resolvedMode: resolvedMode as unknown as ResolvedThemeMode,
      accentColor: accentHex,
      accentId,
    });
  }, [mode, resolvedMode, accentHex, accentId, setAppearance]);

  useEffect(() => {
    storage.setItem(LEGACY_COLOR_MODE_STORAGE_KEY, resolvedMode);
  }, [resolvedMode, storage]);

  useEffect(() => {
    storage.setItem(CMS_THEME_ACCENT_STORAGE_KEY, accentHex);
    storage.setItem(LEGACY_ACCENT_COLOR_STORAGE_KEY, accentId);
  }, [accentHex, accentId, storage]);

  useEffect(() => {
    const html = document.documentElement;
    if (isLightResolvedMode(resolvedMode)) {
      html.classList.add("light");
    } else {
      html.classList.remove("light");
    }
  }, [resolvedMode]);

  useEffect(() => {
    const html = document.documentElement;
    // Keep --accent in sync with org-ui ThemeProvider (scrollbars, bg-accent, charts).
    html.style.setProperty("--accent", accentHex);
    html.style.setProperty("--primary", accentHex);
  }, [accentHex]);

  return children;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <OrgUiThemeProvider
      accentStorageKey={CMS_THEME_ACCENT_STORAGE_KEY}
      defaultAccentColor={TILE_DESIGN_DEFAULT_ACCENT}
      defaultMode={ThemeModeEnum.LIGHT}
      storageKey={CMS_THEME_MODE_STORAGE_KEY}
    >
      <CmsThemeSyncBridge>{children}</CmsThemeSyncBridge>
    </OrgUiThemeProvider>
  );
}

export { formatResolvedThemeModeLabel } from "@/lib/theme-enums";
export { useThemeFromStore as useTheme } from "@/shared/model/user-settings-store";
export type { UserSettingsAppearance } from "@/shared/model/user-settings-store";
