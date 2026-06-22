import type { ComponentType } from "react";

import type { Job } from "@/api/types";
import {
  JobLeadEntityType,
  JobLeadTypeRouteSegment,
  JobLeadTypeSegment,
  JobType,
  LeadType,
  PermissionCode,
  ResourceType,
  normalizeJobLeadTypeSegment,
} from "@/constants";
import { JobOrLeadType } from "@/constants/enums";
import { JobLeadForm } from "@/features/job-lead/ui/JobLeadForm";
import { ExcavationCard, RepairCard, TilingCard } from "@/features/jobs";
import { ExcavationLeadCard, LeadCard, RepairLeadCard } from "@/features/leads";
import type { LeadCardData } from "@/shared/ui/common/GenericCard";
import { FilterType } from "@/shared/ui/common/filter/model/types";

import type { CardProps } from "./cardProps";

export {
  JobLeadTypeRouteSegment,
  JobLeadTypeSegment,
  isJobLeadEntityType,
  isJobLeadTypeRouteSegment,
  isJobLeadTypeSegment,
  normalizeJobLeadTypeSegment,
} from "@/constants";
export type { JobLeadEntityType } from "@/constants";

type LeadCardComponent = ComponentType<{
  data: LeadCardData;
  onShowMore: () => void;
  onLogs?: (id: number, isArchived?: boolean) => void;
  onTrash: (id: number) => void;
  onUnarchive: (id: number) => void;
  onArchive: (id: number) => void;
  onSelect: (id: number) => void;
  onDeselect: (id: number) => void;
  isSelected: boolean;
  onRowDoubleClick?: (id: number, isArchived: boolean) => void;
  showJobStatus?: boolean;
  readOnly?: boolean;
}>;

type JobCardComponent = ComponentType<
  CardProps<Job> & {
    onOnSiteTracking?: (id: number) => void;
    onLogs?: (id: number, isArchived?: boolean) => void;
  }
>;

interface BaseJobLeadRouteConfig {
  segment: JobLeadTypeSegment;
  currentPathSegment: JobLeadTypeRouteSegment;
  apiType: JobOrLeadType;
  jobType: JobType;
  leadType: LeadType;
  recordJobType: JobLeadTypeSegment;
  titleLabel: string;
  detailSegment: string;
}

export interface LeadRouteConfig extends BaseJobLeadRouteConfig {
  entity: ResourceType.LEAD;
  Card: LeadCardComponent;
  description: string;
  formId: string;
  formDescriptionPlaceholder: string;
  leadSourcePlaceholder: string;
  listTitle: string;
  includeDesigners?: boolean;
  permissionCode: PermissionCode;
}

export interface JobRouteConfig extends BaseJobLeadRouteConfig {
  entity: ResourceType.JOB;
  Card: JobCardComponent;
  description: string;
  formId: string;
  formDescriptionPlaceholder: string;
  listTitle: string;
  modalTitle: string;
  includeDesigners?: boolean;
  includeEquipment?: boolean;
  permissionCode: PermissionCode;
  equipmentWritePermission?: string;
  statusFilterType: FilterType;
}

export type JobLeadRouteConfig = LeadRouteConfig | JobRouteConfig;

const BASE_CONFIG: Record<JobLeadTypeSegment, BaseJobLeadRouteConfig> = {
  [JobLeadTypeSegment.TILING]: {
    segment: JobLeadTypeSegment.TILING,
    currentPathSegment: JobLeadTypeRouteSegment.DRAINAGE_TILING,
    apiType: JobOrLeadType.TILING,
    jobType: JobType.TILING,
    leadType: LeadType.TILING,
    recordJobType: JobLeadTypeSegment.TILING,
    titleLabel: "Tile",
    detailSegment: JobLeadTypeRouteSegment.DRAINAGE_TILING,
  },
  [JobLeadTypeSegment.EXCAVATION]: {
    segment: JobLeadTypeSegment.EXCAVATION,
    currentPathSegment: JobLeadTypeRouteSegment.EXCAVATION,
    apiType: JobOrLeadType.EXCAVATION,
    jobType: JobType.EXCAVATION,
    leadType: LeadType.EXCAVATION,
    recordJobType: JobLeadTypeSegment.EXCAVATION,
    titleLabel: "Excavation",
    detailSegment: JobLeadTypeRouteSegment.EXCAVATION,
  },
  [JobLeadTypeSegment.REPAIR]: {
    segment: JobLeadTypeSegment.REPAIR,
    currentPathSegment: JobLeadTypeRouteSegment.REPAIR,
    apiType: JobOrLeadType.REPAIR,
    jobType: JobType.REPAIR,
    leadType: LeadType.REPAIR,
    recordJobType: JobLeadTypeSegment.REPAIR,
    titleLabel: "Repair",
    detailSegment: JobLeadTypeRouteSegment.REPAIR,
  },
};

