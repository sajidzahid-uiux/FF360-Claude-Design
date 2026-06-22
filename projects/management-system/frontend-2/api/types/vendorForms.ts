import type { IdOf } from "./common";
import type { ContactInfo } from "./jobs";

// ============================================
// VENDOR FORMS V2 TYPES
// ============================================
// Map entry types for job_xmlmap, job_shpmap, job_kmlmap (vendor form API)
// ============================================

/** XML map data: section-based (sectionId → { points, color?, ... }) or legacy design_points. */
export type VendorFormJobXmlMapData =
  | Record<
      string,
      {
        points: Array<[number, number]>;
        color?: string;
      }
    >
  | { design_points: number[][] };

/** XML map entry (job_xmlmap). */
export interface VendorFormJobXmlMap {
  id: number;
  file: string;
  data: VendorFormJobXmlMapData;
}

/** SHP map data: shape key → array of [lng, lat] ring coordinates. */
export type VendorFormJobShpMapData = Record<string, Array<[number, number]>>;

/** SHP map entry (job_shpmap). */
export interface VendorFormJobShpMap {
  id: number;
  file: string;
  data: VendorFormJobShpMapData;
}

/** KML placemark style (color, width, opacity). */
export interface VendorFormKmlPlacemarkStyle {
  color?: string;
  width?: number;
  opacity?: number;
}

/** KML placemark geometry (type + coordinates). */
export interface VendorFormKmlPlacemarkGeometry {
  type: string;
  coordinates: Array<[number, number]>;
}

/** KML placemark in job_kmlmap data. */
export interface VendorFormKmlPlacemark {
  name?: string;
  style?: VendorFormKmlPlacemarkStyle;
  geometry?: VendorFormKmlPlacemarkGeometry;
  pipe_size?: Record<string, unknown>;
  description?: string;
}

/** KML map data: object of placemarks (keyed by id/name) or array of placemarks. */
export type VendorFormJobKmlMapData =
  | Record<string, VendorFormKmlPlacemark>
  | VendorFormKmlPlacemark[];

/** KML map entry (job_kmlmap). */
export interface VendorFormJobKmlMap {
  id: number;
  file: string;
  data: VendorFormJobKmlMapData;
}

// ============================================
// VENDOR FORMS V2 (continued)
// ============================================

export interface VendorFormItemV2 {
  pipe_type: string;
  sub_type?: string;
  size: string;
  quantity: number;
}

export interface VendorFormVendorInfo {
  lat: number;
  long: number;
  name: string;
  email: string;
  state: string;
  address: string;
  vendor_id: number;
  google_link: string;
  provider_id: number;
  phone_number: string;
  provider_name: string;
}

/** Core point on a job (for map display). */
export interface VendorFormJobCorePoint {
  id: number;
  organization: number;
  job: number;
  lead: number | null;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
}

/** Job field boundary (polygon vertices [lng, lat][] and center). */
export interface JobFieldBoundaries {
  longitude: number;
  latitude: number;
  vertices: Array<[number, number]>;
}

/** Farm on a job returned by vendor_forms-v2 (`job_farms`). */
export interface VendorFormJobFarm {
  id: number;
  name: string;
  acreage?: number;
  longitude?: number | null;
  latitude?: number | null;
  vertices?: Array<[number, number]>;
  contact_id?: number;
  is_primary: boolean;
}

export interface VendorFormV2 {
  id: number;
  job: number;
  vendor_id: number | null;
  vendor: VendorFormVendorInfo | null;
  location: string;
  items: VendorFormItemV2[] | null;
  order_pdf: string | null;
  order_status: string;
  delivery_locations: DeliveryLocation[];
  /** Job-level: core points for map */
  job_core_points?: VendorFormJobCorePoint[];
  /** Job-level: field boundary polygon (legacy primary farm; prefer `job_farms`) */
  job_field_boundaries?: JobFieldBoundaries | null;
  /** Job-level: all farms with boundaries (multi-farm jobs). */
  job_farms?: VendorFormJobFarm[];
  /** Job-level: map files (vendor form API shape) */
  job_xmlmap?: VendorFormJobXmlMap | null;
  job_shpmap?: VendorFormJobShpMap | null;
  job_kmlmap?: VendorFormJobKmlMap | null;
  // Job-level contact / org fields
  contractor_name?: string | null;
  contact_info?: Partial<ContactInfo> | null;
  is_ready_for_review?: boolean;
  // Legacy / optional fields (backward compat)
  longitude?: number | null;
  latitude?: number | null;
  job_id?: number | null;
  job_name?: string;
  po_number?: string | null;
  estimate_number?: string | null;
  vendor_status?: string | null;
}

export interface VendorFormCreatePayload {
  job: number;
  vendor_id?: number;
  location?: string;
  items?: VendorFormItemV2[];
}

export interface VendorFormUpdatePayload {
  job?: number;
  vendor_id?: number | null;
  location?: string;
  items?: VendorFormItemV2[];
  order_status?: string;
}

export interface VendorFormListParams {
  job_id?: number | string;
  search?: string;
  order_status?: string | string[];
  vendor_status?: string;
}

// ============================================
// PIPE DROP LOCATION TYPES
// ============================================

export interface OrderItem {
  item_key: string;
  name: string;
  size: string;
  total_quantity: number;
  unit: string;
  assigned_total: number;
}

export interface RemainedOrderedItem {
  item_key: string;
  name: string;
  size: string;
  remained_quantity: number;
  unit: string;
}

export interface DeliveryLocationItem {
  item_key: string;
  to_install_quantity: number;
  unit: string;
}

export interface DeliveryLocation {
  id: number;
  sequence: number;
  label: string;
  lat: number;
  lng: number;
  items: DeliveryLocationItem[];
}

export interface DeliveryLocationCreatePayload {
  lat: number;
  lng: number;
  label?: string;
}

/** PATCH body for assigning items to a delivery location. */
export interface DeliveryLocationUpdatePayload {
  /** List of item_key + to_install_quantity. Required when install_all_remaining is false. */
  items?: { item_key: string; to_install_quantity: number }[];
  /** If true, assign all current remained quantities to this location. */
  install_all_remaining?: boolean;
}

export interface PipeDropPayload {
  order_items: OrderItem[];
  remained_ordered_items: RemainedOrderedItem[];
  delivery_locations: DeliveryLocation[];
}

export interface CanProceedResponse {
  can_proceed: boolean;
  message: string | null;
}

/** Response from generate invoice endpoint (presigned PDF URL). */
export interface GenerateInvoiceResponse {
  pdf_url: string;
}

export interface VendorFormUpdateArgs {
  vendorFormId: IdOf<VendorFormV2>;
  payload: VendorFormUpdatePayload;
}

export interface VendorFormInvoiceGenerateArgs {
  vendorFormId: IdOf<VendorFormV2>;
  filename?: string;
}

export interface DeliveryLocationUpdateArgs {
  locationId: IdOf<DeliveryLocation>;
  payload: DeliveryLocationUpdatePayload;
}
