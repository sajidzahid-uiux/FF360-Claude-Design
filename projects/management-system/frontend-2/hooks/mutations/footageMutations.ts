import { useMutation, useQueryClient } from "@tanstack/react-query";

import { FootageService } from "@/api/services";
import type {
  FootageCommentCreateArgs,
  FootageCommentListArgs,
  FootageCommentUpdateArgs,
  FootageDailyProgressLateralArgs,
  FootageDailyProgressMainArgs,
  FootageDailyProgressRaisersArgs,
  FootageJobData,
  FootageJobIdArgs,
} from "@/api/types";
import { useMapping } from "@/hooks/useMapping";
import { resolveContentTypeId } from "@/shared/lib/contentType";

import {
  FOOTAGE_ALL_JOBS_QUERY_KEY,
  FOOTAGE_JOB_PAGE_QUERY_KEY,
} from "../queries/footageQueryKeys";
import { useRouteIds } from "../useRouteIds";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function invalidateFootage(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: [FOOTAGE_ALL_JOBS_QUERY_KEY] });
  queryClient.invalidateQueries({ queryKey: [FOOTAGE_JOB_PAGE_QUERY_KEY] });
}

// ---------------------------------------------------------------------------
// Daily-progress mutations (used by on-site tracking + footage page)
// ---------------------------------------------------------------------------

export function useAddDailyProgressLateral() {
  const queryClient = useQueryClient();
  const { orgId } = useRouteIds();

  return useMutation({
    mutationFn: (args: FootageDailyProgressLateralArgs) =>
      FootageService.addDailyProgressLateral(orgId!, args.jobId, args.data),
    onSuccess: () => invalidateFootage(queryClient),
  });
}

export function useAddDailyProgressMain() {
  const queryClient = useQueryClient();
  const { orgId } = useRouteIds();

  return useMutation({
    mutationFn: (args: FootageDailyProgressMainArgs) =>
      FootageService.addDailyProgressMain(orgId!, args.jobId, args.data),
    onSuccess: () => invalidateFootage(queryClient),
  });
}

export function useAddDailyProgressRaisers() {
  const queryClient = useQueryClient();
  const { orgId } = useRouteIds();

  return useMutation({
    mutationFn: (args: FootageDailyProgressRaisersArgs) =>
      FootageService.addDailyProgressRaisers(orgId!, args.jobId, args.data),
    onSuccess: () => invalidateFootage(queryClient),
  });
}

// ---------------------------------------------------------------------------
// Excel download
// ---------------------------------------------------------------------------

export function useGetFootageExcelFile() {
  const { orgId } = useRouteIds();

  return useMutation({
    mutationFn: ({ jobId }: FootageJobIdArgs) =>
      FootageService.getExcelFile(orgId!, jobId),
  });
}

// ---------------------------------------------------------------------------
// Single-job footage page (modal details)
// ---------------------------------------------------------------------------

export function useGetFootagePage() {
  const { orgId } = useRouteIds();

  return useMutation({
    mutationFn: (jobId: number) =>
      FootageService.getJobFootagePage(orgId!, jobId),
  });
}

// ---------------------------------------------------------------------------
// Footage comments (content-type-based generic comments API)
// ---------------------------------------------------------------------------

export function useFootageCommentMutations() {
  const queryClient = useQueryClient();
  const { orgId } = useRouteIds();
  const { data: contentTypes } = useMapping("content_types");

  const addComment = useMutation({
    mutationFn: (args: FootageCommentCreateArgs) => {
      const { jobId, text, model } = args;
      const ctId = resolveContentTypeId(contentTypes, model);
      return FootageService.addComment(orgId!, jobId, ctId, text);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [FOOTAGE_ALL_JOBS_QUERY_KEY],
      }),
  });

  const getComments = useMutation({
    mutationFn: ({ jobId, model }: FootageCommentListArgs) => {
      const ctId = resolveContentTypeId(contentTypes, model);
      return FootageService.getComments(orgId!, jobId, ctId);
    },
  });

  const updateComment = useMutation({
    mutationFn: (args: FootageCommentUpdateArgs) => {
      const { jobId, commentId, text, model } = args;
      const ctId = resolveContentTypeId(contentTypes, model);
      return FootageService.updateComment(orgId!, commentId, jobId, ctId, text);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [FOOTAGE_ALL_JOBS_QUERY_KEY],
      }),
  });

  return { addComment, getComments, updateComment };
}

// ---------------------------------------------------------------------------
// Convenience barrel: all footage mutations in one hook
// (replaces the old useFootageData() mutation object)
// ---------------------------------------------------------------------------

export function useFootageMutations() {
  const addDailyProgressLateral = useAddDailyProgressLateral();
  const addDailyProgresMain = useAddDailyProgressMain();
  const addDailyProgressRaisers = useAddDailyProgressRaisers();
  const getExcelFile = useGetFootageExcelFile();
  const getFootagePage = useGetFootagePage();
  const { addComment, getComments, updateComment } =
    useFootageCommentMutations();

  return {
    addDailyProgressLateral,
    addDailyProgresMain,
    addDailyProgressRaisers,
    getExcelFile,
    getFootagePage,
    addComment,
    getComments,
    updateComment,
  };
}

// Re-export type for callers that need FootageJobData from the mutation result
export type { FootageJobData };
