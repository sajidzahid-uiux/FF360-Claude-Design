"use client";

import { cn } from "@fieldflow360/org-ui";
import { ChevronDown } from "lucide-react";

export interface AddEquipmentCollapsibleSectionProps {
  title: string;
  description?: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
}

export function AddEquipmentCollapsibleSection({
  title,
  description,
  open,
  onToggle,
  children,
  className,
}: AddEquipmentCollapsibleSectionProps) {
  return (
    <section
      className={cn(
        "border-border-subtle bg-bg-surface/40 overflow-hidden rounded-xl border",
        className
      )}
    >
      <button
        aria-expanded={open}
        className="hover:bg-bg-hover/50 flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors"
        type="button"
        onClick={onToggle}
      >
        <div className="min-w-0">
          <p className="text-text-primary text-sm font-semibold">{title}</p>
          {description ? (
            <p className="text-text-muted mt-0.5 text-xs">{description}</p>
          ) : null}
        </div>
        <ChevronDown
          aria-hidden
          className={cn(
            "text-text-muted h-4 w-4 shrink-0 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      {open ? (
        <div className="border-border-subtle flex flex-col gap-4 border-t px-4 py-4">
          {children}
        </div>
      ) : null}
    </section>
  );
}
