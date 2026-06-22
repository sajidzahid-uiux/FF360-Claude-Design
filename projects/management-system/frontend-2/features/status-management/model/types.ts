import type {
  OrganizationLeadStatusSetting,
  OrganizationLeadTypeSetting,
  PaymentStatus,
  ProjectType,
  ProjectTypeCategory,
  ProjectTypeCreatePayload,
  Status,
} from "@/api/types";
import type { StatusFormValues } from "@/features/jobs";
import type { TransformedJobStatus } from "@/utils/transformJobStatuses";

import type { JobTypeTab } from "./tabs";

export type OrganizationStatusModalType =
  | "jobStatus"
  | "leadStatus"
  | "leadType"
  | "paymentStatus";

export type OrganizationStatusFormValues = StatusFormValues;

export interface OrganizationStatusModalInitialData extends Partial<StatusFormValues> {
  isDefault?: boolean;
  editable?: boolean;
  jobType?: JobTypeTab;
}

export interface StatusModalState {
  open: boolean;
  mode: "add" | "edit";
  type: OrganizationStatusModalType;
  initialData?: OrganizationStatusModalInitialData;
}

export type ProjectTypeFormValues = ProjectTypeCreatePayload & {
  id?: ProjectType["id"];
};

export interface ProjectTypeModalState {
  open: boolean;
  mode: "add" | "edit";
  initialData?: Partial<ProjectTypeFormValues> & { is_default?: boolean };
  defaultCategory?: ProjectTypeCategory;
}

export type SettingsDeleteOption =
  | "jobStatus"
  | "leadStatus"
  | "leadType"
  | "projectType"
  | "paymentStatus";

export type SettingsDeletableEntity =
  | TransformedJobStatus
  | OrganizationLeadStatusSetting
  | OrganizationLeadTypeSetting
  | PaymentStatus
  | ProjectType;

export function getSettingsEntityLabel(
  entity: SettingsDeletableEntity
): string {
  if ("name" in entity && typeof entity.name === "string") {
    return entity.name;
  }
  if ("title" in entity && typeof entity.title === "string") {
    return entity.title;
  }
  return "item";
}

export interface ConfigurableStatusLike extends Pick<
  Status,
  "id" | "title" | "color"
> {
  is_default?: boolean;
  editable?: boolean;
}
