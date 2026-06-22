"use client";

import { useMemo } from "react";

import type { NoteComment } from "@/api/types";
import { ResourceType } from "@/constants";
import type { EntityDataState } from "@/features/job-lead/ui/show-more-card/entityDataState";
import type { CommentsHookResult } from "@/features/job-lead/ui/show-more-card/types";
import { Notes } from "@/shared/ui/common";
import {
  getAllowedNoteSections,
  resolveNotesTabAccessForJob,
} from "@/utils/notes";

export interface JobLeadNotesPanelProps {
  entityType: ResourceType;
  entityDataState: EntityDataState;
  comments: NoteComment[];
  commentsHook: CommentsHookResult;
  commentsReadOnly: boolean;
  isDisabled: boolean;
  isTrashed?: boolean;
  toggleArchive?: boolean;
  canEdit: boolean;
  canEditLeadPage: boolean;
}

export function JobLeadNotesPanel({
  entityType,
  entityDataState,
  comments,
  commentsHook,
  commentsReadOnly,
  isDisabled,
  isTrashed,
  toggleArchive,
  canEdit,
  canEditLeadPage,
}: JobLeadNotesPanelProps) {
  const notesTabAccessForJob = useMemo(
    () =>
      resolveNotesTabAccessForJob(
        entityDataState.notesTabAccess,
        entityDataState.canAccessOnSiteTracking
      ),
    [entityDataState.canAccessOnSiteTracking, entityDataState.notesTabAccess]
  );

  const allowedNoteSections = getAllowedNoteSections(notesTabAccessForJob);
  const assignedToJob = entityDataState.canAccessOnSiteTracking === true;
  const notesReadOnly = commentsReadOnly || isDisabled;

  return (
    <Notes
      embedded
      assignedToJob={assignedToJob}
      availableSections={allowedNoteSections}
      comments={comments ?? []}
      commentsReadOnly={commentsReadOnly}
      deleteComment={(id) =>
        commentsHook.deleteComment.mutateAsync({ comment_id: id })
      }
      exportContext={
        entityDataState.id
          ? {
              resourceKind: entityType === ResourceType.LEAD ? "lead" : "job",
              objectId: entityDataState.id,
            }
          : undefined
      }
      globalReadOnly={isTrashed || toggleArchive}
      hasPageWrite={entityType === ResourceType.JOB ? canEdit : canEditLeadPage}
      notesTabAccess={notesTabAccessForJob}
      patchComment={(id, payload) =>
        commentsHook.patchComment.mutateAsync({
          comment_id: id,
          ...payload,
        })
      }
      postComment={(payload) => commentsHook.postComment.mutateAsync(payload)}
      readOnly={notesReadOnly}
      showExportControl={false}
      showTitle={false}
    />
  );
}
