import {
  PERMISSION_RESOURCES,
  PermissionKey,
  permFor,
} from "@/hooks/permissions";

export interface PermissionItemConfig {
  key: PermissionKey;
  label: string;
  isMainPermission?: boolean;
}

export interface PermissionSectionConfig {
  id: string;
  title: string;
  items: PermissionItemConfig[];
}

export const PERMISSIONS_CONFIG: PermissionSectionConfig[] = [
  {
    id: "leads",
    title: "Leads",
    items: [
      {
        key: permFor(PERMISSION_RESOURCES.LEADS_PAGE, "read"),
        label: "Full Access",
        isMainPermission: true,
      },
      {
        key: permFor(PERMISSION_RESOURCES.LEADS_PAGE, "write"),
        label: "Full Access",
      },
      {
        key: permFor(PERMISSION_RESOURCES.LEADS_PAGE, "delete"),
        label: "Full Access",
      },
    ],
  },
  {
    id: "jobsRepair",
    title: "Repair Jobs",
    items: [
      {
        key: permFor(PERMISSION_RESOURCES.JOBS_REPAIR_PAGE, "read"),
        label: "View Repair Jobs",
        isMainPermission: true,
      },
      {
        key: permFor(PERMISSION_RESOURCES.JOBS_REPAIR_PAGE, "write"),
        label: "Full Access Repair Jobs",
      },
      {
        key: permFor(PERMISSION_RESOURCES.JOBS_REPAIR_PAGE, "delete"),
        label: "Full Access Repair Jobs",
      },
      {
        key: permFor(PERMISSION_RESOURCES.JOBS_REPAIR_EDIT_STATUS, "write"),
        label: "Edit Status",
      },
      {
        key: permFor(PERMISSION_RESOURCES.JOBS_REPAIR_CREW_MANAGEMENT, "write"),
        label: "Full Crew Management",
      },
      {
        key: permFor(
          PERMISSION_RESOURCES.JOBS_REPAIR_CREW_MANAGEMENT,
          "delete"
        ),
        label: "Full Crew Management",
      },
      {
        key: permFor(
          PERMISSION_RESOURCES.JOBS_REPAIR_EQUIPMENT_MANAGEMENT,
          "write"
        ),
        label: "Full Equipment Management",
      },
      {
        key: permFor(
          PERMISSION_RESOURCES.JOBS_REPAIR_EQUIPMENT_MANAGEMENT,
          "delete"
        ),
        label: "Full Equipment Management",
      },
    ],
  },
  {
    id: "jobsExcavation",
    title: "Excavation Jobs",
    items: [
      {
        key: permFor(PERMISSION_RESOURCES.JOBS_EXCAVATION_PAGE, "read"),
        label: "View Excavation Jobs",
        isMainPermission: true,
      },
      {
        key: permFor(PERMISSION_RESOURCES.JOBS_EXCAVATION_PAGE, "write"),
        label: "Full Access Excavation Jobs",
      },
      {
        key: permFor(PERMISSION_RESOURCES.JOBS_EXCAVATION_PAGE, "delete"),
        label: "Full Access Excavation Jobs",
      },
      {
        key: permFor(PERMISSION_RESOURCES.JOBS_EXCAVATION_EDIT_STATUS, "write"),
        label: "Edit Status",
      },
      {
        key: permFor(
          PERMISSION_RESOURCES.JOBS_EXCAVATION_CREW_MANAGEMENT,
          "write"
        ),
        label: "Full Crew Management",
      },
      {
        key: permFor(
          PERMISSION_RESOURCES.JOBS_EXCAVATION_CREW_MANAGEMENT,
          "delete"
        ),
        label: "Full Crew Management",
      },
      {
        key: permFor(
          PERMISSION_RESOURCES.JOBS_EXCAVATION_EQUIPMENT_MANAGEMENT,
          "write"
        ),
        label: "Full Equipment Management",
      },
      {
        key: permFor(
          PERMISSION_RESOURCES.JOBS_EXCAVATION_EQUIPMENT_MANAGEMENT,
          "delete"
        ),
        label: "Full Equipment Management",
      },
      {
        key: permFor(
          PERMISSION_RESOURCES.JOBS_EXCAVATION_ESTIMATE_FINANCIAL,
          "read"
        ),
        label: "Full Estimate & Financial",
      },
      {
        key: permFor(
          PERMISSION_RESOURCES.JOBS_EXCAVATION_ESTIMATE_FINANCIAL,
          "write"
        ),
        label: "Full Estimate & Financial",
      },
    ],
  },
  {
    id: "jobsTiling",
    title: "Tiling Jobs",
    items: [
      {
        key: permFor(PERMISSION_RESOURCES.JOBS_TILING_PAGE, "read"),
        label: "View Tiling Jobs",
        isMainPermission: true,
      },
      {
        key: permFor(PERMISSION_RESOURCES.JOBS_TILING_PAGE, "write"),
        label: "Full Access Tiling Jobs",
      },
      {
        key: permFor(PERMISSION_RESOURCES.JOBS_TILING_PAGE, "delete"),
        label: "Full Access Tiling Jobs",
      },
      {
        key: permFor(PERMISSION_RESOURCES.JOBS_TILING_EDIT_STATUS, "write"),
        label: "Edit Status",
      },
      {
        key: permFor(PERMISSION_RESOURCES.JOBS_TILING_CREW_MANAGEMENT, "write"),
        label: "Full Crew Management",
      },
      {
        key: permFor(
          PERMISSION_RESOURCES.JOBS_TILING_CREW_MANAGEMENT,
          "delete"
        ),
        label: "Full Crew Management",
      },
      {
        key: permFor(
          PERMISSION_RESOURCES.JOBS_TILING_EQUIPMENT_MANAGEMENT,
          "write"
        ),
        label: "Full Equipment Management",
      },
      {
        key: permFor(
          PERMISSION_RESOURCES.JOBS_TILING_EQUIPMENT_MANAGEMENT,
          "delete"
        ),
        label: "Full Equipment Management",
      },
      {
        key: permFor(
          PERMISSION_RESOURCES.JOBS_TILING_ESTIMATE_FINANCIAL,
          "read"
        ),
        label: "Full Estimate & Financial",
      },
      {
        key: permFor(
          PERMISSION_RESOURCES.JOBS_TILING_ESTIMATE_FINANCIAL,
          "write"
        ),
        label: "Full Estimate & Financial",
      },
      {
        key: permFor(
          PERMISSION_RESOURCES.JOBS_TILING_ESTIMATE_FINANCIAL,
          "delete"
        ),
        label: "Full Estimate & Financial",
      },
    ],
  },
  {
    id: "completedCanceled",
    title: "Completed & Canceled (CO & CA)",
    items: [
      {
        key: permFor(PERMISSION_RESOURCES.COMPLETED_CANCELED_PAGE, "read"),
        label: "Full Access",
        isMainPermission: true,
      },
      {
        key: permFor(PERMISSION_RESOURCES.COMPLETED_CANCELED_PAGE, "write"),
        label: "Full Access",
      },
      {
        key: permFor(PERMISSION_RESOURCES.COMPLETED_CANCELED_PAGE, "delete"),
        label: "Full Access",
      },
    ],
  },
  {
    id: "equipment",
    title: "Equipment",
    items: [
      {
        key: permFor(PERMISSION_RESOURCES.EQUIPMENT_PAGE, "read"),
        label: "View",
        isMainPermission: true,
      },
      {
        key: permFor(PERMISSION_RESOURCES.EQUIPMENT_PAGE, "write"),
        label: "Edit",
      },
      {
        key: permFor(PERMISSION_RESOURCES.EQUIPMENT_PAGE, "delete"),
        label: "Delete",
      },
    ],
  },
  {
    id: "contacts",
    title: "Contacts & Categories",
    items: [
      {
        key: permFor(PERMISSION_RESOURCES.CONTACT_ACCESS, "read"),
        label: "View",
        isMainPermission: true,
      },
      {
        key: permFor(PERMISSION_RESOURCES.CONTACT_ACCESS, "write"),
        label: "Edit",
      },
      {
        key: permFor(PERMISSION_RESOURCES.CONTACT_ACCESS, "delete"),
        label: "Delete",
      },
    ],
  },
  {
    id: "farms",
    title: "Farms",
    items: [
      {
        key: permFor(PERMISSION_RESOURCES.CONTACT_FARM_TAB, "read"),
        label: "View",
        isMainPermission: true,
      },
      {
        key: permFor(PERMISSION_RESOURCES.CONTACT_FARM_TAB, "write"),
        label: "Edit",
      },
      {
        key: permFor(PERMISSION_RESOURCES.CONTACT_FARM_TAB, "delete"),
        label: "Full Access",
      },
    ],
  },
  {
    id: "todoList",
    title: "To-Do List",
    items: [
      {
        key: permFor(PERMISSION_RESOURCES.TODO_LIST, "read"),
        label: "View",
        isMainPermission: true,
      },
      {
        key: permFor(PERMISSION_RESOURCES.TODO_LIST_EDIT_STATUS, "write"),
        label: "Edit Status",
      },
      {
        key: permFor(PERMISSION_RESOURCES.TODO_LIST, "write"),
        label: "Edit",
      },
      {
        key: permFor(PERMISSION_RESOURCES.TODO_LIST_EDIT_STATUS, "write"),
        label: "Edit",
      },
      {
        key: permFor(PERMISSION_RESOURCES.TODO_LIST, "delete"),
        label: "Full Access",
      },
      {
        key: permFor(PERMISSION_RESOURCES.TODO_LIST_EDIT_STATUS, "write"),
        label: "Full Access",
      },
    ],
  },
  {
    id: "trash",
    title: "Trash",
    items: [
      {
        key: permFor(PERMISSION_RESOURCES.TRASH_PAGE, "read"),
        label: "Full Access",
        isMainPermission: true,
      },
      {
        key: permFor(PERMISSION_RESOURCES.TRASH_PAGE, "write"),
        label: "Full Access",
      },
      {
        key: permFor(PERMISSION_RESOURCES.TRASH_PAGE, "delete"),
        label: "Full Access",
      },
    ],
  },
  {
    id: "orderPipes",
    title: "Order Pipes",
    items: [
      {
        key: permFor(PERMISSION_RESOURCES.ORDER_PIPES_LIST, "read"),
        label: "View Order Pipes",
        isMainPermission: true,
      },
      {
        key: permFor(PERMISSION_RESOURCES.ORDER_PIPES_LIST, "write"),
        label: "Create & Edit Order Pipes",
      },
      {
        key: permFor(PERMISSION_RESOURCES.ORDER_PIPES_LIST, "delete"),
        label: "Delete Order Pipes",
      },
    ],
  },
  {
    id: "crewManagement",
    title: "Crew Management",
    items: [
      {
        key: permFor(PERMISSION_RESOURCES.CREW_MANAGEMENT_PAGE, "read"),
        label: "Full Access",
        isMainPermission: true,
      },
      {
        key: permFor(PERMISSION_RESOURCES.CREW_MANAGEMENT_PAGE, "write"),
        label: "Full Access",
      },
      {
        key: permFor(PERMISSION_RESOURCES.CREW_MANAGEMENT_PAGE, "delete"),
        label: "Full Access",
      },
    ],
  },
  {
    id: "settings",
    title: "Settings",
    items: [
      {
        key: permFor(PERMISSION_RESOURCES.SETTINGS_PAGE, "read"),
        label: "Full Access",
        isMainPermission: true,
      },
      {
        key: permFor(PERMISSION_RESOURCES.SETTINGS_PAGE, "write"),
        label: "Full Access",
      },
      {
        key: permFor(PERMISSION_RESOURCES.SETTINGS_PAGE, "delete"),
        label: "Full Access",
      },
    ],
  },
];
