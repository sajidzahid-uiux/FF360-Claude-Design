"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef } from "react";

import { ComponentSizeEnum, Loader } from "@fieldflow360/org-ui";
import { toast } from "sonner";

import { JobType, PermissionCode, ResourceType } from "@/constants";
import { createShowMoreCardWrapper } from "@/features/job-lead/ui/show-more-card/exports";
import { useLeadStatuses, useLeadTypes, useRouteIds } from "@/hooks";
import {
  useArchiveJob,
  useArchiveLead,
  useJobComments,
  useJobFiles,
  useTrashJob,
  useUnarchiveJob,
  useUnarchiveLead,
} from "@/hooks/mutations";
import { useJobById, useLeadById } from "@/hooks/queries";
import { getHttpErrorStatus } from "@/lib/utils";
import { orgPath, orgUrl } from "@/shared/config/routes";
import { ResourceErrorView } from "@/shared/ui/common";
import {
  AccessDeniedView,
  JobPagePermissionGate,
  PermissionCodeGate,
} from "@/shared/ui/permissions";
import { getErrorMessage } from "@/utils/apiError";

import { useJobLeadRouteConfig } from "../hooks/useJobLeadRouteConfig";
import { jobLeadPathsFromConfig } from "../lib/jobLeadPaths";
import {
  type JobLeadRouteConfig,
  type JobRouteConfig,
  type LeadRouteConfig,
} from "../model/jobLeadRouteConfig";

function JobDetailRouteContent({ config }: { config: JobRouteConfig }) {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { orgId } = useRouteIds();
  const paths = jobLeadPathsFromConfig(config);

  const jobId = params.id as string;
  const isTrashed = searchParams.get("trashed") === "true";
  const isArchived = searchParams.get("archived") === "true";
  const fromCompleted = searchParams.get("fromCompleted") === "true";
  const archiveOperationPerformed = useRef(false);

  const ShowMoreCardWrapper = useMemo(
    () => createShowMoreCardWrapper(ResourceType.JOB, config.jobType),
    [config.jobType]
  );

  const {
    data: job,
    isLoading: jobLoading,
    isError: jobIsError,
    error: jobError,
  } = useJobById(parseInt(jobId, 10), config.jobType, isArchived, isTrashed);

  const includeFilesAndComments = config.jobType === JobType.TILING;
  const { data: jobFiles, isLoading: filesLoading } = useJobFiles(
    parseInt(jobId, 10),
    config.jobType
  );
  const { data: jobComments, isLoading: commentsLoading } = useJobComments(
    parseInt(jobId, 10),
    config.jobType
  );

  const trashJob = useTrashJob();
  const archiveJob = useArchiveJob();
  const unarchiveJob = useUnarchiveJob();

  const handleClose = () => {
    if (archiveOperationPerformed.current && orgId) {
      router.push(orgPath(orgId, paths.list));
      return;
    }
    router.back();
  };

  const handleArchive = async (payload: { id: number }) => {
    try {
      if (isArchived) {
        await unarchiveJob.mutateAsync({
          id: payload.id,
          jobType: config.jobType,
        });
        toast.success("Job unarchived successfully");
        archiveOperationPerformed.current = true;
        if (orgId) {
          router.push(orgUrl(orgId, paths.detail(jobId), "archived=false"));
        }
      } else {
        await archiveJob.mutateAsync({
          id: payload.id,
          jobType: config.jobType,
        });
        toast.success("Job archived successfully");
        archiveOperationPerformed.current = true;
        if (orgId) {
          router.push(orgUrl(orgId, paths.detail(jobId), "archived=true"));
        }
      }
    } catch (error: unknown) {
      console.error("Archive operation failed:", error);
      toast.error(getErrorMessage(error, "Failed to archive job"));
    }
  };

  const handleDelete = async (payload: { id: number }) => {
    try {
      await trashJob.mutateAsync({
        id: payload.id,
        jobType: config.jobType,
      });
      toast.success("Job trashed successfully");
      if (orgId) {
        router.push(orgPath(orgId, paths.list));
      }
    } catch (error: unknown) {
      console.error("Delete operation failed:", error);
      toast.error(getErrorMessage(error, "Failed to trash job"));
    }
  };

  if (jobLoading) {
    return (
      <Loader
        className="min-h-screen"
        size={ComponentSizeEnum.SM}
        text="Loading job details…"
      />
    );
  }

  if (jobIsError || !job) {
    return (
      <ResourceErrorView
        orgId={orgId}
        resourceLabel="job"
        status={getHttpErrorStatus(jobError)}
      />
    );
  }

  return (
    <JobPagePermissionGate jobType={config.jobType}>
      <div className="bg-bg-app flex h-full min-h-0 flex-1 flex-col">
        <ShowMoreCardWrapper
          cancelled={job.cancelled}
          completedJob={job.job_status?.title === "Completed" || fromCompleted}
          fromCompleted={fromCompleted}
          isLoadingComments={includeFilesAndComments ? commentsLoading : false}
          isLoadingFiles={includeFilesAndComments ? filesLoading : false}
          isTrashed={isTrashed}
          job={job}
          jobComments={includeFilesAndComments ? jobComments || [] : undefined}
          jobFiles={includeFilesAndComments ? jobFiles || [] : undefined}
          toggleArchive={isArchived}
          onArchiveJob={(jobData) => {
            if (jobData.id != null) void handleArchive({ id: jobData.id });
          }}
          onClose={handleClose}
          onDeleteJob={(jobData) => {
            if (jobData.id != null) void handleDelete({ id: jobData.id });
          }}
        />
      </div>
    </JobPagePermissionGate>
  );
}

