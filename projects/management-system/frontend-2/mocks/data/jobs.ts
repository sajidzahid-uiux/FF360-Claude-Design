import type { MockRoute } from "./types";

/**
 * JOBS mock data for "Sajid & Sons Contractors" (org 1).
 *
 * Endpoints (mockApi normalizes url -> protocol/host/query stripped):
 *  - ms/organizations/1/jobs/all/                  -> list (every job, all types)
 *  - ms/organizations/1/jobs/drainage_tiling/      -> list (tiling jobs)
 *  - ms/organizations/1/jobs/excavation/           -> list (excavation jobs)
 *  - ms/organizations/1/jobs/repair/               -> list (repair jobs)
 *  - ms/organizations/1/jobs/completed-cancelled/  -> list (completed + cancelled, all types)
 *  - ms/organizations/1/jobs/<type>/<id>/          -> single Job (detail / show-more card)
 *
 * Query params (job_type, archived, on_hold, exclude_completed, page, search …)
 * are stripped by the normalizer, so the active list routes also feed the
 * pending / favorites / on-hold filtered views — they read the same endpoint.
 *
 * Fields read by the renderers (job list columns, JobGridCard, JobStatusCell,
 * ClientsAndFarmsCell, getJobOrLeadListName, completed columns, detail tabs):
 *   id, description (list title), po_number, title, customer_phone_number,
 *   contact_info { id, full_name, phone_number, home_phone_number, email, address },
 *   farm_name, farm_id,
 *   job_status { id, title, color }   (object — resolveJobStatus / status badge),
 *   progress_bar  ("current/total" string — ProgressCell splits on "/"),
 *   last_updated (ISO), update_by_username, last_updated_by, created_at,
 *   on_hold, cancelled, archived, estimate_number,
 *   topo ("Yes"/"No"), material_status (tiling), object_type, job_object_subclass,
 *   acers / job_lead_acre, designers[], equipments[], farm_info {...} (detail tab),
 *   operator_info (excavation/repair), depth/width/length, start_date/end_date.
 *
 * Status objects mirror mockApi DEMO_JOB_STATUSES (ids 1-6).
 */

// ---- Shared status objects (id/title/color = DEMO_JOB_STATUSES) ----
const ST_NEW = { id: 1, title: "New", color: "#3b82f6" };
const ST_SCHEDULED = { id: 2, title: "Scheduled", color: "#8b5cf6" };
const ST_IN_PROGRESS = { id: 3, title: "In Progress", color: "#f59e0b" };
const ST_ON_HOLD = { id: 4, title: "On Hold", color: "#6b7280" };
const ST_COMPLETED = { id: 5, title: "Completed", color: "#22c55e" };
const ST_CANCELLED = { id: 6, title: "Cancelled", color: "#ef4444" };

// ---- Shared contact_info records (the customer / farm owner) ----
const C_JOHNSON = {
  id: 11,
  full_name: "Johnson Family Farm",
  phone_number: "+1 515 555 0231",
  home_phone_number: "+1 515 555 0232",
  email: "johnsonfamilyfarm@example.com",
  address: "1450 County Rd E34, Ames, IA 50010",
};
const C_PRAIRIE = {
  id: 12,
  full_name: "Prairie View Acres",
  phone_number: "+1 515 555 0244",
  home_phone_number: "+1 515 555 0245",
  email: "office@prairieviewacres.com",
  address: "8820 N 500th Ave, Bloomington, IL 61704",
};
const C_HILLTOP = {
  id: 13,
  full_name: "Hilltop Dairy",
  phone_number: "+1 309 555 0188",
  home_phone_number: "+1 309 555 0189",
  email: "barn@hilltopdairy.com",
  address: "3300 Ridge Rd, Galena, IL 61036",
};
const C_RIVERSIDE = {
  id: 14,
  full_name: "Riverside Grain Co.",
  phone_number: "+1 563 555 0102",
  home_phone_number: "+1 563 555 0103",
  email: "grain@riversidegrain.com",
  address: "775 River Rd, Davenport, IA 52801",
};
const C_MEADOWBROOK = {
  id: 15,
  full_name: "Meadowbrook Farms",
  phone_number: "+1 641 555 0319",
  home_phone_number: "+1 641 555 0320",
  email: "info@meadowbrookfarms.com",
  address: "2100 240th St, Oskaloosa, IA 52577",
};
const C_OAKRIDGE = {
  id: 16,
  full_name: "Oakridge Agronomy",
  phone_number: "+1 217 555 0461",
  home_phone_number: "+1 217 555 0462",
  email: "agronomy@oakridge.com",
  address: "5600 E 1200 North Rd, Champaign, IL 61822",
};
const C_SANDHILL = {
  id: 17,
  full_name: "Sandhill Ranch",
  phone_number: "+1 712 555 0577",
  home_phone_number: "+1 712 555 0578",
  email: "ranch@sandhill.com",
  address: "440 Hwy 71, Spencer, IA 51301",
};
const C_CLEARWATER = {
  id: 18,
  full_name: "Clearwater Fields",
  phone_number: "+1 319 555 0640",
  home_phone_number: "+1 319 555 0641",
  email: "fields@clearwater.com",
  address: "9012 Plainview Rd, Cedar Rapids, IA 52404",
};

