import type { MockRoute } from "./types";

/**
 * SCHEDULING / CALENDAR mock data for "Sajid & Sons Contractors" (org 1).
 *
 * Endpoints (mockApi normalizes url -> protocol/host/query stripped):
 *  - ms/organizations/1/scheduling/items/        -> RAW array of SchedulingItem
 *      (consumed by useCalendarItems + useCalendarUnscheduledRecords; the latter
 *       sends has_scheduled=false but the query string is dropped, so this one
 *       list route serves both. A few items carry null start/end so the
 *       unscheduled panel has content too — mapSchedulingItem drops them from
 *       the calendar grid via the allowEmptyDates guard.)
 *  - ms/organizations/1/scheduling/statistics/   -> single object (list:false)
 *  - ms/organizations/1/scheduling/items/<id>/   -> single SchedulingItem (list:false)
 *
 * SchedulingItem fields read by mapSchedulingItemToCalendarItem:
 *   id, entity_type ("job"|"lead"), type ("T"|"E"|"R"), title,
 *   start_date, end_date (ISO yyyy-MM-dd | null), extra_days,
 *   project_type {id,name,color,...} | null, status {id,title,color} | null,
 *   contact_info {id,full_name,phone_number,address,...} | null,
 *   farm_name | null, farm_id | null, lead_source | null, url,
 *   is_completed, is_cancelled, is_archived,
 *   calendar_status in {in_progress|overdue|completed|not_started|lead}.
 */

// type code: "T" tiling, "E" excavation, "R" repair.
// calendar_status drives bar color + pill tone.

const projectTypes = {
  mainline: {
    id: 1,
    name: "Mainline Tiling",
    color: "#2c80ff",
    category: "T",
    category_display: "Tile",
    is_default: true,
    organization: 1,
    created_at: "2026-01-02T08:00:00Z",
  },
  pattern: {
    id: 2,
    name: "Pattern Tiling",
    color: "#155dfc",
    category: "T",
    category_display: "Tile",
    is_default: false,
    organization: 1,
    created_at: "2026-01-02T08:00:00Z",
  },
  basinDig: {
    id: 3,
    name: "Basin Excavation",
    color: "#fe9a00",
    category: "E",
    category_display: "Excavation",
    is_default: false,
    organization: 1,
    created_at: "2026-01-02T08:00:00Z",
  },
  waterway: {
    id: 4,
    name: "Waterway Grading",
    color: "#e17100",
    category: "E",
    category_display: "Excavation",
    is_default: false,
    organization: 1,
    created_at: "2026-01-02T08:00:00Z",
  },
  pipeRepair: {
    id: 5,
    name: "Pipe Repair",
    color: "#008236",
    category: "R",
    category_display: "Repair",
    is_default: false,
    organization: 1,
    created_at: "2026-01-02T08:00:00Z",
  },
};

function contact(
  id: number,
  full_name: string,
  phone_number: string,
  address: string,
  email: string
) {
  return {
    id,
    full_name,
    phone_number,
    home_phone_number: null,
    email,
    address,
  };
}

function status(id: number, title: string, color: string) {
  return { id, title, color };
}

