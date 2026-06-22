export const PERMISSION_ACTIONS = ["read", "write", "delete"] as const;
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export const PERMISSION_RESOURCES = {
  COMPLETED_CANCELED_PAGE: "completed_canceled_page",
  CONTACT_ACCESS: "contact_access",
  CONTACT_FARM_TAB: "contact_farm_tab",
  CREW_MANAGEMENT_PAGE: "crew_management_page",
  EQUIPMENT_PAGE: "equipment_page",

  JOBS_EXCAVATION_CREW_MANAGEMENT: "jobs_excavation_crew_management",
  JOBS_EXCAVATION_EDIT_STATUS: "jobs_excavation_edit_status",
  JOBS_EXCAVATION_EQUIPMENT_MANAGEMENT: "jobs_excavation_equipment_management",
  JOBS_EXCAVATION_ESTIMATE_FINANCIAL: "jobs_excavation_estimate_financial",
  JOBS_EXCAVATION_PAGE: "jobs_excavation_page",

  JOBS_REPAIR_CREW_MANAGEMENT: "jobs_repair_crew_management",
  JOBS_REPAIR_EDIT_STATUS: "jobs_repair_edit_status",
  JOBS_REPAIR_EQUIPMENT_MANAGEMENT: "jobs_repair_equipment_management",
  JOBS_REPAIR_PAGE: "jobs_repair_page",

  JOBS_TILING_CREW_MANAGEMENT: "jobs_tiling_crew_management",
  JOBS_TILING_EDIT_STATUS: "jobs_tiling_edit_status",
  JOBS_TILING_EQUIPMENT_MANAGEMENT: "jobs_tiling_equipment_management",
  JOBS_TILING_ESTIMATE_FINANCIAL: "jobs_tiling_estimate_financial",
  JOBS_TILING_PAGE: "jobs_tiling_page",

  TODO_LIST_EDIT_STATUS: "todo_list_edit_status",
  TODO_LIST: "todo_list",

  ORDER_PIPES_LIST: "order_pipes_list",

  LEADS_PAGE: "leads_page",
  SETTINGS_PAGE: "settings_page",
  TEAM_ORGANIZATION_INFO: "team_organization_info",
  TRASH_PAGE: "trash_page",
};

export type PermissionResource =
  (typeof PERMISSION_RESOURCES)[keyof typeof PERMISSION_RESOURCES];

export type PermissionKey = `${PermissionResource}_${PermissionAction}`;

export function permFor<
  R extends PermissionResource,
  A extends PermissionAction,
>(resource: R, action: A): `${R}_${A}` {
  return `${resource}_${action}` as const;
}
