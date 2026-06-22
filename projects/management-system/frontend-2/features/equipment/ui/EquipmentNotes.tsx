"use client";

import type {
  NoteCommentPatchPayload,
  NoteCommentPostPayload,
} from "@/api/types";
import {
  getEquipmentNotesTabAccess,
  useEquipmentPermissions,
} from "@/hooks/permissions";
import { useEquipmentComments } from "@/hooks/useEquipmentComments";
import { Notes } from "@/shared/ui/common";

interface EquipmentNotesProps {
  equipmentId: string | number;
  isTrashed?: boolean;
}

export function EquipmentNotes({
  equipmentId,
  isTrashed = false,
}: EquipmentNotesProps) {
  const { canReadComments, canWriteComments } = useEquipmentPermissions();
  const canViewNotes = canReadComments;
  const canWriteNotes = canWriteComments && !isTrashed;

  const {
    data: comments,
    postComment,
    patchComment,
    deleteComment,
  } = useEquipmentComments(canViewNotes ? equipmentId : undefined);

  if (!canViewNotes) {
    return (
      <p className="text-text-muted text-sm">
        You do not have permission to view equipment notes.
      </p>
    );
  }

  return (
    <Notes
      comments={comments || []}
      deleteComment={async (id: number) => {
        if (deleteComment?.mutateAsync) {
          await deleteComment.mutateAsync({ comment_id: id });
        }
        return id;
      }}
      exportContext={{
        resourceKind: "equipment",
        objectId: equipmentId,
      }}
      globalReadOnly={isTrashed || !canWriteNotes}
      hasPageWrite={canWriteNotes}
      notesTabAccess={getEquipmentNotesTabAccess(canViewNotes)}
      patchComment={async (id: number, payload: NoteCommentPatchPayload) => {
        if (patchComment?.mutateAsync) {
          return patchComment.mutateAsync({
            comment_id: id,
            ...payload,
          });
        }
        throw new Error("patchComment is not available");
      }}
      postComment={async (payload: NoteCommentPostPayload) =>
        postComment.mutateAsync(payload)
      }
    />
  );
}
