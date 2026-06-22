import type { NoteSection } from "@/constants/enums";
import type { UploadProgressHandler } from "@/shared/lib/uploadProgress";

import type { Author } from "./common";

// ============================================
// FILE ATTACHMENT
// ============================================

export interface FileAttachment {
  id: number;
  title: string;
  description?: string;
  file: string;
  file_type?: string;
  farmer_file?: boolean;
  diggs_file?: boolean;
  created_at: string;
  last_updated: string;
}

export interface FileUploadPayload {
  file: File;
  title: string;
  description?: string;
}

export interface FileUploadWithProgressPayload extends FileUploadPayload {
  onProgress?: UploadProgressHandler;
}

// ============================================
// COMMENT
// ============================================

export interface Comment {
  id: number;
  text: string;
  author?: Author;
  member?: { id?: number; user?: Author };
  member_name?: string;
  note_section?: NoteSection;
  mentioned_members?: number[];
  created_at: string;
  last_updated: string;
}

export interface CommentCreatePayload {
  text: string;
  note_section?: NoteSection;
  mentioned_members?: number[];
}

/** POST /ms/organizations/{orgId}/comments/ */
export interface OrganizationCommentCreatePayload extends CommentCreatePayload {
  content_type: number;
  object_id: string | number;
}

export interface CommentUpdatePayload {
  text: string;
  note_section?: NoteSection;
  mentioned_members?: number[];
}

/** PATCH /ms/organizations/{orgId}/comments/{id}/ */
export interface OrganizationCommentUpdatePayload extends CommentUpdatePayload {
  content_type: number;
  object_id: string | number;
}
