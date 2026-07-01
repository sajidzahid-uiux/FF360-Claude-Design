"use client";

import { useMemo } from "react";

import { cn } from "@fieldflow360/org-ui";
import { Maximize2, Minus, StickyNote } from "lucide-react";

import { ResourceType } from "@/constants";
import { NotesCountBadge } from "@/shared/ui/common/NotesCountBadge";
import { NotesExportControl } from "@/shared/ui/common/NotesExportControl";

import {
  JobLeadNotesPanel,
  type JobLeadNotesPanelProps,
} from "./JobLeadNotesPanel";
import { getJobLeadNotesExportProps } from "./job-lead-notes-export";

export interface JobLeadNotesFloatingWidgetProps extends JobLeadNotesPanelProps {
  /** Popover open (expanded) vs minimized to the floating button. */
  open: boolean;
  /** Toggles between the floating button and the open popover. */
  onToggle: () => void;
  /** Opens the full-screen notes modal for a focused view. */
  onExpand?: () => void;
}

/**
 * Notes & comments as a floating, non-modal popover anchored to the bottom-right
 * of the detail page. Collapsed, it's a floating button; opened, it's a popover
 * card that leaves the rest of the page fully interactive (no backdrop). It only
 * closes when the user minimizes it — the panel content/behaviour is unchanged.
 */
export function JobLeadNotesFloatingWidget({
  open,
  onToggle,
  onExpand,
  entityType,
  entityDataState,
  comments,
  ...panelProps
}: JobLeadNotesFloatingWidgetProps) {
  const { exportContext, availableSections } = useMemo(
    () => getJobLeadNotesExportProps({ entityType, entityDataState }),
    [entityDataState, entityType]
  );

  const commentCount = comments?.length ?? 0;

  const recordKind = entityType === ResourceType.JOB ? "job" : "lead";
  const recordRef =
    (entityType === ResourceType.JOB
      ? entityDataState.po_number
      : entityDataState.estimate_number) ??
    (entityDataState.id != null ? `#${entityDataState.id}` : null);
  const scopeLine = `Only visible on this ${recordKind}${
    recordRef ? ` · ${recordRef}` : ""
  }`;

  if (!open) {
    return (
      <button
        aria-label="Open notes & comments"
        className={cn(
          "bg-text-primary text-text-inverse fixed top-1/2 right-0 z-40 flex -translate-y-1/2 flex-col items-center justify-center gap-3 rounded-l-xl px-2.5 py-6 shadow-lg",
          "transition-opacity hover:opacity-90"
        )}
        style={{ minHeight: "12rem" }}
        type="button"
        onClick={onToggle}
      >
        {/* Notes count: a circular badge with the count text inside. */}
        <NotesCountBadge count={commentCount} emphasis="attention" />
        <StickyNote aria-hidden className="h-5 w-5" strokeWidth={2} />
        <span
          className="text-sm font-semibold tracking-wide"
          style={{ writingMode: "vertical-rl" }}
        >
          Notes
        </span>
      </button>
    );
  }

  return (
    <section
      aria-label="Notes & comments"
      className="border-border-subtle bg-bg-surface-elevated fixed right-5 z-40 flex flex-col overflow-hidden rounded-xl border shadow-2xl"
      style={{
        bottom: "8rem",
        width: "24rem",
        maxHeight: "calc(100vh - 11rem)",
      }}
    >
      <header className="border-border-subtle flex items-start justify-between gap-2 border-b px-4 py-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-text-primary inline-flex items-center gap-2 text-sm font-semibold">
            <StickyNote aria-hidden className="h-4 w-4" strokeWidth={2} />
            Notes &amp; comments
            <NotesCountBadge count={commentCount} />
          </span>
          <span className="text-text-muted truncate text-xs">{scopeLine}</span>
        </div>
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
            aria-label="Minimize notes"
            className="text-text-muted hover:text-text-primary hover:bg-bg-hover/40 inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors"
            type="button"
            onClick={onToggle}
          >
            <Minus aria-hidden className="h-4 w-4" />
          </button>
        </div>
      </header>
      <div className="flex min-h-0 flex-col gap-4 overflow-y-auto px-4 pt-4 pb-4">
        <JobLeadNotesPanel
          {...panelProps}
          comments={comments}
          entityDataState={entityDataState}
          entityType={entityType}
        />
      </div>
    </section>
  );
}
