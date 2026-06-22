import type {
  Comment,
  NotesExportPdfPayload,
  OrganizationCommentCreatePayload,
  OrganizationCommentUpdatePayload,
} from "@/api/types";
import type { NoteSection } from "@/constants/enums";
import { resolveContentTypeId } from "@/shared/lib/contentType";
import { fetchCommentsAcrossNoteSections } from "@/shared/lib/noteSectionComments";

import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";

/** Django content_types.model values for generic comment API. */
export const COMMENT_CONTENT_TYPE_MODEL = {
  job: "job",
  lead: "leaditem",
  equipment: "equipment",
} as const;

export type CommentContentTypeModel =
  (typeof COMMENT_CONTENT_TYPE_MODEL)[keyof typeof COMMENT_CONTENT_TYPE_MODEL];

export function resolveCommentContentTypeId(
  contentTypes: { id: number; model: string }[] | undefined,
  model: CommentContentTypeModel
): number {
  return resolveContentTypeId(contentTypes, model);
}

export class CommentsService {
  static async listBySections(
    organizationId: string,
    contentTypeId: number,
    objectId: string | number,
    sections: NoteSection[]
  ) {
    return fetchCommentsAcrossNoteSections(
      organizationId,
      contentTypeId,
      objectId,
      sections
    );
  }

  static async create(
    organizationId: string,
    data: OrganizationCommentCreatePayload
  ): Promise<Comment> {
    const endpoint = API_ENDPOINTS.organizations.comments(organizationId);
    return apiClient.post<Comment>(endpoint, {
      ...data,
      object_id: String(data.object_id),
    });
  }

  static async update(
    organizationId: string,
    commentId: number | string,
    data: OrganizationCommentUpdatePayload
  ): Promise<Comment> {
    const endpoint = API_ENDPOINTS.organizations.commentDetail(
      organizationId,
      commentId
    );
    return apiClient.patch<Comment>(endpoint, {
      ...data,
      object_id: String(data.object_id),
    });
  }

  static async delete(
    organizationId: string,
    commentId: number | string
  ): Promise<void> {
    const endpoint = API_ENDPOINTS.organizations.commentDetail(
      organizationId,
      commentId
    );
    return apiClient.delete<void>(endpoint);
  }

  static async exportNotesPdf(
    organizationId: string,
    payload: NotesExportPdfPayload
  ): Promise<{ blob: Blob; filename?: string }> {
    const endpoint =
      API_ENDPOINTS.organizations.commentsExportPdf(organizationId);
    return apiClient.postDownload(endpoint, {
      ...payload,
      object_id: Number(payload.object_id),
    });
  }
}
