"use client";

import type { ReactNode } from "react";

import { Info } from "lucide-react";

interface StatusSectionPanelProps {
  title: string;
  description: string;
  footerNote?: string;
  icon?: ReactNode;
  count?: number;
  children: ReactNode;
}

export function StatusSectionPanel({
  title,
  description,
  footerNote,
  icon,
  count,
  children,
}: StatusSectionPanelProps) {
  return (
    <section className="border-border-subtle bg-bg-surface-elevated flex flex-col gap-4 rounded-xl border p-4 md:p-5">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          {icon ? (
            <span className="bg-accent-light text-accent flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
              {icon}
            </span>
          ) : null}
          <h2 className="text-text-primary text-lg font-semibold">{title}</h2>
          {typeof count === "number" ? (
            <span className="bg-bg-hover text-text-secondary inline-flex min-w-[1.5rem] items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold">
              {count}
            </span>
          ) : null}
        </div>
        <p className="text-text-muted text-sm">{description}</p>
      </div>
      {children}
      {footerNote ? (
        <p className="text-text-muted bg-bg-surface/40 border-border-subtle flex items-start gap-2 rounded-lg border px-3 py-2 text-xs">
          <Info aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} />
          <span>{footerNote}</span>
        </p>
      ) : null}
    </section>
  );
}
