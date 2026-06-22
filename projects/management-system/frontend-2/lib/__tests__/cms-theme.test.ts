import { ThemeModeEnum } from "@fieldflow360/org-ui";
import { describe, expect, it } from "vitest";

import {
  CMS_BRAND_DEFAULT_ACCENT_HEX,
  CMS_DEFAULT_ACCENT,
  cmsAccentHexFromId,
  cmsAccentIdFromHex,
  isCmsAccentColor,
  resolvedModeToThemeMode,
} from "../cms-theme";
import {
  isDarkResolvedMode,
  isLightResolvedMode,
  isResolvedThemeMode,
} from "../theme-enums";

describe("cms-theme", () => {
  it("maps accent ids to hex and back", () => {
    expect(cmsAccentHexFromId("teal")).toBe("#14b8a6");
    expect(cmsAccentIdFromHex("#14b8a6")).toBe("teal");
    expect(cmsAccentIdFromHex("#14B8A6")).toBe("teal");
    expect(cmsAccentIdFromHex(CMS_BRAND_DEFAULT_ACCENT_HEX)).toBe("lime");
    expect(cmsAccentIdFromHex("unknown")).toBe(CMS_DEFAULT_ACCENT);
  });

  it("maps resolved modes to org-ui theme mode", () => {
    expect(resolvedModeToThemeMode(ThemeModeEnum.LIGHT)).toBe(
      ThemeModeEnum.LIGHT
    );
    expect(resolvedModeToThemeMode(ThemeModeEnum.DARK)).toBe(
      ThemeModeEnum.DARK
    );
    expect(resolvedModeToThemeMode(ThemeModeEnum.NIGHT)).toBe(
      ThemeModeEnum.NIGHT
    );
  });

  it("validates resolved theme modes and cms accent literals", () => {
    expect(isResolvedThemeMode(ThemeModeEnum.NIGHT)).toBe(true);
    expect(isResolvedThemeMode(ThemeModeEnum.SYSTEM)).toBe(false);
    expect(isCmsAccentColor("teal")).toBe(true);
    expect(isCmsAccentColor("cyan")).toBe(false);
  });

  it("classifies light vs dark resolved modes", () => {
    expect(isLightResolvedMode(ThemeModeEnum.LIGHT)).toBe(true);
    expect(isLightResolvedMode(ThemeModeEnum.DARK)).toBe(false);
    expect(isDarkResolvedMode(ThemeModeEnum.NIGHT)).toBe(true);
    expect(isDarkResolvedMode(ThemeModeEnum.LIGHT)).toBe(false);
  });
});
