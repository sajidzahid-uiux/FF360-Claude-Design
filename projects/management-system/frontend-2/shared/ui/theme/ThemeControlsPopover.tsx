"use client";

import { useEffect, useRef, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  ThemeControls,
  ThemeControlsOrientationEnum,
} from "@fieldflow360/org-ui";
import { Palette } from "lucide-react";

export interface ThemeControlsPopoverProps {
  /** Horizontal alignment of the floating panel relative to the trigger. */
  align?: "left" | "right";
  className?: string;
}

/**
 * Compact theme switcher: a palette button that opens the org-ui `ThemeControls`
 * panel (appearance + accent) in a floating popover. Used standalone in the CMS
 * top bar and the design-system header so theming is reachable from anywhere.
 */
export function ThemeControlsPopover({
  align = "right",
  className,
}: ThemeControlsPopoverProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className={`relative ${className ?? ""}`}>
      <Button
        ref={triggerRef}
        iconOnly
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Theme settings"
        leftIcon={<Palette className="h-5 w-5" />}
        size={ComponentSizeEnum.MD}
        variant={ButtonVariantEnum.GHOST}
        onClick={() => setOpen((value) => !value)}
      />
      {open ? (
        <div
          ref={panelRef}
          className={`bg-bg-surface-elevated border-border-subtle absolute z-50 mt-2 w-72 rounded-lg border p-4 shadow-lg ${
            align === "right" ? "right-0" : "left-0"
          }`}
          role="dialog"
        >
          <ThemeControls orientation={ThemeControlsOrientationEnum.VERTICAL} />
        </div>
      ) : null}
    </div>
  );
}
