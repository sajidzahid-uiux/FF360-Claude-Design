import type { MockRoute } from "./types";

/**
 * ORDER PIPE (vendor forms v2) dummy data for "Sajid & Sons Contractors" (org 1).
 *
 * Endpoints (mockApi normalizes url -> protocol/host/query stripped):
 *  - ms/organizations/1/vendor_forms-v2/        -> RAW array of VendorFormV2
 *      (VendorFormsService.getVendorForms; OrderPipePageContent maps these into
 *       table / grid / kanban views. The list search + order_status filter live
 *       in the query string, which the mock drops, so this one list route serves
 *       every filter combination — the page filters/paginates client-side.)
 *  - ms/organizations/1/vendor_forms-v2/<id>/   -> single VendorFormV2 (list:false)
 *      (VendorFormsService.getVendorForm -> OrderPipeWizard detail view.)
 *
 * List/grid/kanban renderers (OrderPipePageContent + OrderPipeCard) read:
 *   id, job, job_name, estimate_number, po_number, order_status, vendor_status,
 *   contact_info.full_name, farm_name.
 *
 * Detail wizard (OrderPipeWizard + ReviewLeft + getOrderPipeBoundaryMapProps)
 * additionally reads (all null-guarded but populated here for a full review):
 *   vendor_id, vendor {name,phone_number,email,address,state,lat,long,...},
 *   items[] {pipe_type,sub_type,size,quantity}, delivery_locations[] {id,sequence,
 *   label,lat,lng,items[]{item_key,to_install_quantity,unit}}, contractor_name,
 *   contact_info {full_name,phone_number,email,address}, job_farms[] {id,name,
 *   is_primary,latitude,longitude,vertices,acreage}, job_field_boundaries,
 *   job_core_points[], location, longitude/latitude, order_pdf, is_ready_for_review.
 *
 * order_status values match ORDER_PIPE_STATUS_LABELS so the kanban groups them:
 *   "Pending" | "Contact Supplier" | "Delivered" (kanban getItemStatus falls back
 *   to "Pending" when order_status is empty).
 */

// ---- Shared vendor (pipe supplier) records, referenced across forms ----
const VENDOR_ADS = {
  vendor_id: 9001,
  provider_id: 1,
  provider_name: "Advanced Drainage Systems",
  name: "ADS Pipe Supply — Ames Yard",
  email: "orders@ads-ames.com",
  phone_number: "+1 515 555 0701",
  address: "2200 SE 5th St, Ames, IA 50010",
  state: "IA",
  lat: 42.0008,
  long: -93.6091,
  google_link: "https://maps.google.com/?q=ADS+Pipe+Supply+Ames",
};

const VENDOR_PRINSCO = {
  vendor_id: 9002,
  provider_id: 2,
  provider_name: "Prinsco Inc.",
  name: "Prinsco Distribution — Bloomington",
  email: "sales@prinsco-bloomington.com",
  phone_number: "+1 309 555 0744",
  address: "1801 W Market St, Bloomington, IL 61701",
  state: "IL",
  lat: 40.4795,
  long: -89.0301,
  google_link: "https://maps.google.com/?q=Prinsco+Bloomington",
};

const VENDOR_HANCOR = {
  vendor_id: 9003,
  provider_id: 3,
  provider_name: "Hancor Pipe Co.",
  name: "Hancor Pipe — Dyersville Depot",
  email: "dispatch@hancor-dyersville.com",
  phone_number: "+1 563 555 0719",
  address: "910 9th St SE, Dyersville, IA 52040",
  state: "IA",
  lat: 42.4789,
  long: -91.1227,
  google_link: "https://maps.google.com/?q=Hancor+Pipe+Dyersville",
};

// ---- Shared order line items ----
const ITEMS_TILING_MAIN = [
  { pipe_type: "Dual Wall HDPE", sub_type: "Perforated", size: "12", quantity: 4200 },
  { pipe_type: "Dual Wall HDPE", sub_type: "Perforated", size: "8", quantity: 9800 },
  { pipe_type: "Single Wall HDPE", sub_type: "Perforated", size: "4", quantity: 24000 },
  { pipe_type: "Fittings", sub_type: "Tee", size: "8x4", quantity: 180 },
];

