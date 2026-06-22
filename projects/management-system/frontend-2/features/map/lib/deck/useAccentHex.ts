import { useMemo } from "react";

import { useTheme } from "@/shared/ui/common";

const FALLBACK_HEX = "#48484d";

export function useAccentHex(): string {
  const { accentColor } = useTheme();
  return useMemo(() => {
    if (typeof window === "undefined") return FALLBACK_HEX;
    return (
      getComputedStyle(document.documentElement)
        .getPropertyValue(`--accent-${accentColor}`)
        .trim() || FALLBACK_HEX
    );
  }, [accentColor]);
}