// =====================================================================
// DRAINAGE TILING JOBS
// =====================================================================
const tilingJobs = [
  {
    id: 101,
    title: "Mainline tile - east 80",
    description: "Pattern tile install on east 80 acres, 4in laterals",
    po_number: "PO-2026-101",
    customer_phone_number: C_JOHNSON.phone_number,
    object_type: "drainage_tiling",
    job_object_subclass: "Drainage_TilingJob",
    job_status: ST_IN_PROGRESS,
    progress_bar: "3/5",
    on_hold: false,
    archived: false,
    cancelled: false,
    created_at: "2026-02-04T08:15:00Z",
    last_updated: "2026-06-10T14:30:00Z",
    last_updated_by: "Omar Zahid",
    update_by_username: "Omar Zahid",
    contact_info: C_JOHNSON,
    farm_name: "Johnson North Field",
    farm_id: 201,
    estimate_number: "EST-1101",
    topo: "Yes",
    material_status: "Delivered",
    acers: 80,
    job_lead_acre: 80,
    designers: [2],
    equipments: [
      { id: 9001, equipment: 1, total_hours: 42 },
      { id: 9002, equipment: 3, total_hours: 38 },
    ],
    payment_status: 2,
    main_footage_ran: 14200,
    lateral_footage_ran: 8800,
    raisers_installed: 6,
    job_footage: 23000,
  },
  {
    id: 102,
    title: "Pattern tile - Prairie south",
    description: "Random tile, wet pockets, 6in main to county ditch",
    po_number: "PO-2026-102",
    customer_phone_number: C_PRAIRIE.phone_number,
    object_type: "drainage_tiling",
    job_object_subclass: "Drainage_TilingJob",
    job_status: ST_SCHEDULED,
    progress_bar: "0/4",
    on_hold: false,
    archived: false,
    cancelled: false,
    created_at: "2026-03-12T09:00:00Z",
    last_updated: "2026-06-01T11:05:00Z",
    last_updated_by: "Bilal Zahid",
    update_by_username: "Bilal Zahid",
    contact_info: C_PRAIRIE,
    farm_name: "Prairie South Quarter",
    farm_id: 202,
    estimate_number: "EST-1102",
    topo: "No",
    material_status: "In Progress",
    acers: 160,
    job_lead_acre: 160,
    designers: [2],
    equipments: [{ id: 9003, equipment: 1, total_hours: 0 }],
    payment_status: 1,
  },
  {
    id: 103,
    title: "Tile repair + extension - Hilltop",
    description: "Extend existing main 1200ft, tie in new laterals",
    po_number: "PO-2026-103",
    customer_phone_number: C_HILLTOP.phone_number,
    object_type: "drainage_tiling",
    job_object_subclass: "Drainage_TilingJob",
    job_status: ST_ON_HOLD,
    progress_bar: "1/3",
    on_hold: true,
    archived: false,
    cancelled: false,
    created_at: "2026-01-22T07:45:00Z",
    last_updated: "2026-05-18T16:20:00Z",
    last_updated_by: "Omar Zahid",
    update_by_username: "Omar Zahid",
    contact_info: C_HILLTOP,
    farm_name: "Hilltop West",
    farm_id: 203,
    estimate_number: "EST-1103",
    topo: "Yes",
    material_status: "In Progress",
    acers: 45,
    job_lead_acre: 45,
    designers: [2],
    equipments: [{ id: 9004, equipment: 3, total_hours: 12 }],
    payment_status: 1,
  },
  {
    id: 104,
    title: "New tile system - Meadowbrook 240",
    description: "Full pattern system, 240 acres, dual-wall mains",
    po_number: "PO-2026-104",
    customer_phone_number: C_MEADOWBROOK.phone_number,
    object_type: "drainage_tiling",
    job_object_subclass: "Drainage_TilingJob",
    job_status: ST_NEW,
    progress_bar: "0/6",
    on_hold: false,
    archived: false,
    cancelled: false,
    created_at: "2026-05-30T10:30:00Z",
    last_updated: "2026-06-15T08:50:00Z",
    last_updated_by: "Sajid Zahid",
    update_by_username: "Sajid Zahid",
    contact_info: C_MEADOWBROOK,
    farm_name: "Meadowbrook Block A",
    farm_id: 204,
    estimate_number: "EST-1104",
    topo: "No",
    material_status: "In Progress",
    acers: 240,
    job_lead_acre: 240,
    designers: [2],
    equipments: [],
    payment_status: 1,
  },
  {
    id: 105,
    title: "Surface drainage tile - Clearwater",
    description: "Grade control tile, surface intakes on 120 acres",
    po_number: "PO-2026-105",
    customer_phone_number: C_CLEARWATER.phone_number,
    object_type: "drainage_tiling",
    job_object_subclass: "Drainage_TilingJob",
    job_status: ST_IN_PROGRESS,
    progress_bar: "2/4",
    on_hold: false,
    archived: false,
    cancelled: false,
    created_at: "2026-04-08T08:00:00Z",
    last_updated: "2026-06-12T13:15:00Z",
    last_updated_by: "Tyler Brooks",
    update_by_username: "Tyler Brooks",
    contact_info: C_CLEARWATER,
    farm_name: "Clearwater Lowland",
    farm_id: 205,
    estimate_number: "EST-1105",
    topo: "Yes",
    material_status: "Delivered",
    acers: 120,
    job_lead_acre: 120,
    designers: [2],
    equipments: [{ id: 9005, equipment: 1, total_hours: 28 }],
    payment_status: 2,
    main_footage_ran: 9600,
    lateral_footage_ran: 4200,
  },
];