function LeadDetailRouteContent({ config }: { config: LeadRouteConfig }) {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { orgId } = useRouteIds();
  const paths = jobLeadPathsFromConfig(config);

  const leadId = parseInt(params.id as string, 10);
  const isArchived = searchParams.get("archived") === "true";
  const archiveOperationPerformed = useRef(false);

  const ShowMoreCardWrapper = useMemo(
    () => createShowMoreCardWrapper(ResourceType.LEAD, config.jobType),
    [config.jobType]
  );

  const {
    data: leadData,
    isLoading,
    isError: leadIsError,
    error: leadError,
  } = useLeadById(leadId, config.leadType, isArchived);

  const archiveLead = useArchiveLead();
  const unarchiveLead = useUnarchiveLead();
  const { data: leadStatuses } = useLeadStatuses();
  const { data: leadTypes } = useLeadTypes();

  const handleArchiveLead = async () => {
    if (!leadData) return;

    try {
      if (isArchived) {
        await unarchiveLead.mutateAsync({
          id: leadData.id,
          leadType: config.leadType,
        });
        archiveOperationPerformed.current = true;
        if (orgId) {
          router.push(orgPath(orgId, paths.detail(leadId)));
        }
      } else {
        await archiveLead.mutateAsync({
          id: leadData.id,
          leadType: config.leadType,
        });
        archiveOperationPerformed.current = true;
        if (orgId) {
          router.push(orgUrl(orgId, paths.detail(leadId), "archived=true"));
        }
      }
    } catch (error) {
      console.error("Error archiving lead:", error);
    }
  };

  if (isLoading) {
    return (
      <Loader
        className="min-h-screen"
        size={ComponentSizeEnum.SM}
        text="Loading lead details…"
      />
    );
  }

  if (leadIsError || !leadData) {
    return (
      <ResourceErrorView
        orgId={orgId}
        resourceLabel="lead"
        status={getHttpErrorStatus(leadError)}
      />
    );
  }

  return (
    <PermissionCodeGate
      fallback={
        <AccessDeniedView message="You do not have permission to view leads." />
      }
      permissionCode={PermissionCode.LEADS_PAGE_READ}
    >
      <div className="bg-bg-app flex h-full min-h-0 flex-1 flex-col">
        <ShowMoreCardWrapper
          isLoadingComments={false}
          isLoadingFiles={false}
          leadData={leadData}
          leadStatuses={leadStatuses || []}
          leadTypes={leadTypes || []}
          toggleArchive={isArchived}
          onArchiveLead={handleArchiveLead}
          onClose={() => {
            if (archiveOperationPerformed.current && orgId) {
              router.push(orgPath(orgId, paths.list));
              return;
            }
            router.back();
          }}
        />
      </div>
    </PermissionCodeGate>
  );
}

export interface JobLeadDetailRoutePageProps {
  config?: JobLeadRouteConfig;
}

export function JobLeadDetailRoutePage({
  config: configProp,
}: JobLeadDetailRoutePageProps) {
  const config = useJobLeadRouteConfig(configProp);

  if (!config) {
    return null;
  }

  return config.entity === ResourceType.JOB ? (
    <JobDetailRouteContent config={config} />
  ) : (
    <LeadDetailRouteContent config={config} />
  );
}
