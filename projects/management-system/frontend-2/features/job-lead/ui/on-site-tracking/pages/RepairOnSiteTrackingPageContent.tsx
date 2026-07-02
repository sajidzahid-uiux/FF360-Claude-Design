"use client";

import { useParams, useSearchParams } from "next/navigation";

import { ComponentSizeEnum, Loader } from "@fieldflow360/org-ui";

import { JobOrLeadType, JobType, PermissionCode } from "@/constants";
import {
  JobMaintenanceStatusSection,
  JobOnSiteEquipmentSection,
  JobOnSiteMapSection,
  JobOnSiteNotesFloating,
  JobOnSiteTimeTrackingSection,
  JobOnSiteTrackingPageLayout,
} from "@/features/job-lead";
import type { JobOnSiteMapJob } from "@/features/job-lead/ui/on-site-tracking/JobOnSiteMapSection";
import type { EntityDataState } from "@/features/job-lead/ui/show-more-card/entityDataState";
import { JobEquipmentAssignment } from "@/features/jobs";
import {
  useJobStatusHandler,
  useOrganizationById,
  useOrganizationStatuses,
  useRouteIds,
} from "@/hooks";
import { useContactPermissions, useJobPermissions } from "@/hooks/permissions";
import { useJobById } from "@/hooks/queries";
import { orgUrl } from "@/shared/config/routes";
import { PermissionCodeGate } from "@/shared/ui/permissions";

export default function OnSiteTrackingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const jobId = params.id as string;
  const isArchived = searchParams.get("archived") === "true";
  const { orgId } = useRouteIds();

  const { data: job, isLoading } = useJobById(
    jobId,
    JobType.REPAIR,
    isArchived,
    false
  );
  const { data: statusTypes } = useOrganizationStatuses({
    jobType: JobOrLeadType.REPAIR,
  });
  const { data: organizationData } = useOrganizationById(orgId);

  const { canEditStatus } = useJobPermissions(JobType.REPAIR);
  const { canRead: canReadContact } = useContactPermissions();

  const notesTabAccess = job?.notesTabAccess;

  const { toggleArchive, completedJob, cancelled, handleStatusChange } =
    useJobStatusHandler({
      job,
      jobType: JobType.REPAIR,
      statusTypes,
      jobId,
      isArchived,
    });

  const detailHref = orgUrl(
    orgId ?? "",
    `/jobs/repair/${job?.id ?? jobId}`,
    `archived=${isArchived}`
  );

  const sectionDisabled =
    isArchived || toggleArchive || completedJob || cancelled;

  if (isLoading) {
    return (
      <Loader
        className="min-h-[40vh]"
        size={ComponentSizeEnum.SM}
        text="Loading…"
      />
    );
  }

  return (
    <PermissionCodeGate permissionCode={PermissionCode.JOBS_REPAIR_PAGE_READ}>
      <JobOnSiteTrackingPageLayout
        canEditStatus={canEditStatus}
        canReadContact={canReadContact}
        contactInfo={job?.contact_info ?? null}
        currentStatus={job?.job_status}
        detailHref={detailHref}
        jobId={jobId}
        jobType={JobType.REPAIR}
        orgId={orgId}
        permissionCode={PermissionCode.JOBS_REPAIR_PAGE_READ}
        poNumber={job?.po_number}
        progressBar={job?.progress_bar}
        statusDisabled={sectionDisabled}
        statusTypes={statusTypes}
        onStatusChange={handleStatusChange}
        content={
          job?.id != null ? (
            <div className="flex flex-col gap-5 lg:gap-6 xl:gap-8">
              {/* Row 1 — field map (left) + time tracking & installed hours (right) */}
              <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-2 lg:gap-6 xl:gap-8">
                <div className="flex min-w-0 flex-col gap-5">
                  <JobOnSiteMapSection
                    canEditCorePoints={!sectionDisabled}
                    canMutatePins={!sectionDisabled}
                    disabled={sectionDisabled}
                    job={job as unknown as JobOnSiteMapJob}
                    jobType={JobType.REPAIR}
                    orgId={orgId}
                    organizationLocation={
                      organizationData?.latitude != null &&
                      organizationData?.longitude != null
                        ? {
                            lat: Number(organizationData.latitude),
                            lng: Number(organizationData.longitude),
                          }
                        : null
                    }
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-5">
                  <JobOnSiteTimeTrackingSection
                    disabled={sectionDisabled}
                    jobId={job.id}
                    jobType={JobType.REPAIR}
                  />
                </div>
              </div>
              {/* Row 2 — equipment assignment (left) + maintenance status (right) */}
              <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2 lg:gap-6 xl:gap-8">
                <div className="flex min-w-0 flex-col gap-5">
                  <JobOnSiteEquipmentSection>
                    <JobEquipmentAssignment
                      embedded
                      hideMaintenance
                      assignments={job.equipments ?? []}
                      disabled={sectionDisabled}
                      farmerJob={job.job_object_subclass === "RepairFarmerJob"}
                      jobId={job.id}
                      jobType={JobType.REPAIR}
                      mode="track"
                    />
                  </JobOnSiteEquipmentSection>
                </div>
                <div className="flex min-w-0 flex-col gap-5">
                  <JobMaintenanceStatusSection />
                </div>
              </div>
            </div>
          ) : null
        }
      />
      {job?.id != null ? (
        <JobOnSiteNotesFloating
          assignedToJob={job?.canAccessOnSiteTracking === true}
          canEdit={!sectionDisabled}
          entity={job as unknown as EntityDataState}
          isTrashed={isArchived}
          jobId={jobId}
          jobType={JobType.REPAIR}
          notesTabAccess={notesTabAccess}
          readOnly={sectionDisabled}
        />
      ) : null}
    </PermissionCodeGate>
  );
}
