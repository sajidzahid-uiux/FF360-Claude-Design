"use client";

import { ComponentSizeEnum, Loader, cn } from "@fieldflow360/org-ui";
import { Building2, UserCheck, UserMinus, Users } from "lucide-react";

import type { CrewDirectoryStats } from "@/api/types";

interface CrewDirectoryOverviewStatsProps {
  stats: CrewDirectoryStats | undefined;
  isLoading: boolean;
}

const STAT_ITEMS = [
  { key: "total_crew", label: "Total crew", icon: Users },
  { key: "total_groups", label: "Total groups", icon: Building2 },
  { key: "assigned_count", label: "Assigned", icon: UserCheck },
  { key: "unassigned_count", label: "Unassigned", icon: UserMinus },
] as const;

export function CrewDirectoryOverviewStats({
  stats,
  isLoading,
}: CrewDirectoryOverviewStatsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {STAT_ITEMS.map(({ key, label, icon: Icon }) => (
        <article
          key={key}
          className="border-border-subtle bg-bg-surface-elevated rounded-xl border p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-text-muted text-sm font-medium">{label}</p>
            <Icon aria-hidden className="text-text-muted h-4 w-4" />
          </div>
          <div className={cn("mt-2 min-h-8", isLoading && "flex items-center")}>
            {isLoading ? (
              <Loader centerInContainer={false} size={ComponentSizeEnum.SM} />
            ) : (
              <p className="text-text-primary text-2xl font-semibold tabular-nums">
                {stats?.[key] ?? 0}
              </p>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
