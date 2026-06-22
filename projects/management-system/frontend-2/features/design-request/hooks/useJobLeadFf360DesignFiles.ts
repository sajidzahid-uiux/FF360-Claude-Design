"use client";

import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/api/client";
import { DesignRequestService } from "@/api/services";
import type {
  DesignRequestNoteFile,
  DesignRequestSourceType,
  DesignRequestThreadItem,
  SharedDesignFile,
} from "@/api/types/designRequest";
import { QUERY_KEYS } from "@/constants";

import { pickLatestDesignRequestStatus } from "../lib/pick-latest-design-request-status";
import { useDesignRequestAccess } from "./useDesignRequestAccess";
import { useDesignRequestTargetStatus } from "./useDesignRequestTargetStatus";

export type Ff360DesignFileSource = "shared" | "thread";

export interface Ff360DesignFileItem {
  id: string;
  source: Ff360DesignFileSource;
  fileType: SharedDesignFile["file_type"] | "attachment";
  originalFilename: string;
  downloadUrl: string | null;
  fileSizeBytes: number | null;
  postedByName?: string;
  ingestStatus?: SharedDesignFile["ingest_status"];
  errorMessage?: string | null;
  noteId?: number;
  canDelete?: boolean;
}

function threadFilesFromNote(
  note: DesignRequestThreadItem
): DesignRequestNoteFile[] {
  return [...(note.file ? [note.file] : []), ...note.extra_files];
}

function mapSharedFile(file: SharedDesignFile): Ff360DesignFileItem {
  return {
    id: `shared-${file.file_type}-${file.original_filename}`,
    source: "shared",
    fileType: file.file_type,
    originalFilename: file.original_filename,
    downloadUrl: file.download_url,
    fileSizeBytes: file.file_size_bytes,
    ingestStatus: file.ingest_status,
    errorMessage: file.error_message,
  };
}

function mapThreadFile(
  note: DesignRequestThreadItem,
  file: DesignRequestNoteFile
): Ff360DesignFileItem {
  return {
    id: `thread-${note.id ?? "initial"}-${file.original_filename}`,
    source: "thread",
    fileType: "attachment",
    originalFilename: file.original_filename,
    downloadUrl: file.download_url,
    fileSizeBytes: file.file_size_bytes,
    postedByName: note.posted_by_name,
    noteId: note.id ?? undefined,
    canDelete: note.can_delete,
  };
}

export function useJobLeadFf360DesignFiles(
  organizationId: string | undefined,
  sourceType: DesignRequestSourceType | undefined,
  sourceId: number | undefined,
  enabled: boolean
) {
  const {
    canView,
    canSubmit,
    isLoading: accessLoading,
  } = useDesignRequestAccess();
  const active =
    enabled && canView && Boolean(organizationId && sourceType && sourceId);

  const statusQuery = useDesignRequestTargetStatus(
    organizationId,
    sourceType,
    sourceId,
    active
  );

  const statusItem = useMemo(
    () => pickLatestDesignRequestStatus(statusQuery.data ?? []),
    [statusQuery.data]
  );
  const requestId = statusItem?.id ?? null;

  const notesQuery = useQuery({
    queryKey: [QUERY_KEYS.DESIGN_REQUEST_NOTES, organizationId, requestId],
    queryFn: () => DesignRequestService.listNotes(organizationId!, requestId!),
    enabled: active && requestId != null,
  });

  const sharedOutputQuery = useQuery({
    queryKey: [
      QUERY_KEYS.DESIGN_REQUEST_SHARED_OUTPUT,
      organizationId,
      requestId,
    ],
    queryFn: () =>
      DesignRequestService.getSharedOutput(organizationId!, requestId!),
    enabled: active && requestId != null,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 403) {
        return false;
      }
      return failureCount < 1;
    },
  });

  const sharedOutputForbidden =
    sharedOutputQuery.error instanceof ApiError &&
    sharedOutputQuery.error.status === 403;

  const files = useMemo(() => {
    const items: Ff360DesignFileItem[] = [];
    for (const file of sharedOutputQuery.data?.files ?? []) {
      items.push(mapSharedFile(file));
    }
    for (const note of notesQuery.data ?? []) {
      for (const file of threadFilesFromNote(note)) {
        items.push(mapThreadFile(note, file));
      }
    }
    return items;
  }, [notesQuery.data, sharedOutputQuery.data?.files]);

  const loading =
    accessLoading ||
    statusQuery.isLoading ||
    (requestId != null &&
      (notesQuery.isLoading || sharedOutputQuery.isLoading));

  return {
    canView,
    canSubmit,
    statusItem,
    requestId,
    files,
    loading,
    sharedOutput: sharedOutputQuery.data,
    sharedOutputForbidden,
    sharedOutputError:
      sharedOutputQuery.isError && !sharedOutputForbidden
        ? sharedOutputQuery.error
        : null,
    refetchFiles: () => {
      void notesQuery.refetch();
      void sharedOutputQuery.refetch();
    },
  };
}
