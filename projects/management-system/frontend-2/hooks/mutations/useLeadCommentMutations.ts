import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  COMMENT_CONTENT_TYPE_MODEL,
  CommentsService,
  resolveCommentContentTypeId,
} from "@/api/services/commentsService";
import type { LeadId, NotesTabAccess } from "@/api/types";
import type {
  NoteCommentDeletePayload,
  NoteCommentPatchVariables,
  NoteCommentPostPayload,
} from "@/api/types/notes";
import { LeadType } from "@/constants/enums";

import { invalidateLeadActivityLogs } from "../queries/invalidateActivityLogs";
import {
  leadCommentsQueryKey,
  useLeadCommentsQuery,
} from "../queries/useLeadFilesQueries";
import { useMapping } from "../useMapping";
import { useRouteIds } from "../useRouteIds";

export function useLeadCommentMutations(leadId: LeadId, leadType: LeadType) {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();
  const { data: contentTypes } = useMapping("content_types");

  const commentsKey = leadCommentsQueryKey(organizationId, leadType, leadId);

  const postComment = useMutation({
    mutationFn: async ({
      text,
      mentionIds = [],
      note_section,
    }: NoteCommentPostPayload) => {
      if (!organizationId) throw new Error("Organization ID is required");
      const contentTypeId = resolveCommentContentTypeId(
        contentTypes,
        COMMENT_CONTENT_TYPE_MODEL.lead
      );
      return CommentsService.create(organizationId, {
        text,
        content_type: contentTypeId,
        object_id: leadId,
        mentioned_members: mentionIds,
        ...(note_section ? { note_section } : {}),
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: commentsKey });
      if (organizationId) {
        invalidateLeadActivityLogs(queryClient, organizationId, leadId);
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
        COMMENT_CONTENT_TYPE_MODEL.lead
      );
      return CommentsService.update(organizationId, comment_id, {
        text,
        content_type: contentTypeId,
        object_id: leadId,
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
        invalidateLeadActivityLogs(queryClient, organizationId, leadId);
      }
    },
  });

  return {
    postComment,
    patchComment,
    deleteComment,
  };
}

export function useLeadComments(
  leadId: LeadId,
  leadType: LeadType,
  notesTabAccess?: NotesTabAccess
) {
  const commentsQuery = useLeadCommentsQuery(leadId, leadType, notesTabAccess);
  const { postComment, patchComment, deleteComment } = useLeadCommentMutations(
    leadId,
    leadType
  );

  return {
    ...commentsQuery,
    postComment,
    patchComment,
    deleteComment,
  };
}
