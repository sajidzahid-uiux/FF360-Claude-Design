"use client";

import { useMemo } from "react";

import { Modal } from "@fieldflow360/org-ui";

import { NotesCountBadge } from "@/shared/ui/common/NotesCountBadge";
import { NotesExportControl } from "@/shared/ui/common/NotesExportControl";

import {
  JobLeadNotesPanel,
  type JobLeadNotesPanelProps,
} from "./JobLeadNotesPanel";
import { getJobLeadNotesExportProps } from "./job-lead-notes-export";

export interface JobLeadNotesDialogProps extends JobLeadNotesPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JobLeadNotesDialog({
  open,
  onOpenChange,
  entityType,
  entityDataState,
  comments,
  ...panelProps
}: JobLeadNotesDialogProps) {
  const { exportContext, availableSections } = useMemo(
    () => getJobLeadNotesExportProps({ entityType, entityDataState }),
    [entityDataState, entityType]
  );

  const commentCount = comments?.length ?? 0;

  return (
    <Modal
      className="w-[min(96vw,48rem)] max-w-3xl"
      isOpen={open}
      size="2xl"
      title="Notes & comments"
      onClose={() => onOpenChange(false)}
    >
      <div className="flex h-full min-h-0 flex-col gap-4">
        {/* Header row mirrors the docked/floating notes: count badge on the
            left, export action on the right — kept out of the footer. */}
        <div className="flex shrink-0 items-center justify-end gap-2">
          <NotesCountBadge className="mr-auto" count={commentCount} />
          <NotesExportControl
            availableSections={availableSections}
            exportContext={exportContext}
          />
        </div>
        <JobLeadNotesPanel
          {...panelProps}
          fillHeight
          comments={comments}
          entityDataState={entityDataState}
          entityType={entityType}
        />
      </div>
    </Modal>
  );
}
