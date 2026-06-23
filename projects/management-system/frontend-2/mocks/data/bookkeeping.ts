import type { MockRoute } from "./types";

/**
 * BOOK-KEEPING (invoices) mock data for "Sajid & Sons Contractors" (org 1).
 *
 * Endpoints (mockApi normalizes url -> protocol/host/query stripped):
 *  - ms/organizations/1/invoices/        -> RAW array of OrganizationInvoiceListItem
 *      (useInvoicesData -> BookKeepingPageContent. Consumed via .map/.find with
 *       client-side search + pagination, NOT a DRF page.)
 *  - ms/organizations/1/invoices/<id>/   -> single invoice (list:false) for detail.
 *
 * The page derives the status badge from three booleans (no status endpoint):
 *   !checked_by_admin                         -> "To Check"
 *   checked_by_admin && !sent_to_client       -> "To Send"
 *   checked && sent && !paid                  -> "To Pay"
 *   checked && sent && paid                   -> "Paid"
 * The amount column is computed from invoice_items (sum unit_price * quantity).
 *
 * Counts here intentionally line up with DEMO_DASHBOARD (org 1):
 *   total_invoices 9, checked_by_admin 6, sent_to_client 5, paid 4.
 *
 * Fields read by renderers (BookKeepingPageContent / InvoiceCard / detail):
 *   id (string), title, description, job (number), invoice_number,
 *   checked_by_admin, sent_to_client, paid, invoice_items[] {activity,
 *   description, quantity, unit_price}, contact_info {full_name}, farm_name.
 */

type LineItem = {
  activity: string;
  description: string;
  quantity: number;
  unit_price: number;
};

const invoice = (
  id: number,
  job: number,
  fullName: string,
  farm_name: string,
  title: string,
  flags: { checked_by_admin: boolean; sent_to_client: boolean; paid: boolean },
  items: LineItem[],
  description = ""
) => ({
  id: String(id),
  invoice_number: `INV-2026-${String(id).padStart(4, "0")}`,
  title,
  description,
  job,
  contact_info: { full_name: fullName },
  farm_name,
  checked_by_admin: flags.checked_by_admin,
  sent_to_client: flags.sent_to_client,
  paid: flags.paid,
  invoice_items: items,
  created_at: "2026-05-01T09:00:00Z",
  due_date: "2026-06-30",
});

const PAID = { checked_by_admin: true, sent_to_client: true, paid: true };
const TO_PAY = { checked_by_admin: true, sent_to_client: true, paid: false };
const TO_SEND = { checked_by_admin: true, sent_to_client: false, paid: false };
const TO_CHECK = { checked_by_admin: false, sent_to_client: false, paid: false };

const invoices = [
  // ---- 4 PAID ----
  invoice(
    1,
    401,
    "Riverside Grain Co.",
    "Riverside Tract 1",
    "Pattern tile — Riverside 200 ac",
    PAID,
    [
      { activity: "Tile install", description: "Dual-wall main + laterals, 200 ac", quantity: 200, unit_price: 920 },
      { activity: "Surface inlets", description: "Inlet structures installed", quantity: 6, unit_price: 480 },
    ],
    "Final invoice for the completed Riverside pattern-tile job."
  ),
  invoice(
    2,
    402,
    "Sandhill Ranch",
    "Sandhill Basin",
    "Sediment basin excavation",
    PAID,
    [
      { activity: "Excavation", description: "Sediment basin + outlet structure", quantity: 1, unit_price: 14800 },
      { activity: "Spoil haul-off", description: "Haul and grade 900 yd spoil", quantity: 900, unit_price: 7 },
    ]
  ),
  invoice(
    3,
    403,
    "Oakridge Agronomy",
    "Oakridge South",
    "8-inch main repair",
    PAID,
    [{ activity: "Tile repair", description: "Replace 40 ft of 8-inch main + coupler", quantity: 1, unit_price: 6400 }]
  ),
  invoice(
    4,
    105,
    "Clearwater Fields",
    "Clearwater Lowland",
    "Surface drainage tile — 120 ac",
    PAID,
    [
      { activity: "Tile install", description: "Grade-control tile, 120 ac", quantity: 120, unit_price: 760 },
      { activity: "Surface intakes", description: "Surface intakes installed", quantity: 4, unit_price: 520 },
    ]
  ),

  // ---- 1 TO PAY (checked + sent, not yet paid) ----
  invoice(
    5,
    101,
    "Johnson Family Farm",
    "Johnson North Field",
    "Mainline tile — east 80 (progress billing)",
    TO_PAY,
    [
      { activity: "Tile install", description: "Mainline + 4-inch laterals, east 80", quantity: 80, unit_price: 880 },
      { activity: "Risers", description: "Surface risers installed", quantity: 6, unit_price: 450 },
    ],
    "Progress invoice — net 30, awaiting payment."
  ),

  // ---- 1 TO SEND (checked, not sent) ----
  invoice(
    6,
    201,
    "Riverside Grain Co.",
    "Riverside Bottoms",
    "Waterway basin dig — progress",
    TO_SEND,
    [
      { activity: "Excavation", description: "Sediment basin dig, 64 machine-hrs", quantity: 64, unit_price: 185 },
      { activity: "Mobilization", description: "Haul equipment to site", quantity: 1, unit_price: 1200 },
    ]
  ),

  // ---- 3 TO CHECK (draft, not yet reviewed by admin) ----
  invoice(
    7,
    102,
    "Prairie View Acres",
    "Prairie South Quarter",
    "Pattern tile — Prairie south (draft)",
    TO_CHECK,
    [{ activity: "Tile install", description: "Random tile, wet pockets, 160 ac", quantity: 160, unit_price: 840 }]
  ),
  invoice(
    8,
    103,
    "Hilltop Dairy",
    "Hilltop West",
    "Tile repair + extension (draft)",
    TO_CHECK,
    [
      { activity: "Tile extension", description: "Extend main 1,200 ft", quantity: 1200, unit_price: 9 },
      { activity: "Tie-ins", description: "Connect new laterals", quantity: 8, unit_price: 240 },
    ]
  ),
  invoice(
    9,
    301,
    "Prairie View Acres",
    "Prairie East 40",
    "Blown tile main repair (draft)",
    TO_CHECK,
    [{ activity: "Tile repair", description: "Replace collapsed 8-inch main, 60 ft", quantity: 60, unit_price: 95 }]
  ),
];

export const routes: MockRoute[] = [
  // DETAIL — single invoice (must precede the list route)
  {
    match: /^ms\/organizations\/\d+\/invoices\/\d+\/?$/,
    list: false,
    data: invoices[0],
  },
  // LIST — all invoices (RAW array; page searches + paginates client-side)
  {
    match: /^ms\/organizations\/\d+\/invoices\/?$/,
    data: invoices,
  },
];
