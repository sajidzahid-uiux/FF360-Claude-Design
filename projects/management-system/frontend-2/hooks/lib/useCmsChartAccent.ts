"use client";

import { useMemo } from "react";

import { cmsAccentHexFromId } from "@/lib/cms-theme";
import { useThemeAccent } from "@/shared/model/user-settings-store";

/** Accent color for map layers and other non-chart UI. Charts use org-ui series tokens. */
export function useCmsChartAccent() {
  const { accentId } = useThemeAccent();

  const accentHex = useMemo(() => cmsAccentHexFromId(accentId), [accentId]);

  return { accentId, accentHex };
}
