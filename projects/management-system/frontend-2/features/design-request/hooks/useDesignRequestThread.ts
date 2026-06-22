"use client";

import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/api/client";
import { DesignRequestService } from "@/api/services";
import type { DesignRequestPanelTab } from "@/api/types/designRequest";
import { QUERY_KEYS } from "@/constants";

export function useDesignRequestThread(
  organizationId: string | undefined,
  requestId: number | null,
  options: {
    enabled: boolean;
    activeTab: DesignRequestPanelTab;
    loadThread: boolean;
  }
) {
  const threadEnabled =
    options.enabled &&
    requestId != null &&
    options.loadThread &&
    (options.activeTab === "chat" ||
      options.activeTab === "files" ||
      options.activeTab === "details");

  const notesQuery = useQuery({
    queryKey: [QUERY_KEYS.DESIGN_REQUEST_NOTES, organizationId, requestId],
    queryFn: () => DesignRequestService.listNotes(organizationId!, requestId!),
    enabled: threadEnabled && Boolean(organizationId),
  });

  const sharedOutputQuery = useQuery({
    queryKey: [
      QUERY_KEYS.DESIGN_REQUEST_SHARED_OUTPUT,
      organizationId,
      requestId,
    ],
    queryFn: () =>
      DesignRequestService.getSharedOutput(organizationId!, requestId!),
    enabled:
      threadEnabled && Boolean(organizationId) && options.activeTab === "files",
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

  return {
    notes: notesQuery.data ?? [],
    notesLoading: notesQuery.isLoading,
    refetchNotes: notesQuery.refetch,
    sharedOutput: sharedOutputQuery.data,
    sharedOutputLoading: sharedOutputQuery.isLoading,
    sharedOutputError:
      sharedOutputQuery.isError && !sharedOutputForbidden
        ? sharedOutputQuery.error
        : null,
    sharedOutputForbidden,
    refetchSharedOutput: sharedOutputQuery.refetch,
  };
}
