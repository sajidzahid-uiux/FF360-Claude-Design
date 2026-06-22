import type { CSSProperties } from "react";

export const HELP_APPEAR_CLASS =
  "animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-300";

export function helpAppearStyle(index: number, stepMs = 45): CSSProperties {
  return {
    animationDelay: `${index * stepMs}ms`,
    animationFillMode: "both",
  };
}
