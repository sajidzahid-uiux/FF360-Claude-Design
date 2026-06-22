"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";

import { ComponentSizeEnum, Loader } from "@fieldflow360/org-ui";
import { toast } from "sonner";

import type { Job, TeamMember } from "@/api/types";
import { JobType } from "@/constants";
import { useCompletedJobByIdWithTypeFallback } from "@/features/completed/hooks/useCompletedJobByIdWithTypeFallback";
import type { EntityDataState } from "@/features/job-lead/ui/show-more-card/exports";
import ExcavationShowMoreCard from "@/features/job-lead/ui/show-more/JobExcavationShowMoreCardWrapper";
import RepairShowMoreCard from "@/features/job-lead/ui/show-more/JobRepairShowMoreCardWrapper";
import TilingShowMoreCard from "@/features/job-lead/ui/show-more/JobTilingShowMoreCardWrapper";
import { useRouteIds, useTeamData } from "@/hooks";
import {
  useArchiveJob,
  useTrashAndDeleteJob,
  useUnarchiveJob,
} from "@/hooks/mutations";
import { getHttpErrorStatus } from "@/lib/utils";
import { orgPath } from "@/shared/config/routes";
import { ResourceErrorView } from "@/shared/ui/common";
import { getErrorMessage } from "@/utils/apiError";

export default function CompletedJobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { orgId } = useRouteIds();
  const { data: teamData } = useTeamData();
  const archiveJob = useArchiveJob();
  const unarchiveJob = useUnarchiveJob();
  const trashAndDeleteJob = useTrashAndDeleteJob();

  const jobId = params.id as string;
  const isArchived = searchParams.get("archived") === "true";

  const rawTypeParam = searchParams.get("type");
  const { jobData, resolvedJobType, isLoading, allQueriesFinished, error } =
    useCompletedJobByIdWithTypeFallback({
      orgId,
      jobId,
      isArchived,
      rawTypeParam,
    });

  const handleArchiveJob = async (jobDataArg: EntityDataState) => {
    if (!jobDataArg.id) return;

    try {
      if (isArchived) {
        await unarchiveJob.mutateAsync({
          id: jobDataArg.id,
          jobType: resolvedJobType,
        });
      } else {
        await archiveJob.mutateAsync({
          id: jobDataArg.id,
          jobType: resolvedJobType,
        });
      }

      // Navigate back to completed page
      if (orgId) router.push(orgPath(orgId, `/completed`));
    } catch (error: unknown) {
      console.error("Failed to archive/unarchive job:", error);
      toast.error(getErrorMessage(error, "Failed to archive/unarchive job"));
    }
  };

  const handleDeleteJob = async (jobDataArg: EntityDataState) => {
    if (!jobDataArg.id) return;
    try {
      await trashAndDeleteJob.mutateAsync({
        id: jobDataArg.id,
        jobType: resolvedJobType,
      });

      toast.success("Job deleted successfully");
      if (orgId) router.push(orgPath(orgId, `/completed`));
    } catch (error: unknown) {
      console.error("Failed to delete job:", error);
      toast.error(getErrorMessage(error, "Failed to delete job"));
    }
  };

  const handleClose = () => {
    if (orgId) router.push(orgPath(orgId, `/completed`));
  };

  if (isLoading && !jobData) {
    return (
      <Loader
        className="min-h-screen"
        size={ComponentSizeEnum.LG}
        text="Loading job details..."
      />
    );
  }

  if (!jobData && allQueriesFinished) {
    const status = getHttpErrorStatus(error);
    return (
      <ResourceErrorView orgId={orgId} resourceLabel="job" status={status} />
    );
  }

  if (!jobData) {
    return null;
  }

  // Transform job data to include last_updated_by username
  const transformedJobData: Job = {
    ...jobData,
    last_updated_by:
      teamData?.find(
        (t: TeamMember) => String(t.id) === String(jobData.last_updated_by)
      )?.user?.username ?? jobData.last_updated_by,
  };

  const isJobArchived = isArchived;

  const handleDeleteFromModel = (params?: { model: string; id: number }) => {
    if (!params?.id) return;
    void handleDeleteJob({ id: params.id });
  };

  // Determine which ShowMoreCard to render based on jobType or job data
  const renderShowMoreCard = () => {
    // Use jobType first (determined from allJobs), then fallback to jobData properties
    const actualJobType: string =
      resolvedJobType || jobData?.object_type || jobData?.job_object_subclass;

    if (
      actualJobType === JobType.TILING ||
      actualJobType === "Drainage_TilingJob"
    ) {
      return (
        <TilingShowMoreCard
          fromCompleted
          cancelled={jobData.cancelled}
          completedJob={!jobData.cancelled}
          job={transformedJobData}
          toggleArchive={isJobArchived}
          onArchiveJob={handleArchiveJob}
          onClose={handleClose}
          onDeleteJob={handleDeleteJob}
        />
      );
    } else if (
      actualJobType === JobType.REPAIR ||
      actualJobType === "RepairJob"
    ) {
      return (
        <RepairShowMoreCard
          fromCompleted
          cancelled={jobData.cancelled}
          completedJob={!jobData.cancelled}
          job={transformedJobData}
          toggleArchive={isJobArchived}
          onArchiveJob={handleArchiveJob}
          onClose={handleClose}
          onDelete={handleDeleteFromModel}
        />
      );
    } else if (
      actualJobType === JobType.EXCAVATION ||
      actualJobType === "ExcavationJob"
    ) {
      return (
        <ExcavationShowMoreCard
          fromCompleted
          cancelled={jobData.cancelled}
          completedJob={!jobData.cancelled}
          job={transformedJobData}
          toggleArchive={isJobArchived}
          onArchiveJob={handleArchiveJob}
          onClose={handleClose}
          onDelete={handleDeleteFromModel}
        />
      );
    } else {
      // Fallback - try to determine from job data or default to tiling
      return (
        <TilingShowMoreCard
          fromCompleted
          cancelled={jobData.cancelled}
          completedJob={!jobData.cancelled}
          job={transformedJobData}
          toggleArchive={isJobArchived}
          onArchiveJob={handleArchiveJob}
          onClose={handleClose}
          onDeleteJob={handleDeleteJob}
        />
      );
    }
  };

  return <div className="p-6">{renderShowMoreCard()}</div>;
}
