import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import {
  COMMENT_CONTENT_TYPE_MODEL,
  CommentsService,
} from "@/api/services/commentsService";
import { FilesService } from "@/api/services/filesService";
import type { FileAttachment, NoteComment, NotesTabAccess } from "@/api/types";
import { CACHE_TIME, QUERY_KEYS } from "@/constants";
import { JobType, type NoteSection } from "@/constants/enums";
import { ALL_NOTE_SECTIONS, getAllowedNoteSections } from "@/utils/notes";

import { useMapping } from "../useMapping";
import { useRouteIds } from "../useRouteIds";

function sectionsQueryKey(sections: NoteSection[]): string {
  return [...sections].sort().join(",");
}

export function jobFilesQueryKey(
  organizationId: string | null | undefined,
  jobType: JobType,
  jobId: string | number
) {
  return [QUERY_KEYS.FILES, "job", organizationId, jobType, jobId] as const;
}

export function jobCommentsQueryKey(
  organizationId: string | null | undefined,
  jobType: JobType,
  jobId: string | number
) {
  return [QUERY_KEYS.COMMENTS, "job", organizationId, jobType, jobId] as const;
}

export function useJobFilesQuery(
  jobId: string | number,
  jobType: JobType,
  enabled = true
) {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<FileAttachment[]>({
    queryKey: jobFilesQueryKey(organizationId, jobType, jobId),
    queryFn: async () => {
      if (!organizationId) throw new Error("Organization ID is required");
      return FilesService.getJobFiles(organizationId, jobType, jobId);
    },
    enabled: !!organizationId && !!jobId && enabled,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
}

export function useJobCommentsQuery(
  jobId: string | number,
  jobType: JobType,
  notesTabAccess?: NotesTabAccess,
  enabled = true
) {
  const { orgId: organizationId } = useRouteIds();
  const { data: contentTypes } = useMapping("content_types");
  const contentTypeId = useMemo(
    () =>
      contentTypes?.find(
        (type: { id: number; model: string }) =>
          type.model === COMMENT_CONTENT_TYPE_MODEL.job
      )?.id,
    [contentTypes]
  );
  const sections = useMemo(
    () =>
      notesTabAccess
        ? getAllowedNoteSections(notesTabAccess)
        : ALL_NOTE_SECTIONS,
    [notesTabAccess]
  );
  const sectionsKey = sectionsQueryKey(sections);

  return useQuery<NoteComment[]>({
    queryKey: [
      ...jobCommentsQueryKey(organizationId, jobType, jobId),
      sectionsKey,
    ],
    queryFn: async () => {
      if (!organizationId || contentTypeId === undefined) {
        throw new Error("Organization ID and content type are required");
      }
      return CommentsService.listBySections(
        organizationId,
        contentTypeId,
        jobId,
        sections
      );
    },
    enabled:
      !!organizationId &&
      !!jobId &&
      contentTypeId !== undefined &&
      enabled &&
      sections.length > 0,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
}
