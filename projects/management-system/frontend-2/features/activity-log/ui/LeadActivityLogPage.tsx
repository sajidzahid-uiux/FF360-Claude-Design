"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { ComponentSizeEnum, Loader } from "@fieldflow360/org-ui";

import {
  JobLeadEntityType,
  JobLeadTypeRouteSegment,
  LeadType,
  PermissionCode,
} from "@/constants";
import { ContactNumberRow } from "@/features/contacts";
import {
  JobLeadProgressMeta,
  JobLeadRecordSubpageLayout,
  getJobLeadLogPageSubtitle,
  getJobLeadRecordBreadcrumbLabel,
  getLeadListBadgeLabel,
} from "@/features/job-lead";
import { useLeadActivityLogs, useRouteIds } from "@/hooks";
import { useLeadById } from "@/hooks/queries";
import { getHttpErrorStatus } from "@/lib/utils";
import { orgUrl } from "@/shared/config/routes";
import { ResourceErrorView } from "@/shared/ui/common";
import { AccessDeniedView, PermissionCodeGate } from "@/shared/ui/permissions";

import { mapActivityLogsToLeadRows } from "../utils/mapActivityLogsToLeadRows";
import { ActivityLogTable } from "./ActivityLogTable";

type Props = {
  leadType: LeadType;
  pathSegment: JobLeadTypeRouteSegment;
};

function LeadActivityLogContent({ leadType, pathSegment }: Props) {
  const params = useParams();
  const searchParams = useSearchParams();
  const { orgId } = useRouteIds();

  const leadId = params.id as string;
  const isArchived = searchParams.get("archived") === "true";
  const { data: lead, isLoading } = useLeadById(leadId, leadType, isArchived);

  const {
    data: activityPage,
    isLoading: logsLoading,
    isError: logsError,
    error: logsErrorObj,
  } = useLeadActivityLogs(leadId);

  const rows = useMemo(
    () => mapActivityLogsToLeadRows(activityPage?.results ?? []),
    [activityPage?.results]
  );

  const detailHref = orgId
    ? orgUrl(orgId, `/leads/${pathSegment}/${leadId}`, `archived=${isArchived}`)
    : `/leads/${pathSegment}/${leadId}`;

  if (isLoading) {
    return (
      <Loader
        className="min-h-[40vh]"
        size={ComponentSizeEnum.SM}
        text="Loading..."
      />
    );
  }

  if (!lead) {
    return <p className="text-text-muted p-6 text-sm">Lead not found.</p>;
  }

  const meta = (
    <>
      <ContactNumberRow
        contactInfo={lead.contact_info}
        number={lead.po_number}
      />
      <JobLeadProgressMeta progressBar={lead.progress_bar} />
    </>
  );

  return (
    <JobLeadRecordSubpageLayout
      backLabel="Back to lead"
      badge={getLeadListBadgeLabel(leadType)}
      breadcrumbLabel={getJobLeadRecordBreadcrumbLabel(
        lead.contact_info,
        lead.farm_name
      )}
      detailButtonLabel="View lead details"
      detailHref={detailHref}
      detailSegment={pathSegment}
      entity={JobLeadEntityType.LEADS}
      meta={meta}
      recordId={leadId}
      subtitle={getJobLeadLogPageSubtitle(lead.contact_info)}
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
          storageKey={
            orgId ? `lead-activity-log:${orgId}:${leadId}` : undefined
          }
        />
      )}
    </JobLeadRecordSubpageLayout>
  );
}

export function LeadActivityLogPage(props: Props) {
  return (
    <PermissionCodeGate
      fallback={
        <AccessDeniedView message="You do not have permission to view logs." />
      }
      permissionCode={PermissionCode.LEADS_PAGE_READ}
    >
      <LeadActivityLogContent {...props} />
    </PermissionCodeGate>
  );
}
