"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { ComponentSizeEnum, Loader } from "@fieldflow360/org-ui";

import {
  JobLeadEntityType,
  JobLeadTypeRouteSegment,
  JobOrLeadType,
  JobType,
  PermissionCode,
} from "@/constants";
import { ContactNumberRow } from "@/features/contacts";
import {
  JobLeadProgressMeta,
  JobLeadRecordSubpageLayout,
  getJobLeadLogPageSubtitle,
  getJobLeadRecordBreadcrumbLabel,
  getJobListBadgeLabel,
} from "@/features/job-lead";
import {
  useJobActivityLogs,
  useOrganizationStatuses,
  useRouteIds,
} from "@/hooks";
import { useJobById } from "@/hooks/queries";
import { getHttpErrorStatus } from "@/lib/utils";
import { orgUrl } from "@/shared/config/routes";
import { ResourceErrorView } from "@/shared/ui/common";
import { AccessDeniedView, PermissionCodeGate } from "@/shared/ui/permissions";

import { mapActivityLogsToLeadRows } from "../utils/mapActivityLogsToLeadRows";
import {
  jobTypeToStatusesApiLetter,
  resolveActivityLogModuleForJobPage,
} from "../utils/resolveJobActivityLogModule";
import { ActivityLogTable } from "./ActivityLogTable";

type Props = {
  jobType: JobType;
  pathSegment: JobLeadTypeRouteSegment;
  permissionCode: PermissionCode;
};

function JobActivityLogContent({
  jobType,
  pathSegment,
}: Omit<Props, "permissionCode">) {
  const params = useParams();
  const searchParams = useSearchParams();
  const { orgId } = useRouteIds();

  const jobId = params.id as string;
  const isArchived = searchParams.get("archived") === "true";
  const fromCompleted = searchParams.get("fromCompleted") === "true";
  const typeFromQuery = searchParams.get("type");

  const completedTypeLetter = useMemo((): JobOrLeadType => {
    if (
      typeFromQuery === JobOrLeadType.EXCAVATION ||
      typeFromQuery === JobOrLeadType.REPAIR ||
      typeFromQuery === JobOrLeadType.TILING
    ) {
      return typeFromQuery;
    }
    if (jobType === JobType.EXCAVATION) return JobOrLeadType.EXCAVATION;
    if (jobType === JobType.REPAIR) return JobOrLeadType.REPAIR;
    return JobOrLeadType.TILING;
  }, [typeFromQuery, jobType]);

  const {
    data: job,
    isLoading: jobLoading,
    isSuccess: jobSuccess,
  } = useJobById(jobId, jobType, isArchived);

  const { data: orgStatuses = [] } = useOrganizationStatuses({
    jobType: jobTypeToStatusesApiLetter(jobType),
  });

  const activityLogModule = useMemo(
    () =>
      resolveActivityLogModuleForJobPage({
        fromCompleted,
        job,
        orgStatuses,
      }),
    [fromCompleted, job, orgStatuses]
  );
  const activityLogsEnabled = jobSuccess && Boolean(job);

  const {
    data: activityPage,
    isLoading: logsLoading,
    isError: logsError,
    error: logsErrorObj,
  } = useJobActivityLogs(jobId, activityLogModule, {
    enabled: activityLogsEnabled,
  });

  const rows = useMemo(
    () => mapActivityLogsToLeadRows(activityPage?.results ?? []),
    [activityPage?.results]
  );

  const detailHref = useMemo(() => {
    const archivedStr = isArchived ? "true" : "false";
    if (fromCompleted && orgId) {
      return orgUrl(
        orgId,
        `/completed/${jobId}`,
        `archived=${archivedStr}&fromCompleted=true&type=${completedTypeLetter}`
      );
    }
    return orgUrl(
      orgId ?? "",
      `/jobs/${pathSegment}/${jobId}`,
      `archived=${archivedStr}`
    );
  }, [
    completedTypeLetter,
    fromCompleted,
    isArchived,
    jobId,
    orgId,
    pathSegment,
  ]);

  if (jobLoading) {
    return (
      <Loader
        className="min-h-[40vh]"
        size={ComponentSizeEnum.SM}
        text="Loading..."
      />
    );
  }

  if (!job) {
    return <p className="text-text-muted p-6 text-sm">Job not found.</p>;
  }

  const breadcrumbLabel = getJobLeadRecordBreadcrumbLabel(
    job.contact_info,
    job.farm_name
  );

  const meta = (
    <>
      <ContactNumberRow contactInfo={job.contact_info} number={job.po_number} />
      <JobLeadProgressMeta progressBar={job.progress_bar} />
    </>
  );

  return (
    <JobLeadRecordSubpageLayout
      backLabel="Back to job"
      badge={getJobListBadgeLabel(jobType)}
      breadcrumbLabel={breadcrumbLabel}
      detailButtonLabel="View job details"
      detailHref={detailHref}
      detailSegment={pathSegment}
      entity={JobLeadEntityType.JOBS}
      meta={meta}
      recordId={jobId}
      subtitle={getJobLeadLogPageSubtitle(job.contact_info)}
    >
      {logsError ? (
        <ResourceErrorView
          orgId={orgId}
          resourceLabel="activity logs"
          status={getHttpErrorStatus(logsErrorObj)}
        />
      ) : (
        <ActivityLogTable
          isLoading={logsLoading}
          rows={rows}
          storageKey={orgId ? `job-activity-log:${orgId}:${jobId}` : undefined}
        />
      )}
    </JobLeadRecordSubpageLayout>
  );
}

export function JobActivityLogPage(props: Props) {
  return (
    <PermissionCodeGate
      fallback={
        <AccessDeniedView message="You do not have permission to view logs." />
      }
      permissionCode={props.permissionCode}
    >
      <JobActivityLogContent
        jobType={props.jobType}
        pathSegment={props.pathSegment}
      />
    </PermissionCodeGate>
  );
}
