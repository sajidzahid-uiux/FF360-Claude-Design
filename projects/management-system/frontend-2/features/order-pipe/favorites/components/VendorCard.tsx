"use client";

import type { ReactNode } from "react";

import { cn } from "@fieldflow360/org-ui";
import { MapPin } from "lucide-react";

import { Card } from "@/shared/ui/primitives";

export interface VendorCardProps {
  name: string;
  subtitle: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  rightAction?: ReactNode;
}

export function VendorCard({
  name,
  subtitle,
  selected = false,
  disabled = false,
  onClick,
  onDoubleClick,
  rightAction,
}: VendorCardProps) {
  return (
    <Card
      className={cn(
        "border-border-subtle flex w-full flex-col justify-center gap-1 rounded-lg border p-3 transition-colors",
        selected ? "border-accent bg-accent/20" : "bg-bg-surface-elevated",
        disabled
          ? "cursor-default opacity-70"
          : "hover:bg-bg-hover cursor-pointer"
      )}
      onClick={disabled ? undefined : onClick}
      onDoubleClick={disabled ? undefined : onDoubleClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-text-primary line-clamp-2 text-sm leading-snug font-semibold">
            {name}
          </p>
          <p className="text-text-muted mt-1 line-clamp-2 flex items-start gap-1.5 text-xs leading-relaxed">
            <MapPin aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{subtitle}</span>
          </p>
        </div>
        {rightAction}
      </div>
    </Card>
  );
}