// =====================================================================
// EXCAVATION JOBS
// =====================================================================
const excavationJobs = [
  {
    id: 201,
    title: "Waterway basin dig - Riverside",
    description: "Excavate sediment basin, haul spoil, shape outlet",
    po_number: "PO-2026-201",
    customer_phone_number: C_RIVERSIDE.phone_number,
    object_type: "excavation",
    job_object_subclass: "ExcavationJob",
    job_status: ST_IN_PROGRESS,
    progress_bar: "2/3",
    on_hold: false,
    archived: false,
    cancelled: false,
    created_at: "2026-03-01T07:30:00Z",
    last_updated: "2026-06-08T15:40:00Z",
    last_updated_by: "Marcus Reed",
    update_by_username: "Marcus Reed",
    contact_info: C_RIVERSIDE,
    farm_name: "Riverside Bottoms",
    farm_id: 211,
    estimate_number: "EST-2201",
    acers: 12,
    operator: 4,
    operator_info: {
      id: 4,
      username: "marcus.reed",
      first_name: "Marcus",
      last_name: "Reed",
      full_name: "Marcus Reed",
      email: "marcus.reed@sajidsons.com",
      role: "Excavator Operator",
    },
    depth: 8,
    width: 40,
    length: 220,
    start_date: "2026-03-05",
    end_date: "2026-03-20",
    equipments: [{ id: 9201, equipment: 1, total_hours: 64 }],
  },
  {
    id: 202,
    title: "Pond cleanout - Sandhill",
    description: "Dredge and reshape stock pond, 6ft deep",
    po_number: "PO-2026-202",
    customer_phone_number: C_SANDHILL.phone_number,
    object_type: "excavation",
    job_object_subclass: "ExcavationJob",
    job_status: ST_SCHEDULED,
    progress_bar: "0/2",
    on_hold: false,
    archived: false,
    cancelled: false,
    created_at: "2026-04-18T09:10:00Z",
    last_updated: "2026-06-02T10:00:00Z",
    last_updated_by: "Bilal Zahid",
    update_by_username: "Bilal Zahid",
    contact_info: C_SANDHILL,
    farm_name: "Sandhill Pasture 2",
    farm_id: 212,
    estimate_number: "EST-2202",
    acers: 3,
    operator: 4,
    operator_info: {
      id: 4,
      username: "marcus.reed",
      first_name: "Marcus",
      last_name: "Reed",
      full_name: "Marcus Reed",
      email: "marcus.reed@sajidsons.com",
      role: "Excavator Operator",
    },
    depth: 6,
    width: 60,
    length: 120,
    start_date: "2026-06-22",
    end_date: "2026-06-26",
    equipments: [{ id: 9202, equipment: 6, total_hours: 0 }],
  },
  {
    id: 203,
    title: "Building pad grading - Oakridge",
    description: "Cut and fill for new machine shed pad, compact",
    po_number: "PO-2026-203",
    customer_phone_number: C_OAKRIDGE.phone_number,
    object_type: "excavation",
    job_object_subclass: "ExcavationJob",
    job_status: ST_ON_HOLD,
    progress_bar: "1/4",
    on_hold: true,
    archived: false,
    cancelled: false,
    created_at: "2026-02-26T08:00:00Z",
    last_updated: "2026-05-22T12:30:00Z",
    last_updated_by: "Omar Zahid",
    update_by_username: "Omar Zahid",
    contact_info: C_OAKRIDGE,
    farm_name: "Oakridge HQ",
    farm_id: 213,
    estimate_number: "EST-2203",
    acers: 2,
    operator: 4,
    operator_info: {
      id: 4,
      username: "marcus.reed",
      first_name: "Marcus",
      last_name: "Reed",
      full_name: "Marcus Reed",
      email: "marcus.reed@sajidsons.com",
      role: "Excavator Operator",
    },
    depth: 4,
    width: 100,
    length: 150,
    equipments: [{ id: 9203, equipment: 1, total_hours: 18 }],
  },
  {
    id: 204,
    title: "Drainage ditch reshape - Johnson",
    description: "Re-grade 1800ft field ditch, install riprap outlet",
    po_number: "PO-2026-204",
    customer_phone_number: C_JOHNSON.phone_number,
    object_type: "excavation",
    job_object_subclass: "ExcavationJob",
    job_status: ST_NEW,
    progress_bar: "0/3",
    on_hold: false,
    archived: false,
    cancelled: false,
    created_at: "2026-06-05T07:50:00Z",
    last_updated: "2026-06-16T09:25:00Z",
    last_updated_by: "Sajid Zahid",
    update_by_username: "Sajid Zahid",
    contact_info: C_JOHNSON,
    farm_name: "Johnson South Draw",
    farm_id: 214,
    estimate_number: "EST-2204",
    acers: 6,
    operator: 4,
    operator_info: {
      id: 4,
      username: "marcus.reed",
      first_name: "Marcus",
      last_name: "Reed",
      full_name: "Marcus Reed",
      email: "marcus.reed@sajidsons.com",
      role: "Excavator Operator",
    },
    depth: 5,
    width: 24,
    length: 1800,
    equipments: [],
  },
];

