import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { NoteSection, ResourceType } from "@/constants";
import type { EntityDataState } from "@/features/job-lead/ui/show-more-card/entityDataState";
import type { CommentsHookResult } from "@/features/job-lead/ui/show-more-card/types";

import {
  JobLeadNotesPanel,
  type JobLeadNotesPanelProps,
} from "../JobLeadNotesPanel";

const notesPropsSpy = vi.fn();

vi.mock("@/shared/ui/common", () => ({
  Notes: (props: Record<string, unknown>) => {
    notesPropsSpy(props);
    return null;
  },
}));

function createCommentsHookMock(): CommentsHookResult {
  return {
    data: [],
    postComment: { mutateAsync: vi.fn() },
    patchComment: { mutateAsync: vi.fn() },
    deleteComment: { mutateAsync: vi.fn() },
  } as unknown as CommentsHookResult;
}

const baseEntityDataState = {
  id: 42,
  notesTabAccess: { general: true, office: true, onsite: false },
  canAccessOnSiteTracking: false,
} as EntityDataState;

const baseProps: JobLeadNotesPanelProps = {
  entityType: ResourceType.JOB,
  entityDataState: baseEntityDataState,
  comments: [],
  commentsHook: createCommentsHookMock(),
  commentsReadOnly: false,
  isDisabled: false,
  canEdit: true,
  canEditLeadPage: false,
};

describe("JobLeadNotesPanel permissions", () => {
  it("forwards job write and section access to Notes", () => {
    notesPropsSpy.mockClear();

    render(<JobLeadNotesPanel {...baseProps} />);

    expect(notesPropsSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        hasPageWrite: true,
        commentsReadOnly: false,
        readOnly: false,
        globalReadOnly: undefined,
        notesTabAccess: baseEntityDataState.notesTabAccess,
        availableSections: [NoteSection.GENERAL, NoteSection.OFFICE],
      })
    );
  });

  it("blocks writes when page is disabled and CO&CA comments are read-only", () => {
    notesPropsSpy.mockClear();

    render(
      <JobLeadNotesPanel
        {...baseProps}
        commentsReadOnly
        isDisabled
        isTrashed
        toggleArchive
        canEdit={false}
      />
    );

    expect(notesPropsSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        hasPageWrite: false,
        commentsReadOnly: true,
        readOnly: true,
        globalReadOnly: true,
      })
    );
  });

  it("uses lead page write and merges onsite access for assigned crew", () => {
    notesPropsSpy.mockClear();

    render(
      <JobLeadNotesPanel
        {...baseProps}
        canEditLeadPage
        canEdit={false}
        entityDataState={
          {
            ...baseEntityDataState,
            canAccessOnSiteTracking: true,
          } as EntityDataState
        }
        entityType={ResourceType.LEAD}
      />
    );

    expect(notesPropsSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        hasPageWrite: true,
        assignedToJob: true,
        notesTabAccess: {
          general: true,
          office: true,
          onsite: true,
        },
        exportContext: {
          resourceKind: "lead",
          objectId: 42,
        },
      })
    );
  });
});
