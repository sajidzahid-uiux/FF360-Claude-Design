"use client";

import { useMemo } from "react";

import { toAccentLight, useTheme } from "@fieldflow360/org-ui";
import { Toaster as SonnerToaster } from "sonner";

import { CMS_BRAND_DEFAULT_ACCENT_HEX } from "@/lib/cms-theme";

/** Matches Tile Design `shared/ui/toaster.tsx` — accent-tinted Sonner toasts. */
export function Toaster() {
  const { accentColor } = useTheme();
  const accent = accentColor || CMS_BRAND_DEFAULT_ACCENT_HEX;
  const accentLight = useMemo(() => toAccentLight(accent), [accent]);

  return (
    <SonnerToaster
      expand={false}
      position="bottom-right"
      richColors={false}
      toastOptions={{
        className: "font-sans",
        duration: 4000,
        style: {
          background: accentLight,
          border: `2px solid ${accent}`,
          borderRadius: "10px",
          color: "#000000",
          fontFamily: "sans-serif",
          fontSize: "16px",
          fontWeight: "bold",
          padding: "10px",
        },
        classNames: {
          closeButton:
            "text-text-muted hover:text-text-primary border-none bg-transparent",
          description: "text-text-secondary text-sm font-normal",
          title: "!text-black",
          toast: "!text-black",
        },
      }}
    />
  );
}