const schedulingItems = [
  // 1 — JOB / tiling / in progress (multi-day, extra days)
  {
    id: 101,
    entity_type: "job",
    type: "T",
    title: "Mainline tile install — north 80",
    start_date: "2026-06-15",
    end_date: "2026-06-19",
    extra_days: 1,
    project_type: projectTypes.mainline,
    status: status(3, "In Progress", "#2c80ff"),
    contact_info: contact(
      11,
      "Johnson Family Farm",
      "+1 515 555 0188",
      "1450 County Rd E34, Ames, IA 50010",
      "office@johnsonfamilyfarm.com"
    ),
    farm_name: "Johnson Family Farm — North Quarter",
    farm_id: 501,
    lead_source: null,
    url: "/organizations/1/jobs/drainage_tiling/101/",
    is_completed: false,
    is_cancelled: false,
    is_archived: false,
    calendar_status: "in_progress",
  },
  // 2 — JOB / excavation / not started (scheduled future)
  {
    id: 102,
    entity_type: "job",
    type: "E",
    title: "Retention basin excavation",
    start_date: "2026-06-24",
    end_date: "2026-06-27",
    extra_days: 0,
    project_type: projectTypes.basinDig,
    status: status(2, "Scheduled", "#fe9a00"),
    contact_info: contact(
      12,
      "Prairie View Acres",
      "+1 309 555 0211",
      "8820 N 500th Ave, Bloomington, IL 61704",
      "contact@prairieviewacres.com"
    ),
    farm_name: "Prairie View Acres",
    farm_id: 502,
    lead_source: null,
    url: "/organizations/1/jobs/excavation/102/",
    is_completed: false,
    is_cancelled: false,
    is_archived: false,
    calendar_status: "not_started",
  },
  // 3 — JOB / repair / overdue
  {
    id: 103,
    entity_type: "job",
    type: "R",
    title: "Tile main blowout repair — east field",
    start_date: "2026-06-08",
    end_date: "2026-06-10",
    extra_days: 0,
    project_type: projectTypes.pipeRepair,
    status: status(3, "In Progress", "#e7000b"),
    contact_info: contact(
      13,
      "Hilltop Dairy",
      "+1 563 555 0177",
      "3300 Ridge Rd, Dyersville, IA 52040",
      "barn@hilltopdairy.com"
    ),
    farm_name: "Hilltop Dairy",
    farm_id: 503,
    lead_source: null,
    url: "/organizations/1/jobs/repair/103/",
    is_completed: false,
    is_cancelled: false,
    is_archived: false,
    calendar_status: "overdue",
  },
  // 4 — JOB / tiling / completed (earlier in the year)
  {
    id: 104,
    entity_type: "job",
    type: "T",
    title: "Pattern tile — south 120 acres",
    start_date: "2026-03-03",
    end_date: "2026-03-14",
    extra_days: 2,
    project_type: projectTypes.pattern,
    status: status(5, "Completed", "#008236"),
    contact_info: contact(
      14,
      "Riverside Grain Co.",
      "+1 515 555 0233",
      "9100 River Rd, Boone, IA 50036",
      "ops@riversidegrain.com"
    ),
    farm_name: "Riverside Grain Co. — Bottoms",
    farm_id: 504,
    lead_source: null,
    url: "/organizations/1/jobs/drainage_tiling/104/",
    is_completed: true,
    is_cancelled: false,
    is_archived: false,
    calendar_status: "completed",
  },
  // 5 — JOB / excavation / completed
  {
    id: 105,
    entity_type: "job",
    type: "E",
    title: "Grassed waterway regrade",
    start_date: "2026-04-20",
    end_date: "2026-04-24",
    extra_days: 0,
    project_type: projectTypes.waterway,
    status: status(5, "Completed", "#008236"),
    contact_info: contact(
      15,
      "Meadowbrook Farms",
      "+1 319 555 0144",
      "7745 Hwy 1, Solon, IA 52333",
      "info@meadowbrookfarms.com"
    ),
    farm_name: "Meadowbrook Farms",
    farm_id: 505,
    lead_source: null,
    url: "/organizations/1/jobs/excavation/105/",
    is_completed: true,
    is_cancelled: false,
    is_archived: false,
    calendar_status: "completed",
  },
  // 6 — JOB / tiling / in progress (current week)
  {
    id: 106,
    entity_type: "job",
    type: "T",
    title: "Mainline + laterals — west 160",
    start_date: "2026-06-22",
    end_date: "2026-06-30",
    extra_days: 1,
    project_type: projectTypes.mainline,
    status: status(3, "In Progress", "#2c80ff"),
    contact_info: contact(
      16,
      "Oakridge Agronomy",
      "+1 217 555 0199",
      "12200 E 200 North Rd, Champaign, IL 61822",
      "field@oakridgeagronomy.com"
    ),
    farm_name: "Oakridge Agronomy — Section 12",
    farm_id: 506,
    lead_source: null,
    url: "/organizations/1/jobs/drainage_tiling/106/",
    is_completed: false,
    is_cancelled: false,
    is_archived: false,
    calendar_status: "in_progress",
  },
  // 7 — LEAD / tiling
  {
    id: 201,
    entity_type: "lead",
    type: "T",
    title: "New tile estimate — 200 acres",
    start_date: "2026-06-17",
    end_date: "2026-06-17",
    extra_days: 0,
    project_type: projectTypes.mainline,
    status: status(3, "Qualified", "#155dfc"),
    contact_info: contact(
      21,
      "Sandhill Ranch",
      "+1 712 555 0166",
      "4400 380th St, Carroll, IA 51401",
      "owner@sandhillranch.com"
    ),
    farm_name: "Sandhill Ranch",
    farm_id: 507,
    lead_source: "Referral",
    url: "/organizations/1/leads/drainage_tiling/201/",
    is_completed: false,
    is_cancelled: false,
    is_archived: false,
    calendar_status: "lead",
  },
  // 8 — LEAD / excavation
  {
    id: 202,
    entity_type: "lead",
    type: "E",
    title: "Pond cleanout walk-through",
    start_date: "2026-06-26",
    end_date: "2026-06-26",
    extra_days: 0,
    project_type: projectTypes.basinDig,
    status: status(4, "Proposal Sent", "#fe9a00"),
    contact_info: contact(
      22,
      "Clearwater Fields",
      "+1 563 555 0122",
      "2100 280th Ave, Maquoketa, IA 52060",
      "contact@clearwaterfields.com"
    ),
    farm_name: "Clearwater Fields",
    farm_id: 508,
    lead_source: "Website",
    url: "/organizations/1/leads/excavation/202/",
    is_completed: false,
    is_cancelled: false,
    is_archived: false,
    calendar_status: "lead",
  },
  // 9 — LEAD / repair
  {
    id: 203,
    entity_type: "lead",
    type: "R",
    title: "Outlet pipe repair quote",
    start_date: "2026-06-12",
    end_date: "2026-06-12",
    extra_days: 0,
    project_type: projectTypes.pipeRepair,
    status: status(2, "Contacted", "#e17100"),
    contact_info: contact(
      23,
      "Johnson Family Farm",
      "+1 515 555 0188",
      "1450 County Rd E34, Ames, IA 50010",
      "office@johnsonfamilyfarm.com"
    ),
    farm_name: "Johnson Family Farm — Creek Outlet",
    farm_id: 509,
    lead_source: "Cold Call",
    url: "/organizations/1/leads/repair/203/",
    is_completed: false,
    is_cancelled: false,
    is_archived: false,
    calendar_status: "lead",
  },
  // 10 — JOB / repair / not started (next month)
  {
    id: 107,
    entity_type: "job",
    type: "R",
    title: "Tile junction box rebuild",
    start_date: "2026-07-06",
    end_date: "2026-07-08",
    extra_days: 0,
    project_type: projectTypes.pipeRepair,
    status: status(2, "Scheduled", "#fe9a00"),
    contact_info: contact(
      17,
      "Hilltop Dairy",
      "+1 563 555 0177",
      "3300 Ridge Rd, Dyersville, IA 52040",
      "barn@hilltopdairy.com"
    ),
    farm_name: "Hilltop Dairy — Lot 3",
    farm_id: 510,
    lead_source: null,
    url: "/organizations/1/jobs/repair/107/",
    is_completed: false,
    is_cancelled: false,
    is_archived: false,
    calendar_status: "not_started",
  },
  // 11 — JOB / tiling / completed (Jan, no project type -> tests fallback path)
  {
    id: 108,
    entity_type: "job",
    type: "T",
    title: "Winter tile finish — Section 8",
    start_date: "2026-01-13",
    end_date: "2026-01-22",
    extra_days: 0,
    project_type: null,
    status: status(5, "Completed", "#008236"),
    contact_info: contact(
      18,
      "Prairie View Acres",
      "+1 309 555 0211",
      "8820 N 500th Ave, Bloomington, IL 61704",
      "contact@prairieviewacres.com"
    ),
    farm_name: "Prairie View Acres — Section 8",
    farm_id: 511,
    lead_source: null,
    url: "/organizations/1/jobs/drainage_tiling/108/",
    is_completed: true,
    is_cancelled: false,
    is_archived: false,
    calendar_status: "completed",
  },
  // 12 — JOB / excavation / overdue (May)
  {
    id: 109,
    entity_type: "job",
    type: "E",
    title: "Field drive culvert dig",
    start_date: "2026-05-18",
    end_date: "2026-05-21",
    extra_days: 0,
    project_type: projectTypes.waterway,
    status: status(3, "In Progress", "#e7000b"),
    contact_info: contact(
      19,
      "Sandhill Ranch",
      "+1 712 555 0166",
      "4400 380th St, Carroll, IA 51401",
      "owner@sandhillranch.com"
    ),
    farm_name: "Sandhill Ranch — South Drive",
    farm_id: 512,
    lead_source: null,
    url: "/organizations/1/jobs/excavation/109/",
    is_completed: false,
    is_cancelled: false,
    is_archived: false,
    calendar_status: "overdue",
  },
  // 13 — UNSCHEDULED JOB (null dates) — feeds the unscheduled records panel
  {
    id: 110,
    entity_type: "job",
    type: "T",
    title: "Tile estimate approved — awaiting schedule",
    start_date: null,
    end_date: null,
    extra_days: null,
    project_type: projectTypes.pattern,
    status: status(1, "New", "#6a7282"),
    contact_info: contact(
      20,
      "Oakridge Agronomy",
      "+1 217 555 0199",
      "12200 E 200 North Rd, Champaign, IL 61822",
      "field@oakridgeagronomy.com"
    ),
    farm_name: "Oakridge Agronomy — Section 30",
    farm_id: 513,
    lead_source: null,
    url: "/organizations/1/jobs/drainage_tiling/110/",
    is_completed: false,
    is_cancelled: false,
    is_archived: false,
    calendar_status: "not_started",
  },
  // 14 — UNSCHEDULED LEAD (null dates)
  {
    id: 204,
    entity_type: "lead",
    type: "E",
    title: "Excavation lead — needs site visit",
    start_date: null,
    end_date: null,
    extra_days: null,
    project_type: projectTypes.basinDig,
    status: status(1, "New", "#6a7282"),
    contact_info: contact(
      24,
      "Meadowbrook Farms",
      "+1 319 555 0144",
      "7745 Hwy 1, Solon, IA 52333",
      "info@meadowbrookfarms.com"
    ),
    farm_name: "Meadowbrook Farms",
    farm_id: 514,
    lead_source: "Trade Show",
    url: "/organizations/1/leads/excavation/204/",
    is_completed: false,
    is_cancelled: false,
    is_archived: false,
    calendar_status: "lead",
  },
];

export const routes: MockRoute[] = [
  // Statistics — single object (NOT a list)
  {
    match: /^ms\/organizations\/\d+\/scheduling\/statistics\/?$/,
    list: false,
    data: {
      jobs_without_schedule: 1,
      leads_without_schedule: 1,
      total_overdue: 2,
      total_in_progress: 2,
      total_completed: 3,
      total_not_started: 2,
      total_leads: 3,
    },
  },
  // Items — RAW array (consumed via .map for both scheduled & unscheduled views)
  {
    match: /^ms\/organizations\/\d+\/scheduling\/items\/?$/,
    data: schedulingItems,
  },
  // Item detail — single SchedulingItem (id matches list record 101)
  {
    match: /^ms\/organizations\/\d+\/scheduling\/items\/\d+\/?$/,
    list: false,
    data: schedulingItems[0],
  },
];
