"use client";

import { Checkbox, cn } from "@fieldflow360/org-ui";

import type { TeamMember } from "@/api/types/team";

export interface TeamMemberMenuFlagsFooterProps {
  member: TeamMember;
  disabled?: boolean;
  onPatchFlags: (args: {
    id: string;
    is_designer?: boolean;
    is_operator?: boolean;
  }) => void;
}

export function TeamMemberMenuFlagsFooter({
  member,
  disabled = false,
  onPatchFlags,
}: TeamMemberMenuFlagsFooterProps) {
  const handleDesignerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    if (checked === Boolean(member.is_designer)) return;
    onPatchFlags({
      id: String(member.id),
      is_designer: checked,
      is_operator: Boolean(member.is_operator),
    });
  };

  const handleOperatorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    if (checked === Boolean(member.is_operator)) return;
    onPatchFlags({
      id: String(member.id),
      is_designer: Boolean(member.is_designer),
      is_operator: checked,
    });
  };

  return (
    <div className="space-y-1 px-1 py-1">
      <div className="text-text-muted px-2 py-1.5 text-xs font-semibold tracking-wide uppercase">
        Flags
      </div>
      <div className="bg-border-subtle mb-1 h-px" />
      <label
        className={cn(
          "hover:bg-bg-hover flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <Checkbox
          checked={Boolean(member.is_designer)}
          disabled={disabled}
          onChange={handleDesignerChange}
        />
        Designer
      </label>
      <label
        className={cn(
          "hover:bg-bg-hover flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <Checkbox
          checked={Boolean(member.is_operator)}
          disabled={disabled}
          onChange={handleOperatorChange}
        />
        Operator
      </label>
    </div>
  );
}
