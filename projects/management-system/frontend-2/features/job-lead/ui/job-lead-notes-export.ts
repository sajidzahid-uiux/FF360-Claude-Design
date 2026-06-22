import type { NotesExportContext } from "@/api/types";
import { ResourceType } from "@/constants";
import type { NoteSection } from "@/constants";
import {
  getAllowedNoteSections,
  resolveNotesTabAccessForJob,
} from "@/utils/notes";

import type { JobLeadNotesPanelProps } from "./JobLeadNotesPanel";

export function getJobLeadNotesExportProps({
  entityType,
  entityDataState,
}: Pick<JobLeadNotesPanelProps, "entityType" | "entityDataState">): {
  exportContext: NotesExportContext | undefined;
  availableSections: NoteSection[];
} {
  const notesTabAccess = resolveNotesTabAccessForJob(
    entityDataState.notesTabAccess,
    entityDataState.canAccessOnSiteTracking
  );

  return {
    exportContext: entityDataState.id
      ? {
          resourceKind: entityType === ResourceType.LEAD ? "lead" : "job",
          objectId: entityDataState.id,
        }
      : undefined,
    availableSections: getAllowedNoteSections(notesTabAccess),
  };
}
