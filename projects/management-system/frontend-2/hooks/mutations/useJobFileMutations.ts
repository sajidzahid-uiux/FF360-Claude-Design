import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  COMMENT_CONTENT_TYPE_MODEL,
  resolveCommentContentTypeId,
} from "@/api/services/commentsService";
import { FilesService } from "@/api/services/filesService";
import type { JobId } from "@/api/types";
import type { FileUploadWithProgressPayload } from "@/api/types/files";
import { JobType } from "@/constants/enums";

import {
  jobFilesQueryKey,
  useJobFilesQuery,
} from "../queries/useJobFilesQueries";
import { useMapping } from "../useMapping";
import { useRouteIds } from "../useRouteIds";

export function useJobFileMutations(jobId: JobId, jobType: JobType) {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();
  const { data: contentTypes } = useMapping("content_types");

  const filesKey = jobFilesQueryKey(organizationId, jobType, jobId);

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
        COMMENT_CONTENT_TYPE_MODEL.job
      );
      return FilesService.uploadJobFile(
        organizationId,
        jobType,
        jobId,
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
      return FilesService.deleteJobFile(organizationId, jobType, jobId, fileId);
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

export function useJobFiles(jobId: JobId, jobType: JobType) {
  const filesQuery = useJobFilesQuery(jobId, jobType);
  const { uploadFile, deleteFile } = useJobFileMutations(jobId, jobType);

  return {
    ...filesQuery,
    postFile: uploadFile,
    deleteFile,
  };
}
