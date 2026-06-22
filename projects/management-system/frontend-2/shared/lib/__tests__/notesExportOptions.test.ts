import { describe, expect, it } from "vitest";

import { NoteSection } from "@/constants";
import { getNotesExportOptions } from "@/shared/lib/notesExportOptions";

describe("getNotesExportOptions", () => {
  it("returns only all for equipment", () => {
    expect(getNotesExportOptions("equipment", [NoteSection.GENERAL])).toEqual([
      { id: "all", label: "All" },
    ]);
  });

  it("includes all and each available section for jobs", () => {
    expect(
      getNotesExportOptions("job", [
        NoteSection.GENERAL,
        NoteSection.OFFICE,
        NoteSection.ONSITE,
      ])
    ).toEqual([
      { id: "all", label: "All" },
      { id: NoteSection.GENERAL, label: "General" },
      { id: NoteSection.OFFICE, label: "Office" },
      { id: NoteSection.ONSITE, label: "On-Site" },
    ]);
  });

  it("dedupes sections already covered by all", () => {
    expect(getNotesExportOptions("lead", [NoteSection.GENERAL])).toEqual([
      { id: "all", label: "All" },
      { id: NoteSection.GENERAL, label: "General" },
    ]);
  });
});
