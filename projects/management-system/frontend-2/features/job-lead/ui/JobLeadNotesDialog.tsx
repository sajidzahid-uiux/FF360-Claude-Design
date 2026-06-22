"use client";

import { useMemo } from "react";

import { Modal } from "@fieldflow360/org-ui";

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
  ...panelProps
}: JobLeadNotesDialogProps) {
  const { exportContext, availableSections } = useMemo(
    () => getJobLeadNotesExportProps({ entityType, entityDataState }),
    [entityDataState, entityType]
  );

  return (
    <Modal
      className="w-[min(96vw,48rem)] max-w-3xl"
      isOpen={open}
      size="2xl"
      title="Notes & comments"
      onClose={() => onOpenChange(false)}
    >
      <div className="flex flex-col gap-4">
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
    </Modal>
  );
}
