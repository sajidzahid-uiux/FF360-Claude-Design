"use client";

import { TableEmptyState, cn } from "@fieldflow360/org-ui";
import { MessageSquarePlus } from "lucide-react";

export interface NotesSectionEmptyStateProps {
  sectionLabel: string;
  readOnly?: boolean;
  className?: string;
}

export function NotesSectionEmptyState({
  sectionLabel,
  readOnly = false,
  className,
}: NotesSectionEmptyStateProps) {
  const label = sectionLabel.toLowerCase();

  return (
    <TableEmptyState
      className={cn("py-10", className)}
      description={
        readOnly
          ? `No ${label} notes have been added yet.`
          : `Be the first to add a ${label} note below.`
      }
      icon={
        <div className="bg-bg-surface border-border-subtle flex h-14 w-14 items-center justify-center rounded-full border">
          <MessageSquarePlus
            aria-hidden
            className="text-text-muted h-7 w-7"
            strokeWidth={1.5}
          />
        </div>
      }
      title={`No ${label} notes yet`}
    />
  );
}
