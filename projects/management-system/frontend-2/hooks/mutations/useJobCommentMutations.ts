import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  COMMENT_CONTENT_TYPE_MODEL,
  CommentsService,
  resolveCommentContentTypeId,
} from "@/api/services/commentsService";
import type { JobId, NotesTabAccess } from "@/api/types";
import type {
  NoteCommentDeletePayload,
  NoteCommentPatchVariables,
  NoteCommentPostPayload,
} from "@/api/types/notes";
import { JobType } from "@/constants/enums";

import { invalidateJobActivityLogs } from "../queries/invalidateActivityLogs";
import {
  jobCommentsQueryKey,
  useJobCommentsQuery,
} from "../queries/useJobFilesQueries";
import { useMapping } from "../useMapping";
import { useRouteIds } from "../useRouteIds";

export function useJobCommentMutations(jobId: JobId, jobType: JobType) {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();
  const { data: contentTypes } = useMapping("content_types");

  const commentsKey = jobCommentsQueryKey(organizationId, jobType, jobId);

  const postComment = useMutation({
    mutationFn: async ({
      text,
      mentionIds = [],
      note_section,
    }: NoteCommentPostPayload) => {
      if (!organizationId) throw new Error("Organization ID is required");
      const contentTypeId = resolveCommentContentTypeId(
        contentTypes,
        COMMENT_CONTENT_TYPE_MODEL.job
      );
      return CommentsService.create(organizationId, {
        text,
        content_type: contentTypeId,
        object_id: jobId,
        mentioned_members: mentionIds,
        ...(note_section ? { note_section } : {}),
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: commentsKey });
      if (organizationId) {
        invalidateJobActivityLogs(queryClient, organizationId, jobId);
      }
    },
  });

  const patchComment = useMutation({
    mutationFn: async ({
      text,
      comment_id,
      mentionIds = [],
      note_section,
    }: NoteCommentPatchVariables) => {
      if (!organizationId) throw new Error("Organization ID is required");
      const contentTypeId = resolveCommentContentTypeId(
        contentTypes,
        COMMENT_CONTENT_TYPE_MODEL.job
      );
      return CommentsService.update(organizationId, comment_id, {
        text,
        content_type: contentTypeId,
        object_id: jobId,
        mentioned_members: mentionIds,
        ...(note_section ? { note_section } : {}),
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: commentsKey });
    },
  });

  const deleteComment = useMutation({
    mutationFn: async ({ comment_id }: NoteCommentDeletePayload) => {
      if (!organizationId) throw new Error("Organization ID is required");
      await CommentsService.delete(organizationId, comment_id);
      return comment_id;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: commentsKey });
      if (organizationId) {
        invalidateJobActivityLogs(queryClient, organizationId, jobId);
      }
    },
  });

  return {
    postComment,
    patchComment,
    deleteComment,
  };
}

export function useJobComments(
  jobId: JobId,
  jobType: JobType,
  notesTabAccess?: NotesTabAccess
) {
  const commentsQuery = useJobCommentsQuery(jobId, jobType, notesTabAccess);
  const { postComment, patchComment, deleteComment } = useJobCommentMutations(
    jobId,
    jobType
  );

  return {
    ...commentsQuery,
    postComment,
    patchComment,
    deleteComment,
  };
}
