"use client";

import { Plus } from "lucide-react";

interface StatusAddCardProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function StatusAddCard({
  label,
  onClick,
  disabled = false,
}: StatusAddCardProps) {
  return (
    <button
      aria-label={label}
      className="group border-border-subtle text-text-muted hover:border-accent hover:bg-accent-light hover:text-accent focus-visible:border-accent focus-visible:text-accent flex min-h-[88px] w-full items-center justify-center gap-2.5 rounded-xl border border-dashed p-4 text-sm font-medium transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border-subtle disabled:hover:bg-transparent disabled:hover:text-text-muted"
      disabled={disabled}
      type="button"
      onClick={onClick}
    >
      <span className="bg-bg-hover text-text-secondary group-hover:bg-accent group-hover:text-white flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors">
        <Plus aria-hidden className="h-4 w-4" strokeWidth={2} />
      </span>
      {label}
    </button>
  );
}
