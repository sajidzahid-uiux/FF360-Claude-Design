import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";
import type { NoteComment } from "@/api/types";
import type { NoteSection } from "@/constants";

/** Merge comment batches from multiple note sections, deduplicating by id. */
export function mergeNoteCommentsById(batches: NoteComment[][]): NoteComment[] {
  const seen = new Set<number>();
  const merged: NoteComment[] = [];
  for (const batch of batches) {
    for (const comment of batch) {
      if (!seen.has(comment.id)) {
        seen.add(comment.id);
        merged.push(comment);
      }
    }
  }
  return merged;
}

/** Fetch comments only for the note sections the user is allowed to access. */
export async function fetchCommentsAcrossNoteSections(
  organization: string,
  contentTypeId: number,
  objectId: string | number,
  sections: NoteSection[]
): Promise<NoteComment[]> {
  if (sections.length === 0) return [];

  const endpoint = API_ENDPOINTS.organizations.comments(organization);
  const batches = await Promise.all(
    sections.map((note_section) =>
      apiClient.get<NoteComment[]>(endpoint, {
        params: {
          content_type: contentTypeId,
          object_id: objectId,
          note_section,
        },
      })
    )
  );

  return mergeNoteCommentsById(batches);
}