export const LEAD_ROUTE_CONFIGS: Record<JobLeadTypeSegment, LeadRouteConfig> = {
  [JobLeadTypeSegment.TILING]: {
    ...BASE_CONFIG[JobLeadTypeSegment.TILING],
    entity: ResourceType.LEAD,
    Card: LeadCard,
    description: "View and manage tiling service leads here.",
    formDescriptionPlaceholder: "Tile project description",
    formId: "tiling-lead-form",
    includeDesigners: true,
    leadSourcePlaceholder: "Select Tile Lead Source",
    listTitle: "Tile Leads",
    permissionCode: PermissionCode.LEADS_PAGE_READ,
  },
  [JobLeadTypeSegment.EXCAVATION]: {
    ...BASE_CONFIG[JobLeadTypeSegment.EXCAVATION],
    entity: ResourceType.LEAD,
    Card: ExcavationLeadCard,
    description: "View and manage excavation service leads here.",
    formDescriptionPlaceholder: "Enter lead description",
    formId: "excavation-lead-form",
    leadSourcePlaceholder: "Select Excavation Lead Source",
    listTitle: "Excavation Leads",
    permissionCode: PermissionCode.LEADS_PAGE_READ,
  },
  [JobLeadTypeSegment.REPAIR]: {
    ...BASE_CONFIG[JobLeadTypeSegment.REPAIR],
    entity: ResourceType.LEAD,
    Card: RepairLeadCard,
    description: "View and manage repair service leads here.",
    formDescriptionPlaceholder: "Enter lead description",
    formId: "lead-form",
    leadSourcePlaceholder: "Select Repair Lead Source",
    listTitle: "Repair Leads",
    permissionCode: PermissionCode.LEADS_PAGE_READ,
  },
};

export const JOB_ROUTE_CONFIGS: Record<JobLeadTypeSegment, JobRouteConfig> = {
  [JobLeadTypeSegment.TILING]: {
    ...BASE_CONFIG[JobLeadTypeSegment.TILING],
    entity: ResourceType.JOB,
    Card: TilingCard,
    description: "View and manage tiling jobs here.",
    equipmentWritePermission:
      PermissionCode.JOBS_TILING_EQUIPMENT_MANAGEMENT_WRITE,
    formDescriptionPlaceholder: "Description",
    formId: "tiling-job-form",
    includeDesigners: true,
    includeEquipment: true,
    listTitle: "Tile Jobs",
    modalTitle: "Add New Job",
    permissionCode: PermissionCode.JOBS_TILING_PAGE_READ,
    statusFilterType: FilterType.TILING_JOB_STATUSES,
  },
  [JobLeadTypeSegment.EXCAVATION]: {
    ...BASE_CONFIG[JobLeadTypeSegment.EXCAVATION],
    entity: ResourceType.JOB,
    Card: ExcavationCard,
    description: "View and manage excavation jobs here.",
    equipmentWritePermission:
      PermissionCode.JOBS_EXCAVATION_EQUIPMENT_MANAGEMENT_WRITE,
    formDescriptionPlaceholder: "Description",
    formId: "excavation-job-form",
    includeDesigners: true,
    includeEquipment: true,
    listTitle: "Excavation Jobs",
    modalTitle: "Add New Job",
    permissionCode: PermissionCode.JOBS_EXCAVATION_PAGE_READ,
    statusFilterType: FilterType.EXCAVATION_JOB_STATUSES,
  },
  [JobLeadTypeSegment.REPAIR]: {
    ...BASE_CONFIG[JobLeadTypeSegment.REPAIR],
    entity: ResourceType.JOB,
    Card: RepairCard,
    description: "View and manage repair jobs here.",
    equipmentWritePermission:
      PermissionCode.JOBS_REPAIR_EQUIPMENT_MANAGEMENT_WRITE,
    formDescriptionPlaceholder: "Description",
    formId: "repair-job-form",
    includeEquipment: true,
    listTitle: "Repair Jobs",
    modalTitle: "Add New Job",
    permissionCode: PermissionCode.JOBS_REPAIR_PAGE_READ,
    statusFilterType: FilterType.REPAIR_JOB_STATUSES,
  },
};

export function getJobLeadRouteConfig(
  entityType: JobLeadEntityType,
  jobLeadType: JobLeadTypeRouteSegment
): JobLeadRouteConfig | undefined {
  const normalizedJobLeadType = normalizeJobLeadTypeSegment(jobLeadType);

  return entityType === JobLeadEntityType.JOBS
    ? JOB_ROUTE_CONFIGS[normalizedJobLeadType]
    : LEAD_ROUTE_CONFIGS[normalizedJobLeadType];
}

export function createJobLeadFormProps(config: JobLeadRouteConfig) {
  return {
    component: JobLeadForm,
    props: {
      entity: config.entity,
      descriptionPlaceholder: config.formDescriptionPlaceholder,
      equipmentWritePermission:
        config.entity === ResourceType.JOB
          ? config.equipmentWritePermission
          : undefined,
      formId: config.formId,
      includeDesigners: config.includeDesigners,
      includeEquipment:
        config.entity === ResourceType.JOB
          ? config.includeEquipment
          : undefined,
      leadSourcePlaceholder:
        config.entity === ResourceType.LEAD
          ? config.leadSourcePlaceholder
          : undefined,
      modalTitle:
        config.entity === ResourceType.JOB ? config.modalTitle : undefined,
      projectTypeCategory:
        config.entity === ResourceType.JOB ? config.apiType : undefined,
      recordJobType: config.recordJobType,
    },
  };
}
