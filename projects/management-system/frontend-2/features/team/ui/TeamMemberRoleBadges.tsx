"use client";

import { cn } from "@fieldflow360/org-ui";

import type { TeamMember } from "@/api/types/team";
import { Badge } from "@/shared/ui/primitives";

export function RoleBadge({ children }: { children: string }) {
  return (
    <Badge
      className="night:bg-white night:text-black h-fit shrink-0 rounded-full border-transparent bg-black px-2.5 py-1.5 text-[11px] leading-none font-medium whitespace-nowrap text-white dark:bg-white dark:text-black"
      variant="outline"
    >
      {children}
    </Badge>
  );
}

export function TeamMemberRoleBadges({
  member,
  className,
}: {
  member: Pick<TeamMember, "is_designer" | "is_operator">;
  className?: string;
}) {
  const showDesigner = Boolean(member.is_designer);
  const showOperator = Boolean(member.is_operator);
  if (!showDesigner && !showOperator) return null;

  return (
    <span
      className={cn("inline-flex flex-wrap items-center gap-1.5", className)}
    >
      {showDesigner ? <RoleBadge>Designer</RoleBadge> : null}
      {showOperator ? <RoleBadge>Operator</RoleBadge> : null}
    </span>
  );
}
