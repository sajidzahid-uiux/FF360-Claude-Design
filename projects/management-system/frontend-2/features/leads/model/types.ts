import type { Status } from "@/api/types";

// Shared form values for all lead creation forms
export interface LeadFormValues {
  selectedContactIds: number[];
  selectedFarmIds: number[];
  description?: string;
  latitude?: number;
  longitude?: number;
  vertices?: unknown;
  acre?: string | number;
  designers?: number[];
  lead_type?: number;
}

// Shared form values for the lead-type (source) add/edit modal
export type LeadTypeFormValues = Pick<Status, "title" | "color"> & {
  id?: number;
};