const ITEMS_TILING_PATTERN = [
  { pipe_type: "Dual Wall HDPE", sub_type: "Perforated", size: "10", quantity: 3600 },
  { pipe_type: "Single Wall HDPE", sub_type: "Perforated", size: "4", quantity: 18500 },
  { pipe_type: "Fittings", sub_type: "Coupler", size: "4", quantity: 240 },
];

const ITEMS_EXCAVATION = [
  { pipe_type: "Dual Wall HDPE", sub_type: "Solid", size: "15", quantity: 1200 },
  { pipe_type: "Smooth Interior", sub_type: "Solid", size: "24", quantity: 600 },
  { pipe_type: "Fittings", sub_type: "Reducer", size: "24x15", quantity: 24 },
];

const ITEMS_REPAIR = [
  { pipe_type: "Dual Wall HDPE", sub_type: "Solid", size: "8", quantity: 320 },
  { pipe_type: "Fittings", sub_type: "Split Repair Coupler", size: "8", quantity: 16 },
];

// ---- Shared contact_info (the farm client on the job) ----
function contact(
  id: number,
  full_name: string,
  phone_number: string,
  email: string,
  address: string
) {
  return { id, full_name, phone_number, home_phone_number: null, email, address };
}

const CONTACT_JOHNSON = contact(
  11,
  "Johnson Family Farm",
  "+1 515 555 0188",
  "office@johnsonfamilyfarm.com",
  "1450 County Rd E34, Ames, IA 50010"
);
const CONTACT_PRAIRIE = contact(
  12,
  "Prairie View Acres",
  "+1 309 555 0211",
  "contact@prairieviewacres.com",
  "8820 N 500th Ave, Bloomington, IL 61704"
);
const CONTACT_HILLTOP = contact(
  13,
  "Hilltop Dairy",
  "+1 563 555 0177",
  "barn@hilltopdairy.com",
  "3300 Ridge Rd, Dyersville, IA 52040"
);
const CONTACT_RIVERSIDE = contact(
  14,
  "Riverside Grain Co.",
  "+1 515 555 0233",
  "ops@riversidegrain.com",
  "9100 River Rd, Boone, IA 50036"
);
const CONTACT_MEADOW = contact(
  15,
  "Meadowbrook Farms",
  "+1 319 555 0144",
  "info@meadowbrookfarms.com",
  "7745 Hwy 1, Solon, IA 52333"
);
const CONTACT_OAKRIDGE = contact(
  16,
  "Oakridge Agronomy",
  "+1 217 555 0199",
  "field@oakridgeagronomy.com",
  "12200 E 200 North Rd, Champaign, IL 61822"
);
const CONTACT_SANDHILL = contact(
  17,
  "Sandhill Ranch",
  "+1 712 555 0166",
  "owner@sandhillranch.com",
  "4400 380th St, Carroll, IA 51401"
);
const CONTACT_CLEARWATER = contact(
  18,
  "Clearwater Fields",
  "+1 563 555 0122",
  "contact@clearwaterfields.com",
  "2100 280th Ave, Maquoketa, IA 52060"
);

// ---- Delivery locations (pipe drop points) for the fully-shaped detail record ----
const DELIVERY_LOCATIONS_JOHNSON = [
  {
    id: 7101,
    sequence: 1,
    label: "North field gate — staging",
    lat: 42.0521,
    lng: -93.6312,
    items: [
      { item_key: "dual_wall_hdpe-perforated-12", to_install_quantity: 4200, unit: "ft" },
      { item_key: "dual_wall_hdpe-perforated-8", to_install_quantity: 6000, unit: "ft" },
    ],
  },
  {
    id: 7102,
    sequence: 2,
    label: "East lateral drop",
    lat: 42.0498,
    lng: -93.6188,
    items: [
      { item_key: "dual_wall_hdpe-perforated-8", to_install_quantity: 3800, unit: "ft" },
      { item_key: "single_wall_hdpe-perforated-4", to_install_quantity: 24000, unit: "ft" },
      { item_key: "fittings-tee-8x4", to_install_quantity: 180, unit: "ea" },
    ],
  },
];

