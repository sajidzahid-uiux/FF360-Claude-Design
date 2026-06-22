import type { NoteSection, NotesTabAccess } from "@/constants/enums";

import type { IdOf } from "./common";

export interface NoteCommentMemberUser {
  id?: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  profile_image?: string | null;
}

export interface NoteCommentMember {
  id?: number;
  user?: NoteCommentMemberUser;
}

export interface NoteComment {
  id: number;
  text: string;
  note_section?: NoteSection;
  member?: NoteCommentMember;
  member_name?: string;
  created_at: string;
  content_type?: number;
  object_id?: number | string;
  mentioned_members?: number[];
  sharing_comment?: boolean;
  comment_flag?: string;
}

export interface NoteCommentPostPayload {
  text: string;
  mentionIds?: number[];
  note_section?: NoteSection;
}

export interface NoteCommentPatchPayload {
  text: string;
  mentionIds?: number[];
  note_section?: NoteSection;
}

export interface NoteCommentPatchVariables extends NoteCommentPatchPayload {
  comment_id: IdOf<NoteComment>;
}

export interface NoteCommentDeletePayload {
  comment_id: IdOf<NoteComment>;
}

export type NotesExportType = "all" | NoteSection;

export type NotesExportResourceKind = "lead" | "job" | "equipment";

export interface NotesExportContext {
  resourceKind: NotesExportResourceKind;
  objectId: string | number;
}

export interface NotesExportPdfPayload {
  content_type: number;
  object_id: number | string;
  export_type?: NotesExportType;
}

export type { NotesTabAccess };
