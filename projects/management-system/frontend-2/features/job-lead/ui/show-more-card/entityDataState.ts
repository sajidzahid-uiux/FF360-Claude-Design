import type {
  ContactSubtype,
  ContactSummaryPartial,
  NotesTabAccess,
  ProjectType,
  StakeholderContact,
  StakeholderFarm,
} from "@/api/types";
import type { XmlMapData } from "@/shared/ui/common/XmlGeometriesLayer";

/** SHP map payload on job/lead detail (matches BoundaryMap `shpmap`). */
export interface EntityShpMapData {
  id: number;
  file: string;
  data: Record<string, [number, number][]>;
}

/** KML map payload on job/lead detail (matches BoundaryMap `kmlmap`). */
export interface EntityKmlMapData {
  id: number;
  file: string;
  data?: unknown;
}

/** Contact info nested on entity (full_name, phone_number, id, etc.) */
export type EntityContactInfo = ContactSummaryPartial & {
  contact_subtype?: ContactSubtype;
  farm_management_names?: string[];
};

/** Job/lead detail working state for ShowMoreCard (API entity + patched fields). */
export interface EntityDataState {
  id?: number;
  title?: string;
  description?: string;
  po_number?: string;
  one_call?: boolean | string;
  one_call_date?: string | null;
  job_status?: unknown;
  lead_status?: unknown;
  /** Assigned designer member ids (tiling leads/jobs). */
  designers?: number[];
  equipments?: unknown[];
  last_updated?: string;
  last_updated_by?: number;
  progress_bar?: number | string;
  on_hold?: boolean;
  cancelled?: boolean;
  contact_info?: EntityContactInfo;
  contacts_count?: number;
  farms_count?: number;
  contacts?: StakeholderContact[];
  farms?: StakeholderFarm[];
  farm_info?: {
    id?: number;
    name?: string;
    acreage?: number | string;
    vertices?: unknown;
    latitude?: number;
    longitude?: number;
  } | null;
  acers?: number | string;
  lead_type?: unknown;
  estimate_sent?: boolean;
  contract_sent?: boolean;
  operator?: number | null;
  operator_info?: unknown;
  start_date?: string | null;
  end_date?: string | null;
  extra_days?: number;
  total_days?: number;
  estimate_number?: string;
  canAccessOnSiteTracking?: boolean;
  notesTabAccess?: NotesTabAccess;
  job_lead_acre?: number | null;
  job_footage?: number | null;
  raisers_installed?: number | null;
  url?: string;
  job_object_subclass?: string;
  object_type?: string;
  jobType?: string;
  model?: string;
  xmlmap?: XmlMapData | null;
  shpmap?: EntityShpMapData | null;
  kmlmap?: EntityKmlMapData | null;
  xmlmap_v2?: XmlMapData[];
  shpmap_v2?: EntityShpMapData[];
  kmlmap_v2?: EntityKmlMapData[];
  vendor_page?: unknown;
  can_create_order_pipe?: boolean;
  project_type?: ProjectType | null;
  material_status?: string | null;
  sales_price?: number | string | null;
}

/** Merge API/patch payloads into ShowMoreCard entity state. */
export function mergeEntityDataState(
  prev: EntityDataState,
  patch: unknown
): EntityDataState {
  return { ...prev, ...(patch as EntityDataState) };
}
