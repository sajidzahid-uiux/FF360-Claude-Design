import { cn } from "@fieldflow360/org-ui";

import type { PlatformModule } from "@/features/upcoming-features";

interface ModuleCardProps {
  module: PlatformModule;
  className?: string;
}

export function ModuleCard({ module, className }: ModuleCardProps) {
  return (
    <article
      className={cn(
        "border-border-subtle/80 bg-bg-surface-elevated flex h-full min-w-0 flex-col rounded-xl border p-4 sm:p-5",
        className
      )}
    >
      <h3 className="text-text-primary text-sm leading-snug font-semibold sm:text-base">
        {module.title}
      </h3>
      <p className="text-text-muted mt-2 flex-1 text-sm leading-relaxed">
        {module.description}
      </p>
    </article>
  );
}
