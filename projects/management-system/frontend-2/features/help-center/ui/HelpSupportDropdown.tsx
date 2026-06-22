"use client";

import Link from "next/link";
import type { RefObject } from "react";

import { Book, HelpCircle, MessageSquare } from "lucide-react";

import { HELP_CENTER_NAV_ITEMS } from "../model/nav";

const HELP_MENU_ICONS = {
  "knowledge-base": Book,
  "help-center": HelpCircle,
  "contact-support": MessageSquare,
} as const;

interface HelpSupportDropdownProps {
  dropdownRef: RefObject<HTMLDivElement | null>;
}

export function HelpSupportDropdown({ dropdownRef }: HelpSupportDropdownProps) {
  return (
    <div
      ref={dropdownRef}
      className="bg-bg-surface-elevated border-border-subtle animate-in fade-in zoom-in-95 absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border shadow-lg duration-200"
    >
      <div className="border-border-subtle border-b px-4 py-3">
        <p className="text-text-primary text-sm font-semibold">
          Help &amp; Support
        </p>
        <p className="text-text-muted mt-0.5 text-xs">
          Guides, FAQs, and ways to reach our team
        </p>
      </div>
      <div className="flex flex-col gap-0.5 p-1">
        {HELP_CENTER_NAV_ITEMS.map((item) => {
          const Icon = HELP_MENU_ICONS[item.id];
          return (
            <Link
              key={item.id}
              className="group hover:bg-bg-hover flex items-start gap-3 rounded-lg px-3 py-3 transition-colors duration-150"
              href={item.href}
            >
              <span className="bg-bg-surface text-text-muted group-hover:bg-accent/10 group-hover:text-accent mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-150">
                <Icon aria-hidden className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="text-text-primary group-hover:text-accent block text-sm font-medium transition-colors duration-150">
                  {item.label}
                </span>
                <span className="text-text-muted group-hover:text-text-primary block text-xs transition-colors duration-150">
                  {item.description}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
