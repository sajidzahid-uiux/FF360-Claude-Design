"use client";

import { ReactNode } from "react";

import { cn } from "@fieldflow360/org-ui";
import { Inbox } from "lucide-react";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  className,
}: EmptyStateProps) {
  const defaultIcon = icon || <Inbox className="text-text-muted h-12 w-12" />;

  return (
    <section
      aria-label={`${title}. ${description || ""}`}
      className={cn(
        "flex flex-col items-center justify-center py-12 text-center",
        className
      )}
      role="status"
    >
      <div className="text-text-muted mb-4">{defaultIcon}</div>
      <h3 className="text-text-primary mb-2 text-lg font-semibold">{title}</h3>
      {description && (
        <p className="text-text-muted mb-6 max-w-md text-sm">{description}</p>
      )}
    </section>
  );
}
