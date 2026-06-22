import { describe, expect, it } from "vitest";

import type { NoteComment } from "@/api/types";

import { mergeNoteCommentsById } from "../noteSectionComments";

function comment(id: number): NoteComment {
  return {
    id,
    text: `note-${id}`,
    created_at: "2026-01-01T00:00:00Z",
  };
}

describe("mergeNoteCommentsById", () => {
  it("deduplicates comments by id across batches", () => {
    const merged = mergeNoteCommentsById([
      [comment(1), comment(2)],
      [comment(2), comment(3)],
    ]);
    expect(merged.map((c) => c.id)).toEqual([1, 2, 3]);
  });

  it("returns empty array when all batches are empty", () => {
    expect(mergeNoteCommentsById([])).toEqual([]);
  });
});
