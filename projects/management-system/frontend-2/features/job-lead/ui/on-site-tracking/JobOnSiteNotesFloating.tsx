"use client";

import { useState } from "react";

import type { NotesTabAccess } from "@/api/types";
import { JobType, ResourceType } from "@/constants";
import { useJobComments } from "@/hooks/mutations";
import { parseEntityId } from "@/shared/lib/parseEntityId";
import { useModalStack } from "@/shared/model/use-modal-stack";
import { resolveNotesTabAccessForJob } from "@/utils/notes";

import type { EntityDataState } from "../show-more-card/entityDataState";
import { JobLeadNotesDialog } from "../JobLeadNotesDialog";
import { JobLeadNotesFloatingWidget } from "../JobLeadNotesFloatingWidget";

const NOTES_MODAL_KEY = "view-job-lead-notes";

export interface JobOnSiteNotesFloatingProps {
  jobId: string | number;
  jobType: JobType;
  /** The job record; supplies notes-tab access and export context. */
  entity: EntityDataState;
  assignedToJob?: boolean;
  notesTabAccess?: NotesTabAccess;
  readOnly?: boolean;
  isTrashed?: boolean;
  canEdit?: boolean;
}

/**
 * Notes & comments as the same floating, draggable bottom-right widget used on
 * the job detail page (with the expand-to-modal affordance), instead of an
 * inline card. Self-contained: it owns the comments hook and open/expand state
 * so the On-Site Tracking page matches the detail page's notes experience.
 */
export function JobOnSiteNotesFloating({
  jobId,
  jobType,
  entity,
  assignedToJob = false,
  notesTabAccess,
  readOnly = false,
  isTrashed = false,
  canEdit = true,
}: JobOnSiteNotesFloatingProps) {
  const resolvedAccess = resolveNotesTabAccessForJob(
    notesTabAccess,
    assignedToJob
  );
  const commentsHook = useJobComments(
    parseEntityId(jobId),
    jobType,
    resolvedAccess
  );
  const { stack, openModal, closeModalKey } = useModalStack();
  const [open, setOpen] = useState(false);

  const modalOpen = stack.some((f) => f.key === NOTES_MODAL_KEY);
  const comments = commentsHook.data ?? [];

  return (
    <>
      <JobLeadNotesFloatingWidget
        canEdit={canEdit}
        canEditLeadPage={false}
        comments={comments}
        commentsHook={commentsHook}
        commentsReadOnly={readOnly}
        entityDataState={entity}
        entityType={ResourceType.JOB}
        isDisabled={readOnly}
        isTrashed={isTrashed}
        open={open}
        onExpand={() => openModal(NOTES_MODAL_KEY)}
        onToggle={() => setOpen((prev) => !prev)}
      />
      <JobLeadNotesDialog
        canEdit={canEdit}
        canEditLeadPage={false}
        comments={comments}
        commentsHook={commentsHook}
        commentsReadOnly={readOnly}
        entityDataState={entity}
        entityType={ResourceType.JOB}
        isDisabled={readOnly}
        isTrashed={isTrashed}
        open={modalOpen}
        onOpenChange={(next) => {
          if (!next) closeModalKey(NOTES_MODAL_KEY);
        }}
      />
    </>
  );
}
