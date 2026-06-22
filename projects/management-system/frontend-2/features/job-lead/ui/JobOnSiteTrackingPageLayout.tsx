"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button, ButtonVariantEnum } from "@fieldflow360/org-ui";

import { JobLeadEntityType, getJobTypePathSegment } from "@/constants";
import { ContactNumberRow } from "@/features/contacts";
import {
  JobLeadProgressMeta,
  getJobLeadRecordBreadcrumbLabel,
  getJobListBadgeLabel,
} from "@/features/job-lead";
import { useCmsJobLeadDetailBreadcrumb } from "@/features/job-lead/hooks/useCmsJobLeadDetailBreadcrumb";
import type { JobOnSiteTrackingPageLayoutProps } from "@/features/job-lead/model/onSiteTrackingPage";
import { orgUrl } from "@/shared/config/routes";
import { DetailViewPage, StatusDropdown } from "@/shared/ui/common";
import { PermissionCodeGate } from "@/shared/ui/permissions";

function RecordTypeBadge({ label }: { label: string }) {
  return (
    <span className="bg-accent/15 text-accent border-accent/30 rounded-full border px-2.5 py-0.5 text-xs font-semibold">
      {label}
    </span>
  );
}

export type { JobOnSiteTrackingPageLayoutProps } from "@/features/job-lead/model/onSiteTrackingPage";

export function JobOnSiteTrackingPageLayout({
  jobType,
  jobId,
  canReadContact,
  orgId,
  canEditStatus,
  statusDisabled,
  statusTypes,
  currentStatus,
  onStatusChange,
  contactInfo,
  poNumber,
  progressBar,
  detailHref,
  permissionCode,
  primaryColumn,
  secondaryColumn,
}: JobOnSiteTrackingPageLayoutProps) {
  const router = useRouter();
  const segment = getJobTypePathSegment(jobType);

  useCmsJobLeadDetailBreadcrumb(
    getJobLeadRecordBreadcrumbLabel(contactInfo, null),
    JobLeadEntityType.JOBS,
    segment,
    jobId
  );

  const contactLabel = contactInfo
    ? `${contactInfo.full_name} - ${
        contactInfo.phone_number || contactInfo.home_phone_number || "N/A"
      }`
    : null;

  const subtitle = contactLabel ? (
    canReadContact && orgId ? (
      <Link
        className="text-accent border-accent/40 hover:border-accent border-b font-semibold transition-colors"
        href={orgUrl(orgId, `/contact/${contactInfo!.id}`)}
      >
        {contactLabel}
      </Link>
    ) : (
      contactLabel
    )
  ) : (
    <span className="text-text-muted">No contact information</span>
  );

  const statusControl =
    statusTypes && statusTypes.length > 0 ? (
      <StatusDropdown
        currentStatus={currentStatus}
        disabled={statusDisabled || !canEditStatus}
        statusTypes={statusTypes}
        width="auto"
        onStatusChange={onStatusChange}
      />
    ) : null;

  const headerActions = (
    <PermissionCodeGate permissionCode={permissionCode}>
      <div className="flex flex-wrap items-center gap-2">
        {statusControl}
        <Button
          aria-label="View job details"
          title="View job details"
          variant={ButtonVariantEnum.SURFACE}
          onClick={() => router.push(detailHref)}
        />
      </div>
    </PermissionCodeGate>
  );

  const headerMeta = (
    <>
      <RecordTypeBadge label={getJobListBadgeLabel(jobType)} />
      <ContactNumberRow contactInfo={contactInfo} number={poNumber} />
      <JobLeadProgressMeta progressBar={progressBar} />
    </>
  );

  return (
    <div className="bg-bg-app flex h-full min-h-0 flex-1 flex-col">
      <DetailViewPage
        actions={headerActions}
        backLabel="Back to job"
        bodyClassName="pb-10"
        className="flex-1"
        constrainBodyWidth={false}
        contentClassName="mx-auto w-full max-w-[90rem] pt-2"
        meta={headerMeta}
        subtitle={subtitle}
        onBack={() => router.push(detailHref)}
      >
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2 lg:gap-6 xl:gap-8">
          <div className="flex min-w-0 flex-col gap-5">{primaryColumn}</div>
          <div className="flex min-w-0 flex-col gap-5">{secondaryColumn}</div>
        </div>
      </DetailViewPage>
    </div>
  );
}
