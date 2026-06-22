/**
 * GET /ms/organizations/{id}/dashboard/
 * Fields referenced by the org dashboard UI (`dataToDashboardData`).
 */
import type { OrganizationInvoiceListItem } from "./invoices";

/** Legacy `designs_needed_by_you` map value (tuple). */
export type DesignsNeededByYouLegacyTuple = [
  string,
  string,
  number | null,
  string | null | undefined,
];

export interface DesignsNeededByYouFarmManagementContact {
  id: number;
  full_name: string;
  phone_number?: string;
}

/** Current `designs_needed_by_you` map value (object). */
export interface DesignsNeededByYouApiRecord {
  title?: string;
  po_number?: string;
  farm_id?: number;
  farm_name?: string | null;
  record_id?: number;
  record_type?: string;
  state?: string;
  is_archived?: boolean;
  is_cancelled?: boolean;
  is_completed?: boolean;
  detail_api_path?: string;
  farm_management_names?: string[];
  farm_management_contacts?: DesignsNeededByYouFarmManagementContact[];
}

export type DesignsNeededByYouMapValue =
  | DesignsNeededByYouApiRecord
  | DesignsNeededByYouLegacyTuple;

/**
 * Invoice row shape consumed by the dashboard invoice table mapper.
 * Uses fields present on {@link OrganizationInvoiceListItem}.
 */
export type DashboardInvoiceTableSource = Pick<
  OrganizationInvoiceListItem,
  "title" | "invoice_number" | "checked_by_admin" | "sent_to_client" | "paid"
>;

/** Invoice table row after mapping {@link OrganizationInvoiceListItem} booleans to Yes/No. */
export interface DashboardInvoiceDisplayRow {
  customerName: string;
  poNumber: string;
  checkedByAdmin: "Yes" | "No";
  sentToClient: "Yes" | "No";
  paid: "Yes" | "No";
}

/** Designs-needed list row (from `designs_needed_by_you` + navigation). */
export interface DashboardDesignNeededRow {
  rowKey: string;
  customerName: string;
  poNumber: string;
  farmManagementContactName?: string;
  designId: number | null;
  href: string | null;
  canNavigate: boolean;
}

/** Invoice status counts for dashboard radial chart (from dashboard API fields). */
export interface DashboardInvoiceStatusCounts {
  total: number;
  checkedByAdmin: number;
  sentToClient: number;
  paid: number;
}

/** Single tab under GET .../dashboard/ `acreage_tabs` */
export interface AcreageTabConfig {
  label: string;
  total_acres: number;
  total_farm_acres_of_all_tiling_leads?: number;
  total_farm_acres_of_all_uncompleted_tiling_jobs?: number;
  total_farm_acres_of_all_completed_tiling_jobs?: number;
  total_leads_jobs_acres_of_all_tiling_leads?: number;
  total_leads_jobs_acres_of_all_uncompleted_tiling_jobs?: number;
  total_leads_jobs_acres_of_all_completed_tiling_jobs?: number;
}

/** Tabbed farm vs leads/jobs acreage totals from the dashboard API */
export interface AcreageTabsPayload {
  default_tab?: "farm_acres" | "leads_jobs_acres" | string;
  farm_acres: AcreageTabConfig;
  leads_jobs_acres: AcreageTabConfig;
}

export type DashboardJobStatusType = "Repair" | "Excavation" | "Tile";

export interface DashboardJobStatusRow {
  type: DashboardJobStatusType;
  Active: number;
  Completed?: number;
  Cancelled?: number;
}

export interface DashboardPendingApprovalRow {
  type: DashboardJobStatusType;
  Count: number;
}

export interface DashboardLeadTypeData {
  title: string;
  legend: Record<string, number>;
}

export interface DashboardChartData {
  jobStatusData?: DashboardJobStatusRow[];
  pendingApprovalData?: DashboardPendingApprovalRow[];
  leadTypeData?: DashboardLeadTypeData;
}

export interface OrganizationDashboardResponse {
  shared_to_diggs_jobs?: number;
  not_approved_farmer_jobs?: number;
  not_approved_farmer_tiling_jobs?: number;
  not_approved_farmer_excavation_jobs?: number;
  not_approved_farmer_repair_jobs?: number;
  total_members?: number;
  admin_members?: number;
  project_managers_members?: number;
  project_crews_members?: number;
  bookkeepers_members?: number;
  total_farmer_jobs?: number;
  tiling_farmer_jobs?: number;
  excavation_farmer_jobs?: number;
  repair_farmer_jobs?: number;
  total_invoices?: number;
  checked_by_admin_invoices?: number;
  sent_to_client_invoices?: number;
  paid_invoices?: number;
  designs_needed_by_you?: Record<string, DesignsNeededByYouMapValue>;
  near_maintenance_count?: number;
  total_jobs?: number;
  cancelled_jobs?: number;
  completed_jobs?: number;
  total_running_tiling_jobs?: number;
  total_running_excavation_jobs?: number;
  total_running_repair_jobs?: number;
  total_cancelled_tiling_jobs?: number;
  total_cancelled_excavation_jobs?: number;
  total_cancelled_repair_jobs?: number;
  total_completed_tiling_jobs?: number;
  total_completed_excavation_jobs?: number;
  total_completed_repair_jobs?: number;
  total_billing_tiling_jobs?: number;
  total_billing_excavation_jobs?: number;
  total_billing_repair_jobs?: number;
  total_leads?: number;
  total_drainage_tiling_leads?: number;
  total_excavation_leads?: number;
  total_repair_leads?: number;
  total_equipments?: number;
  total_equipment_in_maintenance?: number;
  total_acres_of_all_tiling_leads?: number;
  total_acres_of_all_uncompleted_tilling_jobs?: number;
  total_acres_of_all_completed_tilling_jobs?: number;
  /** Optional; when present, dashboard acreage UI should use tabbed farm vs leads/jobs totals */
  acreage_tabs?: AcreageTabsPayload;
}
