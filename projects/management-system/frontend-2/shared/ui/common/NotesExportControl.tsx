"use client";

import { useCallback, useMemo } from "react";

import { Button, ButtonVariantEnum } from "@fieldflow360/org-ui";
import { Download } from "lucide-react";
import { toast } from "sonner";

import type { NotesExportContext, NotesExportType } from "@/api/types";
import { NoteSection } from "@/constants";
import { useExportNotesPdf } from "@/hooks/mutations/useExportNotesPdf";
import { getNotesExportOptions } from "@/shared/lib/notesExportOptions";
import { Dropdown } from "@/shared/ui/common";
import { getErrorMessage } from "@/utils/apiError";

export interface NotesExportControlProps {
  exportContext?: NotesExportContext;
  availableSections?: NoteSection[];
  className?: string;
}

const downloadIcon = <Download aria-hidden className="h-5 w-5" />;

export function NotesExportControl({
  exportContext,
  availableSections = [NoteSection.GENERAL],
  className,
}: NotesExportControlProps) {
  const exportNotesPdf = useExportNotesPdf(exportContext);

  const exportOptions = useMemo(
    () =>
      exportContext
        ? getNotesExportOptions(exportContext.resourceKind, availableSections)
        : [],
    [availableSections, exportContext]
  );

  const handleExportNotes = useCallback(
    (exportType: NotesExportType) => {
      exportNotesPdf.mutate(exportType, {
        onSuccess: () => toast.success("Notes exported successfully"),
        onError: (error: unknown) =>
          toast.error(getErrorMessage(error, "Failed to export notes")),
      });
    },
    [exportNotesPdf]
  );

  if (!exportContext || exportOptions.length === 0) {
    return null;
  }

  const exportButton = (
    <Button
      iconOnly
      aria-label="Export notes to PDF"
      className={className}
      disabled={exportNotesPdf.isPending}
      leftIcon={downloadIcon}
      loading={exportNotesPdf.isPending}
      variant={ButtonVariantEnum.GHOST}
      onClick={
        exportOptions.length === 1
          ? () => handleExportNotes(exportOptions[0].id)
          : undefined
      }
    />
  );

  if (exportOptions.length === 1) {
    return exportButton;
  }

  return (
    <Dropdown
      align="end"
      disabled={exportNotesPdf.isPending}
      items={exportOptions.map((option) => ({
        id: option.id,
        label: option.label,
        onSelect: () => handleExportNotes(option.id),
      }))}
      trigger={exportButton}
      width={140}
    />
  );
}
