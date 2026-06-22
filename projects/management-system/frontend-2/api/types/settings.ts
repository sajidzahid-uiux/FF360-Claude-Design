import type { JobType } from "@/constants/enums";

import type { IdOf, OrganizationJobStatus, Status } from "./common";

/** Lead pipeline status from organization settings (`LeadStatusSerializer`). */
export interface OrganizationLeadStatusSetting extends Status {
  is_default: boolean;
}

/** Lead source/type from organization settings (`LeadTypesSerializer`). */
export interface OrganizationLeadTypeSetting extends Status {
  is_default: boolean;
}

/** Payment status from organization settings (`PaymentStatusSerializer`). */
export interface PaymentStatus extends Status {
  is_default: boolean;
}

export type OrganizationJobStatusWritePayload = Partial<
  Omit<OrganizationJobStatus, "id">
>;

export interface OrganizationJobStatusUpdateVariables extends OrganizationJobStatusWritePayload {
  id: IdOf<OrganizationJobStatus>;
}

export type OrganizationJobStatusCreatePayload =
  OrganizationJobStatusWritePayload;

export interface OrganizationJobStatusCreateArgs {
  newStatus: OrganizationJobStatusCreatePayload;
  Type: JobType | string;
}

export type OrganizationLeadStatusWritePayload = Partial<
  Omit<OrganizationLeadStatusSetting, "id">
>;

export interface OrganizationLeadStatusUpdateVariables extends OrganizationLeadStatusWritePayload {
  id: IdOf<OrganizationLeadStatusSetting>;
}

export type OrganizationLeadTypeWritePayload = Partial<
  Omit<OrganizationLeadTypeSetting, "id">
>;

export interface OrganizationLeadTypeUpdateVariables extends OrganizationLeadTypeWritePayload {
  id: IdOf<OrganizationLeadTypeSetting>;
}

export type OrganizationLeadStatusCreatePayload =
  OrganizationLeadStatusWritePayload;

export type OrganizationLeadTypeCreatePayload =
  OrganizationLeadTypeWritePayload;
