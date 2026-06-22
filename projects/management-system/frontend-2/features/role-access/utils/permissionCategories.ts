import type { Permission } from "@/api/types";

export type PermissionCategoryId =
  | "feature_access"
  | "work_opportunities"
  | "action";

export interface PermissionCategory {
  id: PermissionCategoryId;
  title: string;
  permissionPrefixes: string[];
}

/**
 * Maps permission code prefixes to display labels.
 * Used when permission name from API is generic.
 */
const PERMISSION_DISPLAY_LABELS: Record<string, string> = {
  leads_page: "Leads",
  jobs_repair_page: "Jobs - Repair",
  jobs_repair_edit_status: "Jobs - Repair",
  jobs_repair_crew_management: "Jobs - Repair",
  jobs_repair_equipment_management: "Jobs - Repair",
  jobs_excavation_page: "Jobs - Excavation",
  jobs_excavation_edit_status: "Jobs - Excavation",
  jobs_excavation_crew_management: "Jobs - Excavation",
  jobs_excavation_equipment_management: "Jobs - Excavation",
  jobs_excavation_estimate_financial: "Jobs - Excavation",
  jobs_tiling_page: "Jobs - Tiling",
  jobs_tiling_edit_status: "Jobs - Tiling",
  jobs_tiling_crew_management: "Jobs - Tiling",
  jobs_tiling_equipment_management: "Jobs - Tiling",
  jobs_tiling_estimate_financial: "Jobs - Tiling",
  completed_canceled_page: "Completed & Canceled Jobs",
  equipment_page: "Equipment",
  order_pipes_list: "Order Pipe",
  contact_access: "Contacts",
  contact_farm_tab: "Contact Farm Tab",
  crew_management_page: "Crew Management",
  settings_page: "Settings",
  team_organization_info: "Team & Organization Info",
  trash_page: "Trash",
  todo_list: "TO DO List",
  todo_list_edit_status: "TO DO List",
  book_keeping: "Book Keeping",
  dashboard: "Dashboard",
  footage: "Installed Footage",
};

function getResourcePrefix(code: string): string {
  const base = getPermissionPrefix(code);
  if (base.startsWith("jobs_repair")) return "jobs_repair_page";
  if (base.startsWith("jobs_excavation")) return "jobs_excavation_page";
  if (base.startsWith("jobs_tiling")) return "jobs_tiling_page";
  if (base.startsWith("todo_list")) return "todo_list";
  return base;
}

const CATEGORIES: PermissionCategory[] = [
  {
    id: "feature_access",
    title: "Feature Access Permissions",
    permissionPrefixes: [
      "equipment_page",
      "contact_access",
      "contact_farm_tab",
      "crew_management_page",
      "settings_page",
      "team_organization_info",
      "trash_page",
      "todo_list",
      "dashboard",
      "footage",
    ],
  },
  {
    id: "work_opportunities",
    title: "Work and Opportunities",
    permissionPrefixes: [
      "leads_page",
      "jobs_repair",
      "jobs_excavation",
      "jobs_tiling",
      "completed_canceled_page",
    ],
  },
  {
    id: "action",
    title: "Action",
    permissionPrefixes: ["order_pipes_list", "book_keeping"],
  },
];

function getPermissionPrefix(code: string): string {
  return code.replace(/_read$|_write$|_delete$/, "");
}

function getDisplayLabel(permission: Permission): string {
  const resourcePrefix = getResourcePrefix(permission.code);
  return (
    PERMISSION_DISPLAY_LABELS[resourcePrefix] ||
    PERMISSION_DISPLAY_LABELS[getPermissionPrefix(permission.code)] ||
    permission.name ||
    resourcePrefix
  );
}

export interface GroupedPermission {
  label: string;
  permissions: Permission[];
  hasAccess: boolean;
}

function findCategoryForPermission(permCode: string): PermissionCategoryId {
  const prefix = getPermissionPrefix(permCode);
  for (const category of CATEGORIES) {
    const matches = category.permissionPrefixes.some(
      (p) => prefix.startsWith(p) || prefix === p
    );
    if (matches) return category.id;
  }
  return "feature_access";
}

export function groupPermissionsByCategory(
  permissions: Permission[]
): Map<PermissionCategoryId, GroupedPermission[]> {
  const result = new Map<PermissionCategoryId, Map<string, Permission[]>>();

  for (const perm of permissions) {
    const categoryId = findCategoryForPermission(perm.code);
    const label = getDisplayLabel(perm);

    if (!result.has(categoryId)) {
      result.set(categoryId, new Map());
    }
    const groups = result.get(categoryId)!;
    if (!groups.has(label)) {
      groups.set(label, []);
    }
    groups.get(label)!.push(perm);
  }

  const output = new Map<PermissionCategoryId, GroupedPermission[]>();
  for (const category of CATEGORIES) {
    const groups = result.get(category.id);
    if (groups && groups.size > 0) {
      output.set(
        category.id,
        Array.from(groups.entries()).map(([label, perms]) => ({
          label,
          permissions: perms,
          hasAccess: true,
        }))
      );
    }
  }
  return output;
}
