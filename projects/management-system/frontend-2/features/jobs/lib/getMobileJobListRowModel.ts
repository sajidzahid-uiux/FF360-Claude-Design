import type { Job, Member, Status } from "@/api/types";
import { JobType } from "@/constants";
import type { TransformedJob } from "@/features/completed/model/types";
import type { JobTableRow } from "@/features/jobs/lib/columns/types";
import { formatMaterialStatusLabel } from "@/features/jobs/lib/formatMaterialStatusLabel";
import { formatCardFieldValue } from "@/shared/lib/formatCardFieldValue";
import { getJobOrLeadListName } from "@/shared/lib/getJobOrLeadTitle";

const TILING_JOB_SUBCLASS = "Drainage_TilingJob";

export interface MobileJobListRowField {
  label: string;
  value: string;
}

export interface MobileJobListRowModel {
  identifier: string;
  lastUpdatedLine: string;
  jobName: string;
  phone: string;
  statusLabel: string;
  statusColor: string;
  onHoldHighlight: boolean;
  expandedFields: MobileJobListRowField[];
}

interface ActiveJobRowInput {
  variant: "active";
  job: JobTableRow;
  jobType: JobType;
  statusTypes?: Status[];
}

interface CompletedJobRowInput {
  variant: "completed";
  job: TransformedJob;
}

export type MobileJobListRowInput = ActiveJobRowInput | CompletedJobRowInput;

function formatTopo(topo: string | null | undefined): string | null {
  if (!topo?.trim()) return null;
  if (topo === "Yes" || topo === "yes") return "Yes";
  if (topo === "No" || topo === "no") return "No";
  return topo.trim();
}

function getJobIdentifier(job: {
  po_number?: string;
  estimate_number?: string | number | null;
  id: number;
}): string {
  const po = job.po_number?.trim();
  if (po) return po;
  const estimate = job.estimate_number;
  if (estimate != null && String(estimate).trim() !== "") {
    return String(estimate).trim();
  }
  return `Job #${job.id}`;
}

function getLastUpdatedLine(
  lastUpdated: string | undefined,
  updatedBy: string | undefined
): string {
  const date = lastUpdated ? new Date(lastUpdated).toLocaleDateString() : "—";
  const by = updatedBy?.trim() || "N/A";
  return `${date} • ${by}`;
}

function getPhone(job: {
  contact_info?: {
    phone_number?: string | null;
    home_phone_number?: string | null;
  };
}): string | null {
  const phone =
    job.contact_info?.phone_number || job.contact_info?.home_phone_number;
  return phone?.trim() ? phone.trim() : null;
}

function formatMemberDisplayName(member: Member): string | null {
  const username = member.user?.username?.trim();
  if (username) return username;
  const email = member.user?.email?.trim();
  return email || null;
}

function formatDesignerNames(designers: Job["designers"]): string | null {
  if (!Array.isArray(designers) || designers.length === 0) return null;

  const names = designers
    .map((designer) => {
      if (typeof designer === "number") return null;
      return formatMemberDisplayName(designer);
    })
    .filter((name): name is string => Boolean(name));

  return names.length > 0 ? names.join(", ") : null;
}

function getAssignedToLabel(job: Pick<Job, "designers">): string {
  return formatDesignerNames(job.designers) ?? "N/A";
}

function pushField(
  fields: MobileJobListRowField[],
  label: string,
  value: string | null | undefined
): void {
  if (value == null || value.trim() === "") return;
  fields.push({ label, value: value.trim() });
}

function resolveActiveStatus(
  job: JobTableRow,
  statusTypes: Status[] | undefined
): { title: string; color: string } {
  const raw = job.job_status;
  if (raw == null) return { title: "N/A", color: "#9ca3af" };
  if (typeof raw === "object") {
    return {
      title: raw.title?.trim() || "N/A",
      color: raw.color || "#9ca3af",
    };
  }
  const match = statusTypes?.find((status) => status.id === raw);
  return {
    title: match?.title?.trim() || "N/A",
    color: match?.color || "#9ca3af",
  };
}

function buildActiveExpandedFields(
  job: JobTableRow,
  jobType: JobType
): MobileJobListRowField[] {
  const fields: MobileJobListRowField[] = [];

  if (jobType === JobType.EXCAVATION || jobType === JobType.TILING) {
    pushField(
      fields,
      "Estimate Number",
      job.estimate_number != null ? String(job.estimate_number) : null
    );
  }

  if (jobType === JobType.TILING) {
    pushField(fields, "Topo", formatTopo(job.topo));
    pushField(
      fields,
      "Material Status",
      formatMaterialStatusLabel(job.material_status) || null
    );
    fields.push({
      label: "Assigned to",
      value: getAssignedToLabel(job),
    });
  }

  return fields;
}

function getCompletedJobTypeLabel(subclass: string | undefined): string {
  if (subclass === TILING_JOB_SUBCLASS) return "Tile Job";
  if (subclass === "RepairJob") return "Repair Job";
  if (subclass === "ExcavationJob") return "Excavation Job";
  return subclass ?? "Job";
}

function buildCompletedExpandedFields(
  job: TransformedJob
): MobileJobListRowField[] {
  const fields: MobileJobListRowField[] = [];

  pushField(
    fields,
    "Job Type",
    getCompletedJobTypeLabel(job.job_object_subclass)
  );

  if (job.job_object_subclass === TILING_JOB_SUBCLASS) {
    pushField(
      fields,
      "Material Status",
      formatMaterialStatusLabel(job.material_status) || null
    );
    fields.push({
      label: "Assigned to",
      value: getAssignedToLabel(job),
    });
  }

  return fields;
}

export function getMobileJobListRowModel(
  input: MobileJobListRowInput
): MobileJobListRowModel {
  if (input.variant === "active") {
    const { job, jobType, statusTypes } = input;
    const status = resolveActiveStatus(job, statusTypes);

    return {
      identifier: getJobIdentifier(job),
      lastUpdatedLine: getLastUpdatedLine(
        job.last_updated,
        job.update_by_username
      ),
      jobName: getJobOrLeadListName(job, "Job"),
      phone: getPhone(job) ?? "N/A",
      statusLabel: status.title,
      statusColor: status.color,
      onHoldHighlight: job.on_hold === true,
      expandedFields: buildActiveExpandedFields(job, jobType),
    };
  }

  const { job } = input;
  const isCancelled = job.cancelled === true;
  const created = job.created_at
    ? new Date(job.created_at).toLocaleDateString()
    : "—";
  const updatedBy =
    typeof job.last_updated_by === "string"
      ? job.last_updated_by
      : formatCardFieldValue(job.last_updated_by);

  return {
    identifier: getJobIdentifier(job),
    lastUpdatedLine: `${created} • ${updatedBy || "N/A"}`,
    jobName: getJobOrLeadListName(job, "Job"),
    phone: getPhone(job) ?? "N/A",
    statusLabel: isCancelled ? "Cancelled" : "Completed",
    statusColor: isCancelled ? "#ef4444" : "#22c55e",
    onHoldHighlight: false,
    expandedFields: buildCompletedExpandedFields(job),
  };
}
