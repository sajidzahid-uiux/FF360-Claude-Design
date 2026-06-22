import type { ReactNode } from "react";

export interface UpcomingFeaturesSectionHeaderProps {
  icon: ReactNode;
  title: string;
  description?: string;
}

export function UpcomingFeaturesSectionHeader({
  icon,
  title,
  description,
}: UpcomingFeaturesSectionHeaderProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2.5">
        <span className="text-text-muted inline-flex shrink-0 [&_svg]:h-5 [&_svg]:w-5">
          {icon}
        </span>
        <h2 className="text-text-primary text-lg font-semibold sm:text-xl">
          {title}
        </h2>
      </div>
      {description ? (
        <p className="text-text-muted max-w-3xl pl-7 text-sm leading-relaxed">
          {description}
        </p>
      ) : null}
    </div>
  );
}
