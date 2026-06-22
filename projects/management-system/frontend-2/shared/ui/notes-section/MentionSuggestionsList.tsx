"use client";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  cn,
} from "@fieldflow360/org-ui";

import type { TeamMember } from "@/api/types";

export interface MentionSuggestionsListProps {
  suggestions: TeamMember[];
  onSelect: (member: TeamMember) => void;
  placement?: "above" | "below";
  className?: string;
}

export function MentionSuggestionsList({
  suggestions,
  onSelect,
  placement = "above",
  className,
}: MentionSuggestionsListProps) {
  if (suggestions.length === 0) return null;

  return (
    <ul
      className={cn(
        "border-border-subtle bg-bg-surface-elevated absolute z-50 max-h-40 w-full min-w-[12rem] overflow-y-auto rounded-lg border py-1 shadow-lg",
        placement === "above" ? "bottom-full mb-1" : "top-full mt-1",
        className
      )}
      role="listbox"
    >
      {suggestions.map((member) => (
        <li key={member.id} aria-selected={false} role="option">
          <Button
            fullWidth
            aria-label={member.user.username}
            className="!justify-start"
            size={ComponentSizeEnum.SM}
            title={member.user.username}
            variant={ButtonVariantEnum.GHOST}
            onClick={() => onSelect(member)}
          />
        </li>
      ))}
    </ul>
  );
}
