import type { NotesExportResourceKind, NotesExportType } from "@/api/types";
import { NOTE_SECTION_LABELS, NoteSection } from "@/constants";

export interface NotesExportOption {
  id: NotesExportType;
  label: string;
}

export function getNotesExportOptions(
  resourceKind: NotesExportResourceKind,
  availableSections: NoteSection[]
): NotesExportOption[] {
  if (resourceKind === "equipment") {
    return [{ id: "all", label: "All" }];
  }

  const options: NotesExportOption[] = [{ id: "all", label: "All" }];

  for (const section of availableSections) {
    if (options.some((option) => option.id === section)) continue;
    options.push({
      id: section,
      label: NOTE_SECTION_LABELS[section],
    });
  }

  return options;
}
