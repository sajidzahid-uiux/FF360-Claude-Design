"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  ComponentSizeEnum,
  TabsSwitcher,
  type TabsSwitcherItem,
  cn,
} from "@fieldflow360/org-ui";
import { toast } from "sonner";

import type {
  NoteComment,
  NoteCommentPatchPayload,
  NoteCommentPostPayload,
} from "@/api/types";
import { NOTE_SECTION_LABELS, NoteSection } from "@/constants";
import { useTeamMembers } from "@/hooks/queries";
import { getErrorMessage } from "@/utils/apiError";

import { NotesCommentItem } from "./NotesCommentItem";
import { NotesComposer } from "./NotesComposer";
import { NotesSectionEmptyState } from "./NotesSectionEmptyState";
import { getCommentSection, getSectionLabel } from "./utils";

export interface NotesSectionProps {
  comments: NoteComment[];
  postComment: (payload: NoteCommentPostPayload) => Promise<NoteComment>;
  patchComment: (
    id: number,
    payload: NoteCommentPatchPayload
  ) => Promise<NoteComment>;
  deleteComment: (id: number) => Promise<number>;
  readOnly?: boolean;
  availableSections?: NoteSection[];
  activeSection?: NoteSection;
  onActiveSectionChange?: (section: NoteSection) => void;
  /** Fits inside DetailFormSection without an extra card shell. */
  embedded?: boolean;
  showTitle?: boolean;
  title?: string;
  className?: string;
}

export function NotesSection({
  comments = [],
  postComment,
  patchComment,
  deleteComment,
  readOnly = false,
  availableSections = [
    NoteSection.GENERAL,
    NoteSection.OFFICE,
    NoteSection.ONSITE,
  ],
  activeSection: activeSectionProp,
  onActiveSectionChange,
  embedded = false,
  showTitle = true,
  title = "Notes & comments",
  className,
}: NotesSectionProps) {
  const [internalActiveSection, setInternalActiveSection] =
    useState<NoteSection>(availableSections[0] ?? NoteSection.GENERAL);
  const activeSection = activeSectionProp ?? internalActiveSection;

  const setActiveSection = useCallback(
    (section: NoteSection) => {
      if (onActiveSectionChange) {
        onActiveSectionChange(section);
        return;
      }
      setInternalActiveSection(section);
    },
    [onActiveSectionChange]
  );
  const [submitting, setSubmitting] = useState(false);
  const { data: members } = useTeamMembers();

  useEffect(() => {
    if (!availableSections.includes(activeSection)) {
      setActiveSection(availableSections[0] ?? NoteSection.GENERAL);
    }
  }, [availableSections, activeSection, setActiveSection]);

  const showSectionTabs = availableSections.length > 1;
  const showSectionBadge = availableSections.length > 1;

  const visibleComments = useMemo(
    () =>
      (comments ?? []).filter((c) => getCommentSection(c) === activeSection),
    [comments, activeSection]
  );

  const sectionTabItems = useMemo(
    (): TabsSwitcherItem<NoteSection>[] =>
      availableSections.map((section) => ({
        value: section,
        label: NOTE_SECTION_LABELS[section],
      })),
    [availableSections]
  );

  const handlePost = async ({
    text,
    mentionIds,
  }: {
    text: string;
    mentionIds: number[];
  }) => {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await postComment({
        text,
        mentionIds,
        note_section: activeSection,
      });
      toast.success("Note posted");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to post note"));
    } finally {
      setSubmitting(false);
    }
  };

  const sectionSwitcher = showSectionTabs ? (
    <TabsSwitcher
      fullWidth={true}
      items={sectionTabItems}
      size={ComponentSizeEnum.SM}
      value={activeSection}
      onChange={(value) => setActiveSection(value)}
    />
  ) : null;

  const commentList = (
    <div
      className={cn(
        "min-h-[200px] min-w-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto",
        "[&::-webkit-scrollbar]:w-1.5",
        "[&::-webkit-scrollbar-thumb]:rounded-full",
        "[&::-webkit-scrollbar-thumb]:bg-border-subtle",
        "[&::-webkit-scrollbar-track]:rounded-full",
        "[&::-webkit-scrollbar-track]:bg-transparent"
      )}
    >
      {visibleComments.length === 0 ? (
        <NotesSectionEmptyState
          readOnly={readOnly}
          sectionLabel={getSectionLabel(activeSection)}
        />
      ) : (
        visibleComments.map((comment) => (
          <NotesCommentItem
            key={comment.id}
            comment={comment}
            deleteComment={deleteComment}
            members={members}
            patchComment={patchComment}
            readOnly={readOnly}
            showSectionBadge={showSectionBadge}
          />
        ))
      )}
    </div>
  );

  const body = (
    <div className="flex min-h-[320px] min-w-0 flex-1 flex-col gap-4 overflow-hidden">
      {!showTitle && !embedded ? sectionSwitcher : null}
      {commentList}
      <NotesComposer
        members={members}
        readOnly={readOnly}
        submitting={submitting}
        onSubmit={handlePost}
      />
    </div>
  );

  if (embedded) {
    return (
      <div
        className={cn("flex min-w-0 flex-col gap-4 overflow-hidden", className)}
      >
        {sectionSwitcher}
        {body}
      </div>
    );
  }

  return (
    <section
      className={cn(
        "border-border-subtle bg-bg-surface-elevated flex h-full w-full flex-1 flex-col overflow-hidden rounded-xl border",
        className
      )}
    >
      {showTitle ? (
        <header className="flex flex-row flex-wrap items-center justify-between gap-3 border-b border-transparent px-4 pt-4 pb-2 sm:px-5 sm:pt-5">
          <h3 className="text-text-primary text-lg font-semibold">{title}</h3>
          {sectionSwitcher}
        </header>
      ) : null}
      <div className="flex min-h-[320px] flex-1 flex-col px-4 pt-0 pb-4 sm:px-5 sm:pb-5">
        {body}
      </div>
    </section>
  );
}