// ---- Shared job field boundary + core points for the detail record ----
const JOHNSON_BOUNDARY = {
  longitude: -93.6251,
  latitude: 42.0509,
  vertices: [
    [-93.6312, 42.0541],
    [-93.6188, 42.0541],
    [-93.6188, 42.0478],
    [-93.6312, 42.0478],
    [-93.6312, 42.0541],
  ] as Array<[number, number]>,
};

const JOHNSON_FARMS = [
  {
    id: 501,
    name: "Johnson Family Farm — North Quarter",
    acreage: 160,
    is_primary: true,
    latitude: 42.0509,
    longitude: -93.6251,
    contact_id: 11,
    vertices: JOHNSON_BOUNDARY.vertices,
  },
  {
    id: 521,
    name: "Johnson Family Farm — Creek Outlet",
    acreage: 80,
    is_primary: false,
    latitude: 42.0444,
    longitude: -93.6105,
    contact_id: 11,
    vertices: [
      [-93.6155, 42.0466],
      [-93.6055, 42.0466],
      [-93.6055, 42.0422],
      [-93.6155, 42.0422],
      [-93.6155, 42.0466],
    ] as Array<[number, number]>,
  },
];

const JOHNSON_CORE_POINTS = [
  {
    id: 8101,
    organization: 1,
    job: 101,
    lead: null,
    name: "Core A — outlet",
    description: "Main outlet tie-in to county ditch",
    latitude: 42.0481,
    longitude: -93.6191,
    created_at: "2026-05-30T14:00:00Z",
    updated_at: "2026-06-02T10:15:00Z",
  },
  {
    id: 8102,
    organization: 1,
    job: 101,
    lead: null,
    name: "Core B — high spot",
    description: "Grade break, north 80",
    latitude: 42.0535,
    longitude: -93.6275,
    created_at: "2026-05-30T14:10:00Z",
    updated_at: "2026-06-02T10:18:00Z",
  },
];