// =====================================================================
// REPAIR JOBS
// =====================================================================
const repairJobs = [
  {
    id: 301,
    title: "Blown tile main repair - Prairie",
    description: "Locate and replace collapsed 8in main, 60ft section",
    po_number: "PO-2026-301",
    customer_phone_number: C_PRAIRIE.phone_number,
    object_type: "repair",
    job_object_subclass: "RepairJob",
    job_status: ST_IN_PROGRESS,
    progress_bar: "1/2",
    on_hold: false,
    archived: false,
    cancelled: false,
    created_at: "2026-05-02T08:20:00Z",
    last_updated: "2026-06-11T10:45:00Z",
    last_updated_by: "Omar Zahid",
    update_by_username: "Omar Zahid",
    contact_info: C_PRAIRIE,
    farm_name: "Prairie East 40",
    farm_id: 311,
    estimate_number: "EST-3301",
    operator: 4,
    operator_info: {
      id: 4,
      username: "marcus.reed",
      first_name: "Marcus",
      last_name: "Reed",
      full_name: "Marcus Reed",
      email: "marcus.reed@sajidsons.com",
      role: "Excavator Operator",
    },
    equipments: [{ id: 9301, equipment: 6, total_hours: 9 }],
  },
  {
    id: 302,
    title: "Surface intake repair - Hilltop",
    description: "Rebuild crushed surface intake and 4in riser",
    po_number: "PO-2026-302",
    customer_phone_number: C_HILLTOP.phone_number,
    object_type: "repair",
    job_object_subclass: "RepairJob",
    job_status: ST_SCHEDULED,
    progress_bar: "0/2",
    on_hold: false,
    archived: false,
    cancelled: false,
    created_at: "2026-05-20T09:00:00Z",
    last_updated: "2026-06-03T14:10:00Z",
    last_updated_by: "Bilal Zahid",
    update_by_username: "Bilal Zahid",
    contact_info: C_HILLTOP,
    farm_name: "Hilltop North",
    farm_id: 312,
    estimate_number: "EST-3302",
    operator: 5,
    operator_info: {
      id: 5,
      username: "tyler.brooks",
      first_name: "Tyler",
      last_name: "Brooks",
      full_name: "Tyler Brooks",
      email: "tyler.brooks@sajidsons.com",
      role: "Tile Technician",
    },
    equipments: [],
  },
  {
    id: 303,
    title: "Outlet pipe repair - Clearwater",
    description: "Replace rodent-damaged outlet, add animal guard",
    po_number: "PO-2026-303",
    customer_phone_number: C_CLEARWATER.phone_number,
    object_type: "repair",
    job_object_subclass: "RepairJob",
    job_status: ST_ON_HOLD,
    progress_bar: "1/3",
    on_hold: true,
    archived: false,
    cancelled: false,
    created_at: "2026-03-30T07:40:00Z",
    last_updated: "2026-05-09T11:30:00Z",
    last_updated_by: "Omar Zahid",
    update_by_username: "Omar Zahid",
    contact_info: C_CLEARWATER,
    farm_name: "Clearwater Outlet",
    farm_id: 313,
    estimate_number: "EST-3303",
    operator: 5,
    operator_info: {
      id: 5,
      username: "tyler.brooks",
      first_name: "Tyler",
      last_name: "Brooks",
      full_name: "Tyler Brooks",
      email: "tyler.brooks@sajidsons.com",
      role: "Tile Technician",
    },
    equipments: [{ id: 9302, equipment: 6, total_hours: 4 }],
  },
  {
    id: 304,
    title: "Lateral line repair - Meadowbrook",
    description: "Dig down, splice two broken 4in laterals, backfill",
    po_number: "PO-2026-304",
    customer_phone_number: C_MEADOWBROOK.phone_number,
    object_type: "repair",
    job_object_subclass: "RepairJob",
    job_status: ST_NEW,
    progress_bar: "0/1",
    on_hold: false,
    archived: false,
    cancelled: false,
    created_at: "2026-06-14T08:05:00Z",
    last_updated: "2026-06-18T09:00:00Z",
    last_updated_by: "Sajid Zahid",
    update_by_username: "Sajid Zahid",
    contact_info: C_MEADOWBROOK,
    farm_name: "Meadowbrook Block C",
    farm_id: 314,
    estimate_number: "EST-3304",
    operator: 4,
    operator_info: {
      id: 4,
      username: "marcus.reed",
      first_name: "Marcus",
      last_name: "Reed",
      full_name: "Marcus Reed",
      email: "marcus.reed@sajidsons.com",
      role: "Excavator Operator",
    },
    equipments: [],
  },
];

