import { cn } from "@fieldflow360/org-ui";
import { Check } from "lucide-react";

export interface CategoryFeatureCardProps {
  category: string;
  titles: string[];
  className?: string;
}

export function CategoryFeatureCard({
  category,
  titles,
  className,
}: CategoryFeatureCardProps) {
  return (
    <article
      className={cn(
        "border-border-subtle/80 bg-bg-surface-elevated flex h-full min-w-0 flex-col overflow-hidden rounded-xl border",
        className
      )}
    >
      <header className="border-border-subtle/60 flex items-center justify-between gap-3 border-b px-4 py-3">
        <h3 className="text-text-primary min-w-0 text-sm leading-snug font-semibold">
          {category}
        </h3>
        <span className="bg-bg-surface text-text-muted shrink-0 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums">
          {titles.length}
        </span>
      </header>
      <ul className="flex flex-1 flex-col gap-2 px-4 py-3">
        {titles.map((title) => (
          <li
            key={title}
            className="text-text-secondary flex items-start gap-2 text-sm leading-snug"
          >
            <Check
              aria-hidden
              className="text-text-muted mt-0.5 h-3.5 w-3.5 shrink-0"
              strokeWidth={2.5}
            />
            <span>{title}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
