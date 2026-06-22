"use client";

import { usePathname, useRouter } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import { useOrgNavigation } from "@/hooks/useOrgNavigation";

import { HELP_CENTER_NAV_ITEMS } from "../model/nav";

export function HelpCenterSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { navigateWithOrg } = useOrgNavigation();

  return (
    <aside className="border-border-subtle bg-bg-surface/40 w-72 shrink-0 border-r max-md:hidden">
      <div className="sticky top-0 flex h-full flex-col p-6">
        <button
          className="text-text-muted hover:text-text-primary mb-8 flex items-center gap-2 text-sm transition-colors"
          type="button"
          onClick={() => navigateWithOrg("dashboard")}
        >
          <ArrowLeft aria-hidden className="h-4 w-4" />
          <span>Help &amp; Support</span>
        </button>
        <nav aria-label="Help and support sections" className="space-y-1">
          {HELP_CENTER_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <button
                key={item.id}
                className={`w-full rounded-lg px-3 py-2.5 text-left transition-colors ${
                  isActive
                    ? "bg-bg-surface-elevated text-text-primary shadow-sm"
                    : "text-text-primary hover:bg-bg-surface/80"
                }`}
                type="button"
                onClick={() => router.push(item.href)}
              >
                <div className="text-sm font-semibold">{item.label}</div>
                <div className="text-text-muted mt-0.5 text-xs font-normal">
                  {item.description}
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