// =====================================================================
// COMPLETED + CANCELLED JOBS (all types)
// =====================================================================
const completedCancelledJobs = [
  {
    id: 401,
    title: "Pattern tile - Riverside 200",
    description: "Completed pattern tile, 200 acres, dual-wall main",
    po_number: "PO-2026-401",
    object_type: "drainage_tiling",
    job_object_subclass: "Drainage_TilingJob",
    job_status: ST_COMPLETED,
    progress_bar: "6/6",
    on_hold: false,
    archived: false,
    cancelled: false,
    created_at: "2026-01-10T08:00:00Z",
    last_updated: "2026-04-02T15:00:00Z",
    last_updated_by: "Omar Zahid",
    update_by_username: "Omar Zahid",
    contact_info: C_RIVERSIDE,
    farm_name: "Riverside Tract 1",
    farm_id: 401,
    estimate_number: "EST-4401",
    topo: "Yes",
    material_status: "Completed Days",
    acers: 200,
    job_lead_acre: 200,
    main_footage_ran: 31000,
    lateral_footage_ran: 18500,
  },
  {
    id: 402,
    title: "Basin excavation - Sandhill",
    description: "Completed sediment basin and outlet structure",
    po_number: "PO-2026-402",
    object_type: "excavation",
    job_object_subclass: "ExcavationJob",
    job_status: ST_COMPLETED,
    progress_bar: "3/3",
    on_hold: false,
    archived: false,
    cancelled: false,
    created_at: "2026-02-01T08:00:00Z",
    last_updated: "2026-03-15T12:30:00Z",
    last_updated_by: "Marcus Reed",
    update_by_username: "Marcus Reed",
    contact_info: C_SANDHILL,
    farm_name: "Sandhill Basin",
    farm_id: 402,
    estimate_number: "EST-4402",
    acers: 9,
    depth: 10,
    width: 80,
    length: 160,
  },
  {
    id: 403,
    title: "Main repair - Oakridge",
    description: "Completed 8in main repair, 40ft replaced",
    po_number: "PO-2026-403",
    object_type: "repair",
    job_object_subclass: "RepairJob",
    job_status: ST_COMPLETED,
    progress_bar: "2/2",
    on_hold: false,
    archived: false,
    cancelled: false,
    created_at: "2026-03-20T08:00:00Z",
    last_updated: "2026-04-05T11:00:00Z",
    last_updated_by: "Tyler Brooks",
    update_by_username: "Tyler Brooks",
    contact_info: C_OAKRIDGE,
    farm_name: "Oakridge South",
    farm_id: 403,
    estimate_number: "EST-4403",
  },
  {
    id: 404,
    title: "Tile install - Johnson 80 (cancelled)",
    description: "Cancelled - landowner deferred to next season",
    po_number: "PO-2026-404",
    object_type: "drainage_tiling",
    job_object_subclass: "Drainage_TilingJob",
    job_status: ST_CANCELLED,
    progress_bar: "0/5",
    on_hold: false,
    archived: false,
    cancelled: true,
    created_at: "2026-02-12T08:00:00Z",
    last_updated: "2026-02-28T10:15:00Z",
    last_updated_by: "Bilal Zahid",
    update_by_username: "Bilal Zahid",
    contact_info: C_JOHNSON,
    farm_name: "Johnson Far East",
    farm_id: 404,
    estimate_number: "EST-4404",
    topo: "No",
    material_status: "In Progress",
    acers: 80,
    job_lead_acre: 80,
  },
  {
    id: 405,
    title: "Ditch cleanout - Prairie (cancelled)",
    description: "Cancelled - access road washed out, rescheduled",
    po_number: "PO-2026-405",
    object_type: "excavation",
    job_object_subclass: "ExcavationJob",
    job_status: ST_CANCELLED,
    progress_bar: "0/2",
    on_hold: false,
    archived: false,
    cancelled: true,
    created_at: "2026-04-22T08:00:00Z",
    last_updated: "2026-05-01T09:45:00Z",
    last_updated_by: "Omar Zahid",
    update_by_username: "Omar Zahid",
    contact_info: C_PRAIRIE,
    farm_name: "Prairie West Ditch",
    farm_id: 405,
    estimate_number: "EST-4405",
    acers: 4,
    depth: 5,
    width: 24,
    length: 900,
  },
];

