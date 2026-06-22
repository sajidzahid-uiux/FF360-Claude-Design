import type {
  DashboardDesignNeededRow,
  DashboardInvoiceDisplayRow,
  DashboardInvoiceStatusCounts,
  OrganizationDashboardResponse,
} from "@/api/types/dashboard";
import type { OrganizationInvoiceListItem } from "@/api/types/invoices";
import { getPrimaryFarmManagementName } from "@/features/contacts/lib";

import {
  type DesignsNavPermissions,
  canOpenDesignsNeededRow,
  hrefFromDetailApiPath,
  inferDesignHref,
  isDesignsNeededApiRow,
  isDesignsNeededLegacyTuple,
  parseDesignEntryId,
} from "./designsNavigation";

export function formatDesignsCustomerName(
  contactName: string,
  farmName: string | null | undefined
): string {
  const trimmed = farmName?.trim();
  return trimmed ? `${contactName} — ${trimmed}` : contactName;
}

export const dataToDashboardData = (
  data: Partial<OrganizationDashboardResponse> | null | undefined = {},
  invoices: ReadonlyArray<OrganizationInvoiceListItem> = [],
  designNavPermissions?: DesignsNavPermissions | null
) => {
  const dashboard: Partial<OrganizationDashboardResponse> = data ?? {};

  return {
    // Data for BarChartMultiple - Shows job statuses by category
    jobStatusData: [
      {
        type: "Repair",
        Active: dashboard.total_running_repair_jobs ?? 0,
        Completed: dashboard.total_completed_repair_jobs ?? 0,
        Cancelled: dashboard.total_cancelled_repair_jobs ?? 0,
      },
      {
        type: "Excavation",
        Active: dashboard.total_running_excavation_jobs ?? 0,
        Completed: dashboard.total_completed_excavation_jobs ?? 0,
        Cancelled: dashboard.total_cancelled_excavation_jobs ?? 0,
      },
      {
        type: "Tile",
        Active: dashboard.total_running_tiling_jobs ?? 0,
        Completed: dashboard.total_completed_tiling_jobs ?? 0,
        Cancelled: dashboard.total_cancelled_tiling_jobs ?? 0,
      },
    ],

    // Data for BarChart - Shows pending approvals
    pendingApprovalData: [
      { type: "Repair", Count: dashboard.not_approved_farmer_repair_jobs ?? 0 },
      {
        type: "Excavation",
        Count: dashboard.not_approved_farmer_excavation_jobs ?? 0,
      },
      { type: "Tile", Count: dashboard.not_approved_farmer_tiling_jobs ?? 0 },
    ],

    // Data for PieChartDonut - User Types
    userTypeData: {
      title: "User Types",
      legend: {
        Administrator: dashboard.admin_members ?? 0,
        Members:
          (dashboard.total_members ?? 0) - (dashboard.admin_members ?? 0),
      },
    },

    // Data for PieChartDonut - Job Types
    jobTypeData: {
      title: "Completed & Cancelled Jobs",
      legend: {
        Completed: dashboard.completed_jobs ?? 0,
        Cancelled: dashboard.cancelled_jobs ?? 0,
      },
    },

    // Data for PieChartDonut - Lead Sources
    leadTypeData: {
      title: "Lead Sources",
      legend: {
        Tile: dashboard.total_drainage_tiling_leads ?? 0,
        Repair: dashboard.total_repair_leads ?? 0,
        Excavation: dashboard.total_excavation_leads ?? 0,
      },
    },

    // Data for PieChartDonut - Acre Types
    acreTypeData: {
      title: "Acre Types",
      legend: {
        "Tile Jobs - Completed":
          dashboard.total_acres_of_all_completed_tilling_jobs ?? 0,
        "Tile Jobs - Uncompleted":
          dashboard.total_acres_of_all_uncompleted_tilling_jobs ?? 0,
        "Tile Leads": dashboard.total_acres_of_all_tiling_leads ?? 0,
      },
    },

    // Data for EquipmentCard
    equipmentData: {
      totalEquipment: dashboard.total_equipments ?? 0,
      inMaintenance: dashboard.total_equipment_in_maintenance ?? 0,
      nearingMaintenance: dashboard.near_maintenance_count ?? 0,
    },

    // Data for JobsCard
    jobsData: {
      totalJobs: dashboard.total_jobs ?? 0,
      sharedWithDesigners: dashboard.shared_to_diggs_jobs ?? 0,
    },

    // Data for DesignsTable - Convert object to array of design jobs
    designsData: Object.entries(dashboard.designs_needed_by_you ?? {}).map(
      ([key, value]): DashboardDesignNeededRow => {
        if (isDesignsNeededApiRow(value)) {
          const detailPath = value.detail_api_path;
          const hrefBase = hrefFromDetailApiPath(
            detailPath,
            !!value.is_archived,
            !!value.is_completed || !!value.is_cancelled
          );
          let href: string | null = hrefBase;
          if (hrefBase && designNavPermissions) {
            if (!canOpenDesignsNeededRow(detailPath, designNavPermissions)) {
              href = null;
            }
          }
          const recordId =
            typeof value.record_id === "number"
              ? value.record_id
              : parseDesignEntryId(key);
          return {
            rowKey: key,
            customerName: formatDesignsCustomerName(
              value.title ?? "",
              value.farm_name
            ),
            poNumber: value.po_number ?? "",
            farmManagementContactName:
              getPrimaryFarmManagementName({
                farm_management_names: value.farm_management_names,
                farm_management_contacts: value.farm_management_contacts,
              }) ?? "N/A",
            designId: recordId,
            href,
            canNavigate: href != null,
          };
        }

        if (isDesignsNeededLegacyTuple(value)) {
          const [contactName, poNumber, objectId, farmName] = value;
          const legacyHref = inferDesignHref(key, objectId);
          return {
            rowKey: key,
            customerName: formatDesignsCustomerName(contactName, farmName),
            poNumber,
            farmManagementContactName: "N/A",
            designId: parseDesignEntryId(key),
            href: legacyHref,
            canNavigate:
              legacyHref != null ||
              (objectId != null && !Number.isNaN(Number(objectId))),
          };
        }

        return {
          rowKey: key,
          customerName: "",
          poNumber: "",
          farmManagementContactName: "N/A",
          designId: null,
          href: null,
          canNavigate: false,
        };
      }
    ),

    invoiceData: invoices.map(
      (invoice): DashboardInvoiceDisplayRow => ({
        customerName: invoice.title,
        poNumber: invoice.invoice_number ?? "",
        checkedByAdmin: invoice.checked_by_admin ? "Yes" : "No",
        sentToClient: invoice.sent_to_client ? "Yes" : "No",
        paid: invoice.paid ? "Yes" : "No",
      })
    ),

    invoiceStatusData: {
      total: dashboard.total_invoices ?? 0,
      checkedByAdmin: dashboard.checked_by_admin_invoices ?? 0,
      sentToClient: dashboard.sent_to_client_invoices ?? 0,
      paid: dashboard.paid_invoices ?? 0,
    } satisfies DashboardInvoiceStatusCounts,
  };
};
