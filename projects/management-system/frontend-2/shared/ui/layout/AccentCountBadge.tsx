"use client";

import { useMemo } from "react";

import { cn, getAccentTextColor, useTheme } from "@fieldflow360/org-ui";

import { CMS_BRAND_DEFAULT_ACCENT_HEX } from "@/lib/cms-theme";

const DEFAULT_ACCENT = CMS_BRAND_DEFAULT_ACCENT_HEX;

interface AccentCountBadgeProps {
  count: number;
  className?: string;
  size?: "sm" | "md";
  title?: string;
}

export function AccentCountBadge({
  count,
  className,
  size = "sm",
  title,
}: AccentCountBadgeProps) {
  const { accentColor } = useTheme();
  const foreground = useMemo(
    () => getAccentTextColor(accentColor || DEFAULT_ACCENT),
    [accentColor]
  );

  if (count <= 0) {
    return null;
  }

  const tooltip = title ?? `${count} pending ${count === 1 ? "item" : "items"}`;

  return (
    <span
      className={cn(
        "bg-accent inline-flex shrink-0 items-center justify-center rounded-full border-2 border-white font-medium tabular-nums dark:border-zinc-900",
        size === "sm" && "h-5 min-w-5 px-1 text-[10px]",
        size === "md" && "h-5 min-w-5 px-1 text-[9px]",
        className
      )}
      style={{ color: foreground }}
      title={tooltip}
    >
      {count}
    </span>
  );
}
