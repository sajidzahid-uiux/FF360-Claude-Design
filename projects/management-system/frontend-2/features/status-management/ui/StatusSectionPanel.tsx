"use client";

import type { ReactNode } from "react";

interface StatusSectionPanelProps {
  title: string;
  description: string;
  footerNote?: string;
  children: ReactNode;
}

export function StatusSectionPanel({
  title,
  description,
  footerNote,
  children,
}: StatusSectionPanelProps) {
  return (
    <section className="border-border-subtle bg-bg-surface-elevated flex flex-col gap-4 rounded-xl border p-4 md:p-5">
      <div className="space-y-1">
        <h2 className="text-text-primary text-lg font-semibold">{title}</h2>
        <p className="text-text-muted text-sm">{description}</p>
      </div>
      {children}
      {footerNote ? (
        <p className="text-text-muted text-xs">{footerNote}</p>
      ) : null}
    </section>
  );
}
