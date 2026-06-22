"use client";

import { useParams, useSearchParams } from "next/navigation";

import { ComponentSizeEnum, Loader } from "@fieldflow360/org-ui";

import { JobOrLeadType, JobType, PermissionCode } from "@/constants";
import {
  JobOnSiteEquipmentSection,
  JobOnSiteNotesSection,
  JobOnSiteTimeTrackingSection,
  JobOnSiteTrackingPageLayout,
} from "@/features/job-lead";
import { JobEquipmentAssignment } from "@/features/jobs";
import {
  useJobStatusHandler,
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
    JobType.EXCAVATION,
    isArchived,
    false
  );
  const { data: statusTypes } = useOrganizationStatuses({
    jobType: JobOrLeadType.EXCAVATION,
  });

  const { canEditStatus } = useJobPermissions(JobType.EXCAVATION);
  const { canRead: canReadContact } = useContactPermissions();

  const notesTabAccess = job?.notesTabAccess;

  const { toggleArchive, completedJob, cancelled, handleStatusChange } =
    useJobStatusHandler({
      job,
      jobType: JobType.EXCAVATION,
      statusTypes,
      jobId,
      isArchived,
    });

  const detailHref = orgUrl(
    orgId ?? "",
    `/jobs/excavation/${job?.id ?? jobId}`,
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
    <PermissionCodeGate
      permissionCode={PermissionCode.JOBS_EXCAVATION_PAGE_READ}
    >
      <JobOnSiteTrackingPageLayout
        canEditStatus={canEditStatus}
        canReadContact={canReadContact}
        contactInfo={job?.contact_info ?? null}
        currentStatus={job?.job_status}
        detailHref={detailHref}
        jobId={jobId}
        jobType={JobType.EXCAVATION}
        orgId={orgId}
        permissionCode={PermissionCode.JOBS_EXCAVATION_PAGE_READ}
        poNumber={job?.po_number}
        primaryColumn={
          job?.id != null ? (
            <JobOnSiteTimeTrackingSection
              disabled={sectionDisabled}
              jobId={job.id}
              jobType={JobType.EXCAVATION}
            />
          ) : null
        }
        progressBar={job?.progress_bar}
        secondaryColumn={
          job?.id != null ? (
            <>
              <JobOnSiteEquipmentSection>
                <JobEquipmentAssignment
                  embedded
                  hideMaintenance
                  assignments={job.equipments ?? []}
                  disabled={sectionDisabled}
                  farmerJob={job.job_object_subclass === "ExcavationFarmerJob"}
                  jobId={job.id}
                  jobType={JobType.EXCAVATION}
                  mode="track"
                />
              </JobOnSiteEquipmentSection>
              <JobOnSiteNotesSection
                assignedToJob={job?.canAccessOnSiteTracking === true}
                jobId={jobId}
                jobType={JobType.EXCAVATION}
                notesTabAccess={notesTabAccess}
                readOnly={sectionDisabled}
              />
            </>
          ) : null
        }
        statusDisabled={sectionDisabled}
        statusTypes={statusTypes}
        onStatusChange={handleStatusChange}
      />
    </PermissionCodeGate>
  );
}
