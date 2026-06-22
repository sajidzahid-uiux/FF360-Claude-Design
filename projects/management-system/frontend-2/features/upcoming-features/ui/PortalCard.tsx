import { cn } from "@fieldflow360/org-ui";

import type { ConnectedPortal } from "@/features/upcoming-features";

interface PortalCardProps {
  portal: ConnectedPortal;
  className?: string;
}

export function PortalCard({ portal, className }: PortalCardProps) {
  return (
    <article
      className={cn(
        "border-border-subtle/80 bg-bg-surface-elevated flex h-full min-w-0 flex-col rounded-xl border p-4 sm:p-5",
        className
      )}
    >
      <h3 className="text-text-primary text-sm leading-snug font-semibold sm:text-base">
        {portal.title}
      </h3>
      <p className="text-text-muted mt-2 flex-1 text-sm leading-relaxed">
        {portal.description}
      </p>
    </article>
  );
}