// ---- Combined "all jobs" list (active across every type) ----
const allActiveJobs = [...tilingJobs, ...excavationJobs, ...repairJobs];

// ---- Detail records keyed by id, enriched with farm_info for the detail tab ----
type JobLike = Record<string, unknown> & {
  id: number;
  contact_info: { id: number; full_name: string; phone_number: string };
};

// Example uploaded map files for the drainage-tiling demo job (#101). These make
// the on-map "Go to <file name>" quick buttons appear so the flow is demoable:
// each uploaded XML / shapefile in the Files section surfaces a button that
// recenters the boundary map on that file's geometry. `file` is the stored URL —
// the button label is derived from its base name via getMapFileDisplayName.
// Geometry sits around the mock field center (41.9779, -93.6155); XML design
// points are [lng, lat], shapefile rings are [lng, lat].
const EXAMPLE_JOB_MAP_FILES = {
  xmlmap_v2: [
    {
      id: 90101,
      file: "https://ff360.local/maps/Johnson_North_Tile_Plan.xml",
      data: {
        design_points: [
          [-93.6162, 41.9784],
          [-93.6148, 41.9784],
          [-93.6148, 41.9774],
          [-93.6162, 41.9774],
        ],
      },
    },
    {
      id: 90102,
      file: "https://ff360.local/maps/Johnson_North_Mains.xml",
      data: {
        design_points: [
          [-93.6158, 41.9788],
          [-93.6152, 41.9788],
          [-93.6152, 41.977],
          [-93.6158, 41.977],
        ],
      },
    },
  ],
  shpmap_v2: [
    {
      id: 90201,
      file: "https://ff360.local/maps/Johnson_North_Boundary.shp",
      data: {
        ring0: [
          [-93.617, 41.9786],
          [-93.6152, 41.9786],
          [-93.6152, 41.9772],
          [-93.617, 41.9772],
        ],
      },
    },
  ],
};

