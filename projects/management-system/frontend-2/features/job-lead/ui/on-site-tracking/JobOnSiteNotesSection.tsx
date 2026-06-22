"use client";

import type {
  NoteCommentPatchPayload,
  NoteCommentPostPayload,
  NotesTabAccess,
} from "@/api/types";
import { JobType, NoteSection } from "@/constants";
import { useJobComments } from "@/hooks/mutations";
import { parseEntityId } from "@/shared/lib/parseEntityId";
import { DetailFormSection, Notes } from "@/shared/ui/common";
import {
  getOnsiteNotesTabAccess,
  resolveNotesTabAccessForJob,
} from "@/utils/notes";

export interface JobOnSiteNotesSectionProps {
  assignedToJob?: boolean;
  jobId: string | number;
  jobType: JobType;
  notesTabAccess?: NotesTabAccess;
  readOnly?: boolean;
}

export function JobOnSiteNotesSection({
  assignedToJob = false,
  jobId,
  jobType,
  notesTabAccess,
  readOnly = false,
}: JobOnSiteNotesSectionProps) {
  const resolvedAccess = resolveNotesTabAccessForJob(
    notesTabAccess,
    assignedToJob
  );
  const onsiteAccess = getOnsiteNotesTabAccess(resolvedAccess);
  const commentsHook = useJobComments(
    parseEntityId(jobId),
    jobType,
    onsiteAccess
  );

  if (!onsiteAccess.onsite) {
    return null;
  }

  return (
    <DetailFormSection
      description="On-site notes visible to your team on this job."
      title="Notes & comments"
    >
      <Notes
        embedded
        availableSections={[NoteSection.ONSITE]}
        comments={commentsHook.data ?? []}
        deleteComment={(id) =>
          commentsHook.deleteComment.mutateAsync({ comment_id: id })
        }
        exportContext={{
          resourceKind: "job",
          objectId: jobId,
        }}
        patchComment={(id, payload: NoteCommentPatchPayload) =>
          commentsHook.patchComment.mutateAsync({ comment_id: id, ...payload })
        }
        postComment={(payload: NoteCommentPostPayload) =>
          commentsHook.postComment.mutateAsync(payload)
        }
        readOnly={readOnly}
        showTitle={false}
      />
    </DetailFormSection>
  );
}
