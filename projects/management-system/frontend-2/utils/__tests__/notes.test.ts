import { describe, expect, it } from "vitest";

import { NoteSection } from "@/constants";

import {
  canWriteNoteSection,
  getAllowedNoteSections,
  getOnsiteNotesTabAccess,
  pickInitialNoteSection,
  resolveNotesTabAccessForJob,
} from "../notes";

describe("getOnsiteNotesTabAccess", () => {
  it("returns only onsite when user has onsite access", () => {
    expect(
      getAllowedNoteSections(
        getOnsiteNotesTabAccess({
          general: true,
          office: true,
          onsite: true,
        })
      )
    ).toEqual([NoteSection.ONSITE]);
  });

  it("returns no sections when onsite is false", () => {
    expect(
      getAllowedNoteSections(
        getOnsiteNotesTabAccess({
          general: true,
          office: false,
          onsite: false,
        })
      )
    ).toEqual([]);
  });
});

describe("canWriteNoteSection", () => {
  const bookkeeperOfficeAccess = {
    general: true,
    office: true,
    onsite: false,
  };

  it("allows office writes without job page write (bookkeeper)", () => {
    expect(
      canWriteNoteSection(NoteSection.OFFICE, bookkeeperOfficeAccess, {
        hasPageWrite: false,
      })
    ).toBe(true);
  });

  it("blocks general notes when commentsReadOnly is unset and hasPageWrite is false", () => {
    const access = { general: true, office: true, onsite: false };
    expect(
      canWriteNoteSection(NoteSection.GENERAL, access, {
        hasPageWrite: false,
      })
    ).toBe(false);
  });

  it("requires page write for general notes", () => {
    expect(
      canWriteNoteSection(NoteSection.GENERAL, bookkeeperOfficeAccess, {
        hasPageWrite: false,
      })
    ).toBe(false);
    expect(
      canWriteNoteSection(NoteSection.GENERAL, bookkeeperOfficeAccess, {
        hasPageWrite: true,
      })
    ).toBe(true);
  });

  it("blocks all sections when globally read-only", () => {
    expect(
      canWriteNoteSection(NoteSection.OFFICE, bookkeeperOfficeAccess, {
        hasPageWrite: true,
        globalReadOnly: true,
      })
    ).toBe(false);
  });

  it("allows general notes when commentsReadOnly is false without hasPageWrite", () => {
    expect(
      canWriteNoteSection(NoteSection.GENERAL, bookkeeperOfficeAccess, {
        hasPageWrite: false,
        commentsReadOnly: false,
      })
    ).toBe(true);
  });

  it("blocks general notes when commentsReadOnly is true on CO&CA", () => {
    expect(
      canWriteNoteSection(NoteSection.GENERAL, bookkeeperOfficeAccess, {
        hasPageWrite: true,
        commentsReadOnly: true,
      })
    ).toBe(false);
  });

  it("allows on-site notes for assigned crew without job page write", () => {
    const assignedCrewAccess = {
      general: true,
      office: false,
      onsite: true,
    };
    expect(
      canWriteNoteSection(NoteSection.ONSITE, assignedCrewAccess, {
        hasPageWrite: false,
        commentsReadOnly: true,
      })
    ).toBe(true);
    expect(
      canWriteNoteSection(NoteSection.GENERAL, assignedCrewAccess, {
        hasPageWrite: false,
        commentsReadOnly: true,
      })
    ).toBe(false);
  });

  it("allows on-site write when assignedToJob even if notesTabAccess.onsite is false", () => {
    expect(
      canWriteNoteSection(
        NoteSection.ONSITE,
        { general: true, office: false, onsite: false },
        { hasPageWrite: false, assignedToJob: true }
      )
    ).toBe(true);
  });
});

describe("resolveNotesTabAccessForJob", () => {
  it("enables onsite tab when canAccessOnSiteTracking is true", () => {
    expect(
      resolveNotesTabAccessForJob(
        { general: true, office: false, onsite: false },
        true
      )
    ).toEqual({ general: true, office: false, onsite: true });
  });

  it("includes general read for assigned users when notesTabAccess is missing", () => {
    expect(resolveNotesTabAccessForJob(undefined, true)).toEqual({
      general: true,
      office: false,
      onsite: true,
    });
  });
});

describe("pickInitialNoteSection", () => {
  it("defaults bookkeeper to office when general is read-only", () => {
    const access = { general: true, office: true, onsite: false };
    expect(
      pickInitialNoteSection(
        [NoteSection.GENERAL, NoteSection.OFFICE],
        access,
        { hasPageWrite: false }
      )
    ).toBe(NoteSection.OFFICE);
  });

  it("defaults assigned crew to on-site when general notes are read-only", () => {
    const access = { general: true, office: false, onsite: true };
    expect(
      pickInitialNoteSection(
        [NoteSection.GENERAL, NoteSection.ONSITE],
        access,
        { hasPageWrite: false, commentsReadOnly: true }
      )
    ).toBe(NoteSection.ONSITE);
  });

  it("keeps general available for assigned read-only users in section list", () => {
    const access = resolveNotesTabAccessForJob(
      { general: true, office: false, onsite: false },
      true
    );
    expect(getAllowedNoteSections(access)).toEqual([
      NoteSection.GENERAL,
      NoteSection.ONSITE,
    ]);
    expect(
      canWriteNoteSection(NoteSection.GENERAL, access, {
        hasPageWrite: false,
        commentsReadOnly: true,
      })
    ).toBe(false);
    expect(
      canWriteNoteSection(NoteSection.ONSITE, access, {
        hasPageWrite: false,
        assignedToJob: true,
      })
    ).toBe(true);
  });
});
