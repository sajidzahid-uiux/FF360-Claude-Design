"use client";

import { useEffect, useMemo, useState } from "react";

import type {
  NoteComment,
  NoteCommentPatchPayload,
  NoteCommentPostPayload,
  NotesExportContext,
  NotesTabAccess,
} from "@/api/types";
import { cn } from "@fieldflow360/org-ui";

import { NoteSection } from "@/constants";
import { NotesSection, type NotesSectionProps } from "@/shared/ui";
import { canWriteNoteSection, pickInitialNoteSection } from "@/utils/notes";

import { NotesExportControl } from "./NotesExportControl";

export type NotesProps = Omit<NotesSectionProps, "readOnly"> & {
  assignedToJob?: boolean;
  commentsReadOnly?: boolean;
  exportContext?: NotesExportContext;
  globalReadOnly?: boolean;
  hasPageWrite?: boolean;
  notesTabAccess?: NotesTabAccess;
  readOnly?: boolean;
  showExportControl?: boolean;
  /** Stretch to fill the parent's height so the composer pins to the bottom. */
  fillHeight?: boolean;
};

export default function Notes({
  comments = [],
  postComment,
  patchComment,
  deleteComment,
  readOnly = false,
  notesTabAccess,
  hasPageWrite = false,
  commentsReadOnly,
  globalReadOnly,
  assignedToJob = false,
  availableSections = [NoteSection.GENERAL],
  exportContext,
  embedded,
  showTitle,
  title,
  showExportControl = true,
  className,
  fillHeight = false,
}: NotesProps) {
  const noteWriteOptions = useMemo(
    () => ({
      hasPageWrite,
      globalReadOnly: globalReadOnly ?? readOnly,
      commentsReadOnly,
      assignedToJob,
    }),
    [hasPageWrite, globalReadOnly, readOnly, commentsReadOnly, assignedToJob]
  );

  const [activeSection, setActiveSection] = useState<NoteSection>(() =>
    pickInitialNoteSection(availableSections, notesTabAccess, noteWriteOptions)
  );

  useEffect(() => {
    if (!availableSections.includes(activeSection)) {
      setActiveSection(
        pickInitialNoteSection(
          availableSections,
          notesTabAccess,
          noteWriteOptions
        )
      );
    }
  }, [availableSections, activeSection, notesTabAccess, noteWriteOptions]);

  const isActiveSectionReadOnly = useMemo(
    () => !canWriteNoteSection(activeSection, notesTabAccess, noteWriteOptions),
    [activeSection, notesTabAccess, noteWriteOptions]
  );

  return (
    <div
      className={cn(fillHeight && "flex min-h-0 flex-1 flex-col", className)}
    >
      {showExportControl ? (
        <div className="mb-3 flex justify-end">
          <NotesExportControl
            availableSections={availableSections}
            exportContext={exportContext}
          />
        </div>
      ) : null}
      <NotesSection
        activeSection={activeSection}
        availableSections={availableSections}
        className={cn(fillHeight && "min-h-0 flex-1")}
        comments={comments}
        deleteComment={deleteComment}
        embedded={embedded}
        patchComment={patchComment}
        postComment={postComment}
        readOnly={isActiveSectionReadOnly}
        showTitle={showTitle}
        title={title}
        onActiveSectionChange={setActiveSection}
      />
    </div>
  );
}

export type { NoteComment, NoteCommentPatchPayload, NoteCommentPostPayload };
