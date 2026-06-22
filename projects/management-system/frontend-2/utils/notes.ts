import type { NotesTabAccess } from "@/api/types";
import { NoteSection } from "@/constants";

export const ALL_NOTE_SECTIONS: NoteSection[] = [
  NoteSection.GENERAL,
  NoteSection.OFFICE,
  NoteSection.ONSITE,
];

const FAIL_SAFE_SECTIONS: NoteSection[] = [NoteSection.GENERAL];

export function getAllowedNoteSections(
  access: NotesTabAccess | undefined
): NoteSection[] {
  if (!access) return FAIL_SAFE_SECTIONS;
  return ALL_NOTE_SECTIONS.filter((section) => access[section] === true);
}

/** Limit fetches to on-site notes (e.g. On-Site Tracking page). */
export function getOnsiteNotesTabAccess(
  access: NotesTabAccess | undefined
): NotesTabAccess {
  return {
    general: false,
    office: false,
    onsite: access?.onsite === true,
  };
}

export interface CanWriteNoteSectionOptions {
  /** Job/lead page write (required for general notes only). */
  hasPageWrite: boolean;
  /** Trashed or archived — all sections read-only. */
  globalReadOnly?: boolean;
  /** Completed/canceled job without CO&CA write — general notes read-only. */
  commentsReadOnly?: boolean;
  /** Production-tracking assignment (`canAccessOnSiteTracking` on job payload). */
  assignedToJob?: boolean;
}

function hasOnsiteNotesAccess(
  access: NotesTabAccess | undefined,
  assignedToJob?: boolean
): boolean {
  return access?.onsite === true || assignedToJob === true;
}

/**
 * Merge job assignment into tab access when API notesTabAccess is missing or stale.
 * Assigned production-tracking users keep general read (backend: resource read permission).
 */
export function resolveNotesTabAccessForJob(
  access: NotesTabAccess | undefined,
  canAccessOnSiteTracking?: boolean
): NotesTabAccess | undefined {
  if (!access) {
    if (!canAccessOnSiteTracking) return access;
    return { general: true, office: false, onsite: true };
  }
  if (canAccessOnSiteTracking && !access.onsite) {
    return { ...access, onsite: true };
  }
  return access;
}

/**
 * Mirrors backend `can_write_note_section`: office/on-site writes do not
 * require job page write (e.g. assigned crew or default Bookkeeper for office).
 */
export function canWriteNoteSection(
  section: NoteSection,
  access: NotesTabAccess | undefined,
  options: CanWriteNoteSectionOptions
): boolean {
  if (options.globalReadOnly) return false;

  if (section === NoteSection.ONSITE) {
    return hasOnsiteNotesAccess(access, options.assignedToJob);
  }

  if (!access?.[section]) return false;

  if (section === NoteSection.GENERAL) {
    if (options.commentsReadOnly === true) return false;
    // CO&CA + job write gate (resolveCommentsReadOnly) already applied when false.
    if (options.commentsReadOnly === false) return true;
    return options.hasPageWrite;
  }

  return true;
}

/** Prefer the first section the user can post in (e.g. On-Site for assigned crew). */
export function pickInitialNoteSection(
  availableSections: NoteSection[],
  access: NotesTabAccess | undefined,
  options: CanWriteNoteSectionOptions
): NoteSection {
  const writable = availableSections.find((section) =>
    canWriteNoteSection(section, access, options)
  );
  return writable ?? availableSections[0] ?? NoteSection.GENERAL;
}
