import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import {
  COMMENT_CONTENT_TYPE_MODEL,
  CommentsService,
} from "@/api/services/commentsService";
import { FilesService } from "@/api/services/filesService";
import type { FileAttachment, NoteComment, NotesTabAccess } from "@/api/types";
import { CACHE_TIME, QUERY_KEYS } from "@/constants";
import { LeadType, type NoteSection } from "@/constants/enums";
import { ALL_NOTE_SECTIONS, getAllowedNoteSections } from "@/utils/notes";

import { useMapping } from "../useMapping";
import { useRouteIds } from "../useRouteIds";

function sectionsQueryKey(sections: NoteSection[]): string {
  return [...sections].sort().join(",");
}

export function leadFilesQueryKey(
  organizationId: string | null | undefined,
  leadType: LeadType,
  leadId: string | number
) {
  return [QUERY_KEYS.FILES, "lead", organizationId, leadType, leadId] as const;
}

export function leadCommentsQueryKey(
  organizationId: string | null | undefined,
  leadType: LeadType,
  leadId: string | number
) {
  return [
    QUERY_KEYS.COMMENTS,
    "lead",
    organizationId,
    leadType,
    leadId,
  ] as const;
}

export function useLeadFilesQuery(
  leadId: string | number,
  leadType: LeadType,
  enabled = true
) {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<FileAttachment[]>({
    queryKey: leadFilesQueryKey(organizationId, leadType, leadId),
    queryFn: async () => {
      if (!organizationId) throw new Error("Organization ID is required");
      return FilesService.getLeadFiles(organizationId, leadType, leadId);
    },
    enabled: !!organizationId && !!leadId && enabled,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
}

export function useLeadCommentsQuery(
  leadId: string | number,
  leadType: LeadType,
  notesTabAccess?: NotesTabAccess,
  enabled = true
) {
  const { orgId: organizationId } = useRouteIds();
  const { data: contentTypes } = useMapping("content_types");
  const contentTypeId = useMemo(
    () =>
      contentTypes?.find(
        (type: { id: number; model: string }) =>
          type.model === COMMENT_CONTENT_TYPE_MODEL.lead
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
      ...leadCommentsQueryKey(organizationId, leadType, leadId),
      sectionsKey,
    ],
    queryFn: async () => {
      if (!organizationId || contentTypeId === undefined) {
        throw new Error("Organization ID and content type are required");
      }
      return CommentsService.listBySections(
        organizationId,
        contentTypeId,
        leadId,
        sections
      );
    },
    enabled:
      !!organizationId &&
      !!leadId &&
      contentTypeId !== undefined &&
      enabled &&
      sections.length > 0,
    staleTime: CACHE_TIME.STALE,
    gcTime: CACHE_TIME.GC,
  });
}
