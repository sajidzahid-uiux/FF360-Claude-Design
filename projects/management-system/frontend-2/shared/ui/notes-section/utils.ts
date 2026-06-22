import type { NoteComment } from "@/api/types";
import { NOTE_SECTION_LABELS, NoteSection } from "@/constants";
import { getInitials, resolveAvatarUrl } from "@/shared/lib";

export const NOTE_SECTION_BADGE_CLASS: Record<NoteSection, string> = {
  [NoteSection.GENERAL]:
    "border-border-subtle bg-bg-surface text-text-secondary",
  [NoteSection.OFFICE]:
    "border-blue-200/60 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  [NoteSection.ONSITE]:
    "border-green-200/60 bg-green-500/10 text-green-700 dark:text-green-300",
};

export function getCommentSection(comment: NoteComment): NoteSection {
  return comment.note_section ?? NoteSection.GENERAL;
}

export function getCommentAuthorName(comment: NoteComment): string {
  const user = comment.member?.user;
  if (user?.first_name || user?.last_name) {
    return [user.first_name, user.last_name].filter(Boolean).join(" ");
  }
  return user?.username || comment.member_name || "Unknown";
}

export function getCommentAuthorInitials(comment: NoteComment): string {
  const name = getCommentAuthorName(comment);
  const email = comment.member?.user?.username;
  return getInitials(name, email);
}

export function getCommentAvatarUrl(comment: NoteComment): string | undefined {
  if (!comment.member) return undefined;
  return resolveAvatarUrl(comment.member);
}

export function getSectionLabel(section: NoteSection): string {
  return NOTE_SECTION_LABELS[section];
}
