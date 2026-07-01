"use client";

import { useMemo } from "react";

import { ChevronDown, ChevronUp, Maximize2, StickyNote } from "lucide-react";

import { NotesCountBadge } from "@/shared/ui/common/NotesCountBadge";
import { NotesExportControl } from "@/shared/ui/common/NotesExportControl";

import {
  JobLeadNotesPanel,
  type JobLeadNotesPanelProps,
} from "./JobLeadNotesPanel";
import { getJobLeadNotesExportProps } from "./job-lead-notes-export";

export interface JobLeadNotesSectionProps extends JobLeadNotesPanelProps {
  /** Expanded/collapsed state. */
  open: boolean;
  onToggle: () => void;
  /** Opens the full-screen notes modal for a focused view. */
  onExpand?: () => void;
}

/**
 * Notes & comments rendered as a collapsible right-column section in the detail
 * body (replaces the old modal). Same panel content — just docked in place.
 */
export function JobLeadNotesSection({
  open,
  onToggle,
  onExpand,
  entityType,
  entityDataState,
  comments,
  ...panelProps
}: JobLeadNotesSectionProps) {
  const { exportContext, availableSections } = useMemo(
    () => getJobLeadNotesExportProps({ entityType, entityDataState }),
    [entityDataState, entityType]
  );

  const commentCount = comments?.length ?? 0;

  return (
    <section className="border-border-subtle bg-bg-surface-elevated flex flex-col overflow-hidden rounded-xl border">
      <div className="flex w-full items-center justify-between gap-2 px-4 py-3">
        <button
          aria-expanded={open}
          className="text-text-primary inline-flex flex-1 items-center gap-2 text-left text-sm font-semibold"
          type="button"
          onClick={onToggle}
        >
          <StickyNote aria-hidden className="h-4 w-4" strokeWidth={2} />
          Notes &amp; comments
          <NotesCountBadge count={commentCount} />
        </button>
        <div className="flex shrink-0 items-center gap-1">
          <NotesExportControl
            availableSections={availableSections}
            exportContext={exportContext}
          />
          {onExpand ? (
            <button
              aria-label="Open notes in full screen"
              className="text-text-muted hover:text-text-primary hover:bg-bg-hover/40 inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors"
              type="button"
              onClick={onExpand}
            >
              <Maximize2 aria-hidden className="h-4 w-4" />
            </button>
          ) : null}
          <button
            aria-label={open ? "Collapse notes" : "Expand notes"}
            className="text-text-muted hover:text-text-primary hover:bg-bg-hover/40 inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors"
            type="button"
            onClick={onToggle}
          >
            {open ? (
              <ChevronUp aria-hidden className="h-4 w-4" />
            ) : (
              <ChevronDown aria-hidden className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      {open ? (
        <div className="border-border-subtle flex flex-col gap-4 border-t px-4 pt-4 pb-4">
          <JobLeadNotesPanel
            {...panelProps}
            comments={comments}
            entityDataState={entityDataState}
            entityType={entityType}
          />
        </div>
      ) : null}
    </section>
  );
}
