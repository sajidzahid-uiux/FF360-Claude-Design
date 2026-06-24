"use client";

import { useMemo } from "react";

import { ChevronDown, ChevronUp, StickyNote } from "lucide-react";

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
}

/**
 * Notes & comments rendered as a collapsible right-column section in the detail
 * body (replaces the old modal). Same panel content — just docked in place.
 */
export function JobLeadNotesSection({
  open,
  onToggle,
  entityType,
  entityDataState,
  ...panelProps
}: JobLeadNotesSectionProps) {
  const { exportContext, availableSections } = useMemo(
    () => getJobLeadNotesExportProps({ entityType, entityDataState }),
    [entityDataState, entityType]
  );

  return (
    <section className="border-border-subtle bg-bg-surface-elevated flex flex-col overflow-hidden rounded-xl border">
      <button
        aria-expanded={open}
        className="hover:bg-bg-hover/30 flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors"
        type="button"
        onClick={onToggle}
      >
        <span className="text-text-primary inline-flex items-center gap-2 text-sm font-semibold">
          <StickyNote aria-hidden className="h-4 w-4" strokeWidth={2} />
          Notes &amp; comments
        </span>
        {open ? (
          <ChevronUp aria-hidden className="text-text-muted h-4 w-4 shrink-0" />
        ) : (
          <ChevronDown
            aria-hidden
            className="text-text-muted h-4 w-4 shrink-0"
          />
        )}
      </button>
      {open ? (
        <div className="border-border-subtle flex flex-col gap-4 border-t px-4 pt-4 pb-4">
          <JobLeadNotesPanel
            {...panelProps}
            entityDataState={entityDataState}
            entityType={entityType}
          />
          <div className="border-border-subtle flex justify-end border-t pt-4">
            <NotesExportControl
              availableSections={availableSections}
              exportContext={exportContext}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
