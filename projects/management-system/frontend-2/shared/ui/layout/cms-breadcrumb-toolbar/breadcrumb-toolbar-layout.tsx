import { type ReactNode } from "react";

import { cn } from "@fieldflow360/org-ui";

export function BreadcrumbToolbarLayout({
  leading,
  actions,
  className,
}: {
  leading?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  const hasToolbar = Boolean(leading) || Boolean(actions);
  if (!hasToolbar) return null;

  return (
    <div
      className={cn(
        "flex max-w-full shrink-0 flex-wrap items-center justify-end gap-1.5",
        className
      )}
    >
      {leading}
      {actions}
    </div>
  );
}