// ============================================================
// LIST RECORDS — 12 vendor forms / pipe orders
// ============================================================
const vendorForms = [
  // 1 — Delivered, full tiling order, has vendor + items + delivery locations
  {
    id: 101,
    job: 101,
    job_id: 101,
    job_name: "Mainline tile install — north 80",
    vendor_id: VENDOR_ADS.vendor_id,
    vendor: VENDOR_ADS,
    contractor_name: "Sajid & Sons Contractors",
    contact_info: CONTACT_JOHNSON,
    farm_name: "Johnson Family Farm — North Quarter",
    location: "1450 County Rd E34, Ames, IA 50010",
    longitude: -93.6251,
    latitude: 42.0509,
    items: ITEMS_TILING_MAIN,
    delivery_locations: DELIVERY_LOCATIONS_JOHNSON,
    order_pdf: "https://example.com/orders/po-2026-0101.pdf",
    order_status: "Delivered",
    vendor_status: "Delivered",
    estimate_number: "EST-2026-0101",
    po_number: "PO-2026-0101",
    is_ready_for_review: true,
    job_field_boundaries: JOHNSON_BOUNDARY,
    job_farms: JOHNSON_FARMS,
    job_core_points: JOHNSON_CORE_POINTS,
    job_xmlmap: null,
    job_shpmap: null,
    job_kmlmap: null,
  },
  // 2 — Pending, tiling, vendor + items, no delivery locations yet
  {
    id: 102,
    job: 106,
    job_id: 106,
    job_name: "Mainline + laterals — west 160",
    vendor_id: VENDOR_PRINSCO.vendor_id,
    vendor: VENDOR_PRINSCO,
    contractor_name: "Sajid & Sons Contractors",
    contact_info: CONTACT_OAKRIDGE,
    farm_name: "Oakridge Agronomy — Section 12",
    location: "12200 E 200 North Rd, Champaign, IL 61822",
    longitude: -88.2434,
    latitude: 40.1164,
    items: ITEMS_TILING_PATTERN,
    delivery_locations: [],
    order_pdf: null,
    order_status: "Pending",
    vendor_status: "Pending",
    estimate_number: "EST-2026-0106",
    po_number: null,
    is_ready_for_review: false,
    job_field_boundaries: null,
    job_farms: [],
    job_core_points: [],
    job_xmlmap: null,
    job_shpmap: null,
    job_kmlmap: null,
  },
  // 3 — Contact Supplier, excavation, vendor selected, items added
  {
    id: 103,
    job: 102,
    job_id: 102,
    job_name: "Retention basin excavation",
    vendor_id: VENDOR_HANCOR.vendor_id,
    vendor: VENDOR_HANCOR,
    contractor_name: "Sajid & Sons Contractors",
    contact_info: CONTACT_PRAIRIE,
    farm_name: "Prairie View Acres",
    location: "8820 N 500th Ave, Bloomington, IL 61704",
    longitude: -88.9937,
    latitude: 40.4842,
    items: ITEMS_EXCAVATION,
    delivery_locations: [],
    order_pdf: null,
    order_status: "Contact Supplier",
    vendor_status: "Contact Supplier",
    estimate_number: null,
    po_number: "PO-2026-0102",
    is_ready_for_review: false,
    job_field_boundaries: null,
    job_farms: [],
    job_core_points: [],
    job_xmlmap: null,
    job_shpmap: null,
    job_kmlmap: null,
  },
  // 4 — Pending, repair, no vendor selected yet (step 1)
  {
    id: 104,
    job: 103,
    job_id: 103,
    job_name: "Tile main blowout repair — east field",
    vendor_id: null,
    vendor: null,
    contractor_name: "Sajid & Sons Contractors",
    contact_info: CONTACT_HILLTOP,
    farm_name: "Hilltop Dairy",
    location: "3300 Ridge Rd, Dyersville, IA 52040",
    longitude: -91.1227,
    latitude: 42.4789,
    items: null,
    delivery_locations: [],
    order_pdf: null,
    order_status: "Pending",
    vendor_status: "Pending",
    estimate_number: null,
    po_number: null,
    is_ready_for_review: false,
    job_field_boundaries: null,
    job_farms: [],
    job_core_points: [],
    job_xmlmap: null,
    job_shpmap: null,
    job_kmlmap: null,
  },
  // 5 — Delivered, pattern tiling completed job
  {
    id: 105,
    job: 104,
    job_id: 104,
    job_name: "Pattern tile — south 120 acres",
    vendor_id: VENDOR_PRINSCO.vendor_id,
    vendor: VENDOR_PRINSCO,
    contractor_name: "Sajid & Sons Contractors",
    contact_info: CONTACT_RIVERSIDE,
    farm_name: "Riverside Grain Co. — Bottoms",
    location: "9100 River Rd, Boone, IA 50036",
    longitude: -93.8801,
    latitude: 42.0598,
    items: ITEMS_TILING_PATTERN,
    delivery_locations: [
      {
        id: 7201,
        sequence: 1,
        label: "South staging pad",
        lat: 42.0601,
        lng: -93.8812,
        items: [
          { item_key: "dual_wall_hdpe-perforated-10", to_install_quantity: 3600, unit: "ft" },
          { item_key: "single_wall_hdpe-perforated-4", to_install_quantity: 18500, unit: "ft" },
        ],
      },
    ],
    order_pdf: "https://example.com/orders/po-2026-0104.pdf",
    order_status: "Delivered",
    vendor_status: "Delivered",
    estimate_number: "EST-2026-0104",
    po_number: "PO-2026-0104",
    is_ready_for_review: true,
    job_field_boundaries: null,
    job_farms: [],
    job_core_points: [],
    job_xmlmap: null,
    job_shpmap: null,
    job_kmlmap: null,
  },
  // 6 — Contact Supplier, excavation waterway
  {
    id: 106,
    job: 105,
    job_id: 105,
    job_name: "Grassed waterway regrade",
    vendor_id: VENDOR_ADS.vendor_id,
    vendor: VENDOR_ADS,
    contractor_name: "Sajid & Sons Contractors",
    contact_info: CONTACT_MEADOW,
    farm_name: "Meadowbrook Farms",
    location: "7745 Hwy 1, Solon, IA 52333",
    longitude: -91.4938,
    latitude: 41.8077,
    items: ITEMS_EXCAVATION,
    delivery_locations: [],
    order_pdf: null,
    order_status: "Contact Supplier",
    vendor_status: "Contact Supplier",
    estimate_number: "EST-2026-0105",
    po_number: null,
    is_ready_for_review: false,
    job_field_boundaries: null,
    job_farms: [],
    job_core_points: [],
    job_xmlmap: null,
    job_shpmap: null,
    job_kmlmap: null,
  },
  // 7 — Pending, repair, vendor + items
  {
    id: 107,
    job: 107,
    job_id: 107,
    job_name: "Tile junction box rebuild",
    vendor_id: VENDOR_HANCOR.vendor_id,
    vendor: VENDOR_HANCOR,
    contractor_name: "Sajid & Sons Contractors",
    contact_info: CONTACT_HILLTOP,
    farm_name: "Hilltop Dairy — Lot 3",
    location: "3300 Ridge Rd, Dyersville, IA 52040",
    longitude: -91.1227,
    latitude: 42.4789,
    items: ITEMS_REPAIR,
    delivery_locations: [],
    order_pdf: null,
    order_status: "Pending",
    vendor_status: "Pending",
    estimate_number: null,
    po_number: "PO-2026-0107",
    is_ready_for_review: false,
    job_field_boundaries: null,
    job_farms: [],
    job_core_points: [],
    job_xmlmap: null,
    job_shpmap: null,
    job_kmlmap: null,
  },
  // 8 — Delivered, big tiling order, Sandhill Ranch
  {
    id: 108,
    job: 109,
    job_id: 109,
    job_name: "Section 12 systematic tile — 320 acres",
    vendor_id: VENDOR_ADS.vendor_id,
    vendor: VENDOR_ADS,
    contractor_name: "Sajid & Sons Contractors",
    contact_info: CONTACT_SANDHILL,
    farm_name: "Sandhill Ranch — Section 12",
    location: "4400 380th St, Carroll, IA 51401",
    longitude: -94.8669,
    latitude: 42.0686,
    items: ITEMS_TILING_MAIN,
    delivery_locations: [
      {
        id: 7301,
        sequence: 1,
        label: "West approach",
        lat: 42.0699,
        lng: -94.8702,
        items: [
          { item_key: "dual_wall_hdpe-perforated-12", to_install_quantity: 4200, unit: "ft" },
          { item_key: "dual_wall_hdpe-perforated-8", to_install_quantity: 9800, unit: "ft" },
        ],
      },
      {
        id: 7302,
        sequence: 2,
        label: "South laterals",
        lat: 42.0651,
        lng: -94.8631,
        items: [
          { item_key: "single_wall_hdpe-perforated-4", to_install_quantity: 24000, unit: "ft" },
          { item_key: "fittings-tee-8x4", to_install_quantity: 180, unit: "ea" },
        ],
      },
    ],
    order_pdf: "https://example.com/orders/po-2026-0109.pdf",
    order_status: "Delivered",
    vendor_status: "Delivered",
    estimate_number: "EST-2026-0109",
    po_number: "PO-2026-0109",
    is_ready_for_review: true,
    job_field_boundaries: null,
    job_farms: [],
    job_core_points: [],
    job_xmlmap: null,
    job_shpmap: null,
    job_kmlmap: null,
  },
  // 9 — Pending, tiling, Clearwater Fields
  {
    id: 109,
    job: 110,
    job_id: 110,
    job_name: "Tile estimate approved — Clearwater 200",
    vendor_id: VENDOR_PRINSCO.vendor_id,
    vendor: VENDOR_PRINSCO,
    contractor_name: "Sajid & Sons Contractors",
    contact_info: CONTACT_CLEARWATER,
    farm_name: "Clearwater Fields",
    location: "2100 280th Ave, Maquoketa, IA 52060",
    longitude: -90.6657,
    latitude: 42.0686,
    items: ITEMS_TILING_PATTERN,
    delivery_locations: [],
    order_pdf: null,
    order_status: "Pending",
    vendor_status: "Pending",
    estimate_number: "EST-2026-0110",
    po_number: null,
    is_ready_for_review: false,
    job_field_boundaries: null,
    job_farms: [],
    job_core_points: [],
    job_xmlmap: null,
    job_shpmap: null,
    job_kmlmap: null,
  },
  // 10 — Contact Supplier, repair, no estimate/po (renders "—" in Number col)
  {
    id: 110,
    job: 111,
    job_id: 111,
    job_name: "Outlet pipe replacement — creek bank",
    vendor_id: VENDOR_HANCOR.vendor_id,
    vendor: VENDOR_HANCOR,
    contractor_name: "Sajid & Sons Contractors",
    contact_info: CONTACT_JOHNSON,
    farm_name: "Johnson Family Farm — Creek Outlet",
    location: "1450 County Rd E34, Ames, IA 50010",
    longitude: -93.6105,
    latitude: 42.0444,
    items: ITEMS_REPAIR,
    delivery_locations: [],
    order_pdf: null,
    order_status: "Contact Supplier",
    vendor_status: "Contact Supplier",
    estimate_number: null,
    po_number: null,
    is_ready_for_review: false,
    job_field_boundaries: null,
    job_farms: [],
    job_core_points: [],
    job_xmlmap: null,
    job_shpmap: null,
    job_kmlmap: null,
  },
  // 11 — Delivered, excavation culvert, Prairie View
  {
    id: 111,
    job: 112,
    job_id: 112,
    job_name: "Field drive culvert — 24in",
    vendor_id: VENDOR_PRINSCO.vendor_id,
    vendor: VENDOR_PRINSCO,
    contractor_name: "Sajid & Sons Contractors",
    contact_info: CONTACT_PRAIRIE,
    farm_name: "Prairie View Acres — Section 8",
    location: "8820 N 500th Ave, Bloomington, IL 61704",
    longitude: -88.9937,
    latitude: 40.4842,
    items: ITEMS_EXCAVATION,
    delivery_locations: [
      {
        id: 7401,
        sequence: 1,
        label: "Drive entrance",
        lat: 40.4851,
        lng: -88.9948,
        items: [
          { item_key: "smooth_interior-solid-24", to_install_quantity: 600, unit: "ft" },
        ],
      },
    ],
    order_pdf: "https://example.com/orders/po-2026-0112.pdf",
    order_status: "Delivered",
    vendor_status: "Delivered",
    estimate_number: "EST-2026-0112",
    po_number: "PO-2026-0112",
    is_ready_for_review: true,
    job_field_boundaries: null,
    job_farms: [],
    job_core_points: [],
    job_xmlmap: null,
    job_shpmap: null,
    job_kmlmap: null,
  },
  // 12 — Pending, no vendor, no items (fresh order — kanban falls back to Pending)
  {
    id: 112,
    job: 113,
    job_id: 113,
    job_name: "New tile estimate — Meadowbrook 240",
    vendor_id: null,
    vendor: null,
    contractor_name: "Sajid & Sons Contractors",
    contact_info: CONTACT_MEADOW,
    farm_name: "Meadowbrook Farms",
    location: "7745 Hwy 1, Solon, IA 52333",
    longitude: -91.4938,
    latitude: 41.8077,
    items: null,
    delivery_locations: [],
    order_pdf: null,
    order_status: "Pending",
    vendor_status: "Pending",
    estimate_number: "EST-2026-0113",
    po_number: null,
    is_ready_for_review: false,
    job_field_boundaries: null,
    job_farms: [],
    job_core_points: [],
    job_xmlmap: null,
    job_shpmap: null,
    job_kmlmap: null,
  },
];

export const routes: MockRoute[] = [
  // LIST — RAW array of vendor forms (search/order_status filter applied client-side)
  {
    match: /^ms\/organizations\/\d+\/vendor_forms-v2\/?$/,
    data: vendorForms,
  },
  // DETAIL — fully shaped vendor form (id 101). The list `vendor_forms-v2/<id>/`
  // path must be matched before mockApi's generic `…/<id>/ -> {}` fallback so the
  // OrderPipeWizard receives a complete order (vendor + items + delivery locations
  // + field boundary + core points => review step renders end to end).
  {
    match: /^ms\/organizations\/\d+\/vendor_forms-v2\/\d+\/?$/,
    list: false,
    data: vendorForms[0],
  },
];
