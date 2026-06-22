/**
 * LOCAL PROTOTYPE mock axios adapter.
 *
 * Attached to both axios instances (api/client.ts and lib/axios.ts) when
 * NEXT_PUBLIC_USE_MOCK_DATA === "true". Lets the CMS frontend run with NO
 * backend by answering every request with dummy data instead of hitting the
 * (deleted) Django API.
 *
 * Strategy:
 *  - Explicitly handle the auth/org/members/permissions chain so the app shell
 *    boots and routes into /organizations/{id}/dashboard.
 *  - For everything else, return safe defaults (DRF-style paginated empty list
 *    for collections, {} for detail, echo body for writes) so pages render
 *    empty rather than crashing.
 *  - Unmatched GETs are logged to the console so we can add realistic dummy
 *    datasets per flow (lead-to-job, etc.) as we build them out.
 */
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from "axios";

import {
  PERMISSION_ACTIONS,
  PERMISSION_RESOURCES,
} from "@/hooks/permissions/constants";

/**
 * Every `<resource>_<action>` code (read/write/delete) for the demo admin, so
 * the mocked user can see and use every page/flow. Plus role flags the app
 * checks for ("is_admin").
 */
const ALL_PERMISSION_CODES: string[] = [
  ...Object.values(PERMISSION_RESOURCES).flatMap((resource) =>
    PERMISSION_ACTIONS.map((action) => `${resource}_${action}`)
  ),
  "is_admin",
];

export const DEMO_ORG = {
  id: 1,
  name: "Demo Organization",
  slug: "demo-organization",
  logo: null,
  address: "123 Demo Street",
  phone_number: "+1 555 0100",
  email: "demo@fieldflow360.com",
  timezone: "UTC",
  unit_system: "imperial",
  subscription_status: "active",
  is_active: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

export const DEMO_USER = {
  id: 1,
  email: "demo@fieldflow360.com",
  first_name: "Demo",
  last_name: "User",
  full_name: "Demo User",
  phone_number: "+1 555 0100",
  is_active: true,
  email_verified: true,
};

const DEMO_MEMBER = {
  id: 1,
  user: DEMO_USER,
  owner: true,
  role_id: 1,
  role_fk: {
    id: 1,
    name: "Admin",
    is_admin: true,
    is_default: true,
    organization: 1,
  },
};

const DEMO_PERMISSIONS = {
  permission_codes: ALL_PERMISSION_CODES,
  role: { id: 1, name: "Admin", is_admin: true, is_default: true },
};

/** Realistic non-zero dashboard payload (OrganizationDashboardResponse). */
const DEMO_DASHBOARD = {
  shared_to_diggs_jobs: 4,
  not_approved_farmer_jobs: 3,
  not_approved_farmer_tiling_jobs: 1,
  not_approved_farmer_excavation_jobs: 1,
  not_approved_farmer_repair_jobs: 1,
  total_members: 5,
  admin_members: 2,
  project_managers_members: 1,
  project_crews_members: 1,
  bookkeepers_members: 1,
  total_farmer_jobs: 12,
  tiling_farmer_jobs: 6,
  excavation_farmer_jobs: 3,
  repair_farmer_jobs: 3,
  total_invoices: 9,
  checked_by_admin_invoices: 6,
  sent_to_client_invoices: 5,
  paid_invoices: 4,
  designs_needed_by_you: {},
  near_maintenance_count: 2,
  total_jobs: 24,
  cancelled_jobs: 2,
  completed_jobs: 10,
  total_running_tiling_jobs: 5,
  total_running_excavation_jobs: 3,
  total_running_repair_jobs: 4,
  total_cancelled_tiling_jobs: 1,
  total_cancelled_excavation_jobs: 1,
  total_cancelled_repair_jobs: 0,
  total_completed_tiling_jobs: 5,
  total_completed_excavation_jobs: 3,
  total_completed_repair_jobs: 2,
  total_billing_tiling_jobs: 2,
  total_billing_excavation_jobs: 1,
  total_billing_repair_jobs: 1,
  total_leads: 14,
  total_drainage_tiling_leads: 7,
  total_excavation_leads: 4,
  total_repair_leads: 3,
  total_equipments: 12,
  total_equipment_in_maintenance: 2,
  total_acres_of_all_tiling_leads: 320,
  total_acres_of_all_uncompleted_tilling_jobs: 180,
  total_acres_of_all_completed_tilling_jobs: 240,
};

function paginated<T>(results: T[] = []) {
  return { count: results.length, next: null, previous: null, results };
}

function makeResponse(
  data: unknown,
  config: InternalAxiosRequestConfig,
  status = 200
): AxiosResponse {
  return {
    data,
    status,
    statusText: status === 204 ? "No Content" : "OK",
    headers: {},
    config,
  } as AxiosResponse;
}

function normalizeUrl(rawUrl: string): string {
  return rawUrl
    .split("?")[0]
    .replace(/^https?:\/\/[^/]+/, "")
    .replace(/^\/+/, "");
}

function parseBody(data: unknown): Record<string, unknown> {
  if (!data) return {};
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  }
  if (typeof data === "object" && !(data instanceof FormData)) {
    return data as Record<string, unknown>;
  }
  return {};
}

let mockIdCounter = 1000;

export const mockAdapter: AxiosAdapter = async (config) => {
  const method = (config.method || "get").toLowerCase();
  const url = normalizeUrl(config.url || "");

  // --- Auth + organization bootstrap chain (return raw arrays/objects) ---
  if (/^auth\/users\/?$/.test(url)) {
    return makeResponse([DEMO_USER], config);
  }
  if (/^ms\/organizations\/?$/.test(url) && method === "get") {
    return makeResponse([DEMO_ORG], config);
  }
  if (/^ms\/organizations\/\d+\/?$/.test(url) && method === "get") {
    return makeResponse(DEMO_ORG, config);
  }
  if (/members\/?$/.test(url) && method === "get") {
    return makeResponse([DEMO_MEMBER], config);
  }
  if (url.includes("permission") && method === "get") {
    return makeResponse(DEMO_PERMISSIONS, config);
  }

  // --- Dashboard: realistic payload so charts/cards render with data ---
  if (/ms\/organizations\/\d+\/dashboard\/?$/.test(url) && method === "get") {
    return makeResponse(DEMO_DASHBOARD, config);
  }
  // --- Invoices: hook expects a RAW array, not a paginated page ---
  if (/ms\/organizations\/\d+\/invoices\/?$/.test(url) && method === "get") {
    return makeResponse([], config);
  }

  // --- Writes: echo back the payload with a generated id ---
  if (["post", "put", "patch"].includes(method)) {
    const body = parseBody(config.data);
    return makeResponse(
      { id: ++mockIdCounter, ...body },
      config,
      method === "post" ? 201 : 200
    );
  }
  if (method === "delete") {
    return makeResponse({}, config, 204);
  }

  // --- Generic GET fallbacks ---
  // Detail endpoint (…/123/ or …/123) → empty object
  if (/\/\d+\/?$/.test(url)) {
    return makeResponse({}, config);
  }
  // Collection endpoint → DRF-style paginated empty list
  if (typeof console !== "undefined") {
    // eslint-disable-next-line no-console
    console.debug(`[mockApi] unmatched GET → ${url} (returned empty list)`);
  }
  return makeResponse(paginated([]), config);
};

export const USE_MOCK_DATA =
  process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
