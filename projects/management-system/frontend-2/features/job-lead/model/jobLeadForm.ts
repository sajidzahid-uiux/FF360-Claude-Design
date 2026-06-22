import { ResourceType } from "@/constants/enums";

export const JOB_LEAD_DESCRIPTION_MAX = 500;

export interface JobLeadFormState {
  selectedContact: string;
  selectedFarm: string;
  lead_type: string;
  projectTypeId: string;
  description: string;
  selectedDesigners: number[];
  selectedEquipment: number[];
}

export const DEFAULT_JOB_LEAD_FORM_STATE: JobLeadFormState = {
  selectedContact: "",
  selectedFarm: "",
  lead_type: "",
  projectTypeId: "",
  description: "",
  selectedDesigners: [],
  selectedEquipment: [],
};

export interface JobLeadSubmitLocationFields {
  latitude?: number;
  longitude?: number;
  vertices?: unknown;
}

/** Values emitted by {@link JobLeadForm} when creating a job. */
export interface JobCreateSubmitValues extends JobLeadSubmitLocationFields {
  selectedContact: string;
  selectedFarm?: string;
  description?: string;
  projectTypeId: number;
  equipments?: Array<{ equipment: number }>;
  designers?: number[];
  crew?: number[];
  acre?: string;
}

/** Values emitted by {@link JobLeadForm} when creating a lead. */
export interface LeadCreateSubmitValues extends JobLeadSubmitLocationFields {
  selectedContact: string;
  selectedFarm?: string;
  description?: string;
  lead_type?: number;
  designers?: number[];
  acre?: string | number;
}

export function isJobLeadFormSubmittable(
  entity: ResourceType.JOB | ResourceType.LEAD,
  values: JobLeadFormState
): boolean {
  if (!values.selectedContact.trim()) return false;
  if (entity === ResourceType.JOB) {
    return Boolean(values.projectTypeId.trim());
  }
  return Boolean(values.lead_type.trim());
}
