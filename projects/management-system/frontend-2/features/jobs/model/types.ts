import type { Status } from "@/api/types";

// Base fields shared by all job creation forms
export interface JobFormValues {
  description?: string;
  selectedContactIds: number[];
  selectedFarmIds: number[];
  latitude?: number;
  longitude?: number;
  vertices?: unknown;
  equipments?: Array<{ equipment: number }>;
  /** Required when creating a job. Used for crew group auto-assignment. */
  projectTypeId: number;
}

// Tiling jobs additionally carry acreage, designers, and crew
export interface TilingJobFormValues extends JobFormValues {
  acre?: string;
  designers?: number[];
  crew?: number[];
}

// Excavation jobs carry designers and crew (no acreage)
export interface ExcavationJobFormValues extends JobFormValues {
  designers?: number[];
  crew?: number[];
}

// Shared form values for the job-status add/edit modal
export type StatusFormValues = Pick<Status, "title" | "color"> & {
  id?: number;
  number?: number | string;
};
