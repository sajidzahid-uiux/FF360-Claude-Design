import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  COMMENT_CONTENT_TYPE_MODEL,
  resolveCommentContentTypeId,
} from "@/api/services/commentsService";
import { FilesService } from "@/api/services/filesService";
import type { LeadId } from "@/api/types";
import type { FileUploadWithProgressPayload } from "@/api/types/files";
import { LeadType } from "@/constants/enums";

import {
  leadFilesQueryKey,
  useLeadFilesQuery,
} from "../queries/useLeadFilesQueries";
import { useMapping } from "../useMapping";
import { useRouteIds } from "../useRouteIds";

export function useLeadFileMutations(leadId: LeadId, leadType: LeadType) {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();
  const { data: contentTypes } = useMapping("content_types");

  const filesKey = leadFilesQueryKey(organizationId, leadType, leadId);

  const uploadFile = useMutation({
    mutationFn: async ({
      file,
      title,
      description = "",
      onProgress,
    }: FileUploadWithProgressPayload) => {
      if (!organizationId) throw new Error("Organization ID is required");
      const contentTypeId = resolveCommentContentTypeId(
        contentTypes,
        COMMENT_CONTENT_TYPE_MODEL.lead
      );
      return FilesService.uploadLeadFile(
        organizationId,
        leadType,
        leadId,
        contentTypeId,
        {
          file,
          title,
          description,
        },
        onProgress
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: filesKey });
    },
  });

  const deleteFile = useMutation({
    mutationFn: async (fileId: number | string) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return FilesService.deleteLeadFile(
        organizationId,
        leadType,
        leadId,
        fileId
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: filesKey });
    },
  });

  return {
    uploadFile,
    deleteFile,
  };
}

export function useLeadFiles(leadId: LeadId, leadType: LeadType) {
  const filesQuery = useLeadFilesQuery(leadId, leadType);
  const { uploadFile, deleteFile } = useLeadFileMutations(leadId, leadType);

  return {
    ...filesQuery,
    postFile: uploadFile,
    deleteFile,
  };
}

/** @deprecated Use useLeadFiles with an explicit leadType. */
export function useDrainageLeadFiles(leadId: LeadId, leadType: LeadType) {
  return useLeadFiles(leadId, leadType);
}