const detailById = new Map<number, Record<string, unknown>>(
  [...allActiveJobs, ...completedCancelledJobs].map((rawJob): [number, Record<string, unknown>] => {
    const job = rawJob as unknown as JobLike;
    const farmId = (job.farm_id as number | undefined) ?? 999;
    const farmName = (job.farm_name as string | undefined) ?? "Field";
    const acreage = (job.acers as number | undefined) ?? null;
    return [
      job.id,
      {
        ...job,
        contacts_count: 1,
        farms_count: 1,
        contacts: [
          {
            id: job.contact_info.id,
            full_name: job.contact_info.full_name,
            is_primary: true,
            phone_number: job.contact_info.phone_number,
          },
        ],
        farms: [
          {
            id: farmId,
            name: farmName,
            contact_id: job.contact_info.id,
            is_primary: true,
            acreage,
            latitude: 41.9779,
            longitude: -93.6155,
            vertices: [],
          },
        ],
        farm_info: {
          id: farmId,
          name: farmName,
          acreage,
          latitude: 41.9779,
          longitude: -93.6155,
          vertices: [],
        },
        designers: (job.designers as number[] | undefined) ?? [],
        crew: [],
        outlets: ["County ditch outlet"],
        one_call: "Yes",
        latitude: 41.9779,
        longitude: -93.6155,
        vertices: [],
        canAccessOnSiteTracking: true,
        notesTabAccess: { general: true, office: true, onsite: true },
        // Demo-only: surface the "Go to <file name>" quick buttons on job #101.
        ...(job.id === 101 ? EXAMPLE_JOB_MAP_FILES : {}),
        // Demo-only: assigned equipment (ids align with records/equipment mock)
        // so the On-Site Tracking "Equipment assignment" card shows data. Seeded
        // for one job of each type (tiling 101, excavation 201, repair 301) so
        // every job type's tracking page looks consistent.
        ...([101, 201, 301].includes(job.id)
          ? {
              equipments: [
                { id: job.id * 10 + 1, equipment: 1, total_hours: 128 },
                { id: job.id * 10 + 2, equipment: 3, total_hours: 86 },
              ],
            }
          : {}),
      },
    ];
  })
);

