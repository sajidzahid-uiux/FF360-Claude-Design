"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { useTheme } from "@fieldflow360/org-ui";

import {
  CMS_BRAND_DEFAULT_ACCENT_HEX,
  CMS_THEME_ACCENT_STORAGE_KEY,
} from "@/lib/cms-theme";
import { buildCmsHardHatFaviconDataUrl } from "@/shared/ui/layout/cms-favicon-svg";

const FALLBACK_ACCENT = CMS_BRAND_DEFAULT_ACCENT_HEX;

function upsertFavicon(href: string) {
  const iconLinks = document.querySelectorAll<HTMLLinkElement>(
    'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]'
  );

  if (iconLinks.length === 0) {
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/svg+xml";
    link.href = href;
    document.head.appendChild(link);
    return;
  }

  iconLinks.forEach((iconLink) => {
    iconLink.type = "image/svg+xml";
    iconLink.href = href;
  });
}

export function CmsDynamicFavicon() {
  const { accentColor } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    const storedAccent =
      typeof window !== "undefined"
        ? window.localStorage.getItem(CMS_THEME_ACCENT_STORAGE_KEY)
        : null;
    const nextAccent = storedAccent || accentColor || FALLBACK_ACCENT;
    upsertFavicon(buildCmsHardHatFaviconDataUrl(nextAccent));
  }, [accentColor, pathname]);

  return null;
}
