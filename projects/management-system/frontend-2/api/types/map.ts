import { JobType, LeadType, ResourceType } from "@/constants/enums";
import type { MapFileType } from "@/shared/lib/mapFilesV2";
import type { UploadProgressHandler } from "@/shared/lib/uploadProgress";

import type { ObjectType, Status, Vertex } from "./common";
import type { JobOrLeadId } from "./leads";

// ============================================
// MAP JOB / LEAD
// ============================================

export interface MapContactInfo {
  id: number;
  full_name: string;
}

export interface MapFarmManagementContact {
  id: number;
  full_name: string;
  phone_number?: string;
}

export interface MapFarmInfo {
  id: number;
  name: string;
  acreage?: number;
}

/** Farm boundary entry on map-data jobs/leads (`farms` array). */
export interface MapFarmEntry {
  farm_id: number;
  farm_name: string;
  longitude?: number | null;
  latitude?: number | null;
  vertices?: Array<[number, number]> | Vertex[];
  is_primary: boolean;
}

export interface MapJob {
  id: number;
  title: string;
  po_number?: string;
  customer_name?: string;
  phone_number?: string;
  object_type: ObjectType;
  job_status?: Status;
  status?: string;
  latitude?: number;
  longitude?: number;
  vertices?: Array<[number, number]> | Vertex[];
  contact_info?: MapContactInfo;
  farm_info?: MapFarmInfo;
  job_type?: string;
  state?: string;
  xmlmap?: MapXmlMap;
  shpmap?: MapShpMap;
  kmlmap?: MapKmlMap;
  xmlmap_v2?: MapXmlMap[];
  shpmap_v2?: MapShpMap[];
  kmlmap_v2?: MapKmlMap[];
  farm_name?: string;
  farm_id?: number;
  farms?: MapFarmEntry[];
  farm_management_names?: string[];
  farm_management_contacts?: MapFarmManagementContact[];
  /** Display name from map-data API (string or null if unset). */
  project_type?: string | null;
}

export interface MapLead {
  id: number;
  title: string;
  po_number?: string;
  customer_name?: string;
  phone_number?: string;
  object_type: ObjectType;
  lead_status?: Status;
  status?: string;
  latitude?: number;
  longitude?: number;
  vertices?: Array<[number, number]> | Vertex[];
  contact_info?: MapContactInfo;
  lead_type?: string;
  state?: string;
  xmlmap?: MapXmlMap;
  shpmap?: MapShpMap;
  kmlmap?: MapKmlMap;
  xmlmap_v2?: MapXmlMap[];
  shpmap_v2?: MapShpMap[];
  kmlmap_v2?: MapKmlMap[];
  farm_name?: string;
  farm_id?: number;
  farms?: MapFarmEntry[];
  farm_management_names?: string[];
  farm_management_contacts?: MapFarmManagementContact[];
  /** Display name from map-data API (string or null if unset). */
  project_type?: string | null;
}

// ============================================
// MAP FILES
// ============================================

export interface MapXmlMap {
  id: number;
  file: string;
  data: {
    design_points: number[][];
  };
}

export interface MapShpMap {
  id: number;
  file: string;
  data: {
    geometry_type: string;
  };
}

export interface MapKmlMap {
  id: number;
  file: string;
  data: unknown; // BackendKmlData - can be single placemark, array, or keyed object
}

// ============================================
// MAP LEGEND
// ============================================

export interface MapLegend {
  id: number;
  name?: string;
  legend_type?: string;
  legend_type_display?: string;
  color: string;
  icon?: string;
  icon_png?: string;
  icon_svg?: string;
  order?: number;
  is_visible?: boolean;
  created_at: string;
  last_updated?: string;
  updated_at?: string;
}

export interface MapLegendCreatePayload {
  name: string;
  color: string;
  icon?: string;
  order?: number;
  is_visible?: boolean;
}

export type MapLegendUpdatePayload = Partial<MapLegendCreatePayload> & {
  icon_png?: string;
  icon_svg?: string;
};

// ============================================
// MAP DATA RESPONSE
// ============================================

export interface MapDataResponse {
  jobs: MapJob[];
  leads: MapLead[];
}

export type MapDataApiResult = MapDataResponse;

export interface MapLegendResponse {
  success: boolean;
  message: string;
  data: MapLegend[];
}

export interface MapLegendUpdateResponse {
  success: boolean;
  message: string;
  data: MapLegend;
}

// ============================================
// MAP DATA PARAMS
// ============================================

export interface MapDataParams {
  job_type?: string;
  job_types?: string;
  job_statuses?: string;
  tiling_job_statuses?: string;
  excavation_job_statuses?: string;
  repair_job_statuses?: string;
  lead_type?: string;
  lead_types?: string;
  lead_sources?: string;
  lead_statuses?: string;
  states?: string;
  /** Comma-separated ProjectType ids (map-data `project_types`). */
  project_types?: string;
  include_archived?: boolean;
  assigned_to?: string;
}

// ============================================
// FILTER OPTIONS
// ============================================

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterCategory {
  key: keyof MapDataParams;
  label: string;
  options: FilterOption[];
}

export interface DeleteMapFileVariables {
  entityType: ResourceType.JOB | ResourceType.LEAD;
  id: JobOrLeadId;
  fileType: MapFileType;
  /** When set, deletes a single v2 map entry; otherwise deletes the legacy map. */
  mapId?: number;
  jobType?: JobType;
  leadType?: LeadType;
}

export interface UploadMapFilesVariables {
  entityType: ResourceType.JOB | ResourceType.LEAD;
  id: JobOrLeadId;
  fileType: MapFileType;
  files: File[];
  jobType?: JobType;
  leadType?: LeadType;
  onProgress?: UploadProgressHandler;
}
