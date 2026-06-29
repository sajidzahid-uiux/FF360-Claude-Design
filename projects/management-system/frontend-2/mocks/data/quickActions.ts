import type { MockRoute } from "./types";

/**
 * QUICK ACTIONS mock data for "Sajid & Sons Contractors" (org 1).
 *
 * Endpoints (mockApi normalizes url -> protocol/host/query stripped):
 *   ms/organizations/1/quick-actions/        -> list (QuickActionsTable rows)
 *   ms/organizations/1/quick-actions/<id>/   -> single QuickAction (detail view)
 *
 * Fields read by the renderers (QuickActionsTable / quick-action-org-ui-columns /
 * QuickActionDetailView / getQuickActionDisplayTitle):
 *   id, name, phone_number, email, description,
 *   created_by, created_by_name, created_at, updated_at, files[],
 *   conversion { done, conversion_type, converted_at, contact?, lead?, lead_done? }.
 *
 * The `conversion` block drives the new "Module" badge column — it shows which
 * module each quick action was converted into (Contact / Lead / Job), or
 * "Unconverted" when the lead is still a raw inbound capture. The mix below
 * exercises every state: unconverted, single-target, and multi-target rows.
 */

const quickActions = [
  {
    id: 501,
    name: "Maple Ridge Tiling Inquiry",
    phone_number: "+1 515 555 0188",
    email: "owner@mapleridge.example",
    description:
      "Called about drainage tiling for a wet 80-acre corner. Wants an estimate before the fall harvest. Draft still needs finishing.",
    created_by: 2,
    created_by_name: "Bilal Zahid",
    created_at: "2026-06-26T14:20:00Z",
    updated_at: "2026-06-26T14:20:00Z",
    files: [],
    conversion: null,
  },
  {
    id: 502,
    name: "Riverside Grain Co.",
    phone_number: "+1 515 555 0202",
    email: "ops@riversidegrain.example",
    description:
      "Submitted a drainage-tiling lead for 200 acres at the trade show booth.",
    created_by: 2,
    created_by_name: "Bilal Zahid",
    created_at: "2026-06-22T09:10:00Z",
    updated_at: "2026-06-24T11:05:00Z",
    files: [],
    conversion: {
      done: true,
      conversion_type: "lead",
      converted_at: "2026-06-24T11:05:00Z",
      lead: { id: 71, type: "tiling", lead_type_id: 1 },
      lead_done: true,
    },
  },
  {
    id: 503,
    name: "Cedar Hollow Farms",
    phone_number: "+1 515 555 0231",
    email: "contact@cedarhollow.example",
    description:
      "Existing client follow-up — added to the contact book for ongoing excavation work.",
    created_by: 1,
    created_by_name: "Sajid Zahid",
    created_at: "2026-06-19T16:40:00Z",
    updated_at: "2026-06-20T08:15:00Z",
    files: [],
    conversion: {
      done: true,
      conversion_type: "contact",
      converted_at: "2026-06-20T08:15:00Z",
      contact: {
        id: 44,
        full_name: "Cedar Hollow Farms",
        email: "contact@cedarhollow.example",
        phone_number: "+1 515 555 0231",
      },
    },
  },
  {
    id: 504,
    name: "Delta Wetland Excavation",
    phone_number: "+1 515 555 0277",
    email: "site@deltawetland.example",
    description:
      "Permit cleared — converted straight into a scheduled excavation job.",
    created_by: 3,
    created_by_name: "Omar Zahid",
    created_at: "2026-06-15T13:00:00Z",
    updated_at: "2026-06-18T10:30:00Z",
    files: [],
    conversion: {
      done: true,
      conversion_type: "job",
      converted_at: "2026-06-18T10:30:00Z",
    },
  },
  {
    id: 505,
    name: "Oakridge Agronomy",
    phone_number: "+1 515 555 0299",
    email: "hello@oakridgeagronomy.example",
    description:
      "Added as a contact and opened a tiling lead for their north quarter.",
    created_by: 2,
    created_by_name: "Bilal Zahid",
    created_at: "2026-06-12T10:25:00Z",
    updated_at: "2026-06-21T15:45:00Z",
    files: [],
    conversion: {
      done: true,
      conversion_type: ["contact", "lead"],
      converted_at: "2026-06-21T15:45:00Z",
      contact: {
        id: 52,
        full_name: "Oakridge Agronomy",
        email: "hello@oakridgeagronomy.example",
        phone_number: "+1 515 555 0299",
      },
      lead: { id: 73, type: "tiling", lead_type_id: 1 },
      lead_done: true,
    },
  },
  {
    id: 506,
    name: "Birchwood Co-op",
    phone_number: "+1 515 555 0314",
    email: "office@birchwoodcoop.example",
    description:
      "Walk-in asking about a pipe-repair quote. Still gathering details before converting.",
    created_by: 5,
    created_by_name: "Tyler Brooks",
    created_at: "2026-06-10T11:50:00Z",
    updated_at: "2026-06-10T11:50:00Z",
    files: [],
    conversion: null,
  },
  {
    id: 507,
    name: "Sandhill Ranch Repair",
    phone_number: "+1 515 555 0356",
    email: "manager@sandhillranch.example",
    description:
      "Emergency washout on the east lateral — converted into a repair job same day.",
    created_by: 4,
    created_by_name: "Marcus Reed",
    created_at: "2026-06-05T08:30:00Z",
    updated_at: "2026-06-05T17:20:00Z",
    files: [],
    conversion: {
      done: true,
      conversion_type: "job",
      converted_at: "2026-06-05T17:20:00Z",
    },
  },
];

/**
 * QuickActionsService reads `response.data` (the real backend wraps every quick
 * action endpoint in ApiSuccessResponse `{ success, data }`), so these routes
 * must serve that envelope verbatim — NOT the bare-array `listResponse` wrapper
 * the mock applies by default. Hence `list: false` on both.
 */
export const routes: MockRoute[] = [
  // DETAIL — single quick action by id (listed first; more specific match)
  {
    match: /^ms\/organizations\/\d+\/quick-actions\/\d+\/?$/,
    list: false,
    data: { success: true, data: quickActions[0] },
  },
  // LIST — all quick actions
  {
    match: /^ms\/organizations\/\d+\/quick-actions\/?$/,
    list: false,
    data: { success: true, data: quickActions },
  },
];