// A representative detail fallback so any /<type>/<id>/ resolves a full record.
const detailFallback = detailById.get(101);

/**
 * Cross-module lookup for mock wiring (e.g. order-pipe create resolves the chosen
 * job's name / customer / farm so the new order reads like a real one). Returns
 * the raw job record (active or completed/cancelled) or undefined.
 */
export function getMockJobById(id: number): Record<string, unknown> | undefined {
  return [...allActiveJobs, ...completedCancelledJobs].find(
    (job) => (job as { id: number }).id === id
  ) as Record<string, unknown> | undefined;
}

// Status objects keyed by id, so an inline PATCH ({ job_status: <id> }) can be
// resolved back to the full {id,title,color} the status badge/column expects.
const JOB_STATUS_BY_ID = new Map(
  [
    ST_NEW,
    ST_SCHEDULED,
    ST_IN_PROGRESS,
    ST_ON_HOLD,
    ST_COMPLETED,
    ST_CANCELLED,
  ].map((status) => [status.id, status])
);

/**
 * Persist an inline job-status change from the listing/grid dropdown. The list
 * arrays share object references with allActiveJobs, so mutating the record in
 * place is reflected across every list/detail view the next time it re-reads.
 * Keeps on_hold / cancelled flags consistent with the chosen status so filter
 * chips stay accurate. Returns true when a job matched.
 */
export function updateMockJobStatus(id: number, statusId: number): boolean {
  const job = getMockJobById(id);
  if (!job) return false;
  const status = JOB_STATUS_BY_ID.get(statusId);
  job.job_status = status ?? { id: statusId, title: "Unknown", color: "#9ca3af" };
  job.on_hold = statusId === ST_ON_HOLD.id;
  job.cancelled = statusId === ST_CANCELLED.id;
  return true;
}

export const routes: MockRoute[] = [
  // -------- LIST routes (must precede detail routes) --------
  {
    match: /^ms\/organizations\/\d+\/jobs\/all\/?$/,
    data: allActiveJobs,
  },
  {
    match: /^ms\/organizations\/\d+\/jobs\/drainage_tiling\/?$/,
    data: tilingJobs,
  },
  {
    match: /^ms\/organizations\/\d+\/jobs\/excavation\/?$/,
    data: excavationJobs,
  },
  {
    match: /^ms\/organizations\/\d+\/jobs\/repair\/?$/,
    data: repairJobs,
  },
  {
    match: /^ms\/organizations\/\d+\/jobs\/completed-cancelled\/?$/,
    data: completedCancelledJobs,
  },

  // -------- DETAIL routes (…/jobs/<type>/<id>/) --------
  {
    match: /^ms\/organizations\/\d+\/jobs\/drainage_tiling\/\d+\/?$/,
    list: false,
    data: detailById.get(101) ?? detailFallback,
  },
  {
    match: /^ms\/organizations\/\d+\/jobs\/excavation\/\d+\/?$/,
    list: false,
    data: detailById.get(201) ?? detailFallback,
  },
  {
    match: /^ms\/organizations\/\d+\/jobs\/repair\/\d+\/?$/,
    list: false,
    data: detailById.get(301) ?? detailFallback,
  },
];
