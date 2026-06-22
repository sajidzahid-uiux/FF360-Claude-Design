import { useMutation } from "@tanstack/react-query";

import {
  COMMENT_CONTENT_TYPE_MODEL,
  CommentsService,
  resolveCommentContentTypeId,
} from "@/api/services/commentsService";
import type { NotesExportContext, NotesExportType } from "@/api/types";
import { triggerBlobDownload } from "@/shared/lib/triggerBlobDownload";

import { useMapping } from "../useMapping";
import { useRouteIds } from "../useRouteIds";

function resolveContentTypeModel(
  resourceKind: NotesExportContext["resourceKind"]
) {
  switch (resourceKind) {
    case "lead":
      return COMMENT_CONTENT_TYPE_MODEL.lead;
    case "job":
      return COMMENT_CONTENT_TYPE_MODEL.job;
    case "equipment":
      return COMMENT_CONTENT_TYPE_MODEL.equipment;
  }
}

export function useExportNotesPdf(exportContext?: NotesExportContext) {
  const { orgId: organizationId } = useRouteIds();
  const { data: contentTypes } = useMapping("content_types");

  return useMutation({
    mutationFn: async (exportType: NotesExportType) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      if (!exportContext) {
        throw new Error("Export context is required");
      }

      const contentTypeId = resolveCommentContentTypeId(
        contentTypes,
        resolveContentTypeModel(exportContext.resourceKind)
      );

      const { blob, filename } = await CommentsService.exportNotesPdf(
        organizationId,
        {
          content_type: contentTypeId,
          object_id: exportContext.objectId,
          export_type: exportType,
        }
      );

      triggerBlobDownload(blob, filename ?? `notes-${exportType}.pdf`);
    },
  });
}
