"use client";

import type { ReactNode } from "react";

export interface DetailFormSectionProps {
  title: string;
  description?: string;
  /** Rendered at the end of the title row (edit, add, etc.). */
  actions?: ReactNode;
  children: ReactNode;
}

export function DetailFormSection({
  title,
  description,
  actions,
  children,
}: DetailFormSectionProps) {
  return (
    <section className="border-border-subtle bg-bg-surface-elevated min-w-0 space-y-4 overflow-hidden rounded-xl border p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-text-primary text-base font-semibold">{title}</h2>
          {description ? (
            <p className="text-text-muted mt-0.5 text-sm">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            {actions}
          </div>
        ) : null}
      </div>
      {children}
    </section>
  );
}
