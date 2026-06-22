export const DASHBOARD_CONSTANTS = {
  GRID: {
    COLS_DEFAULT: 1,
    COLS_LG: 3,
    COLS_XL: 4,
    GAP: 6,
  },
  CHART_HEIGHTS: {
    DEFAULT: 275,
    CONTENT: 120,
  },
  LOADING_MESSAGES: {
    DASHBOARD: "Loading dashboard data...",
    PERMISSIONS: "Checking permissions...",
    NO_DATA: "No dashboard data available",
    NO_PERMISSION:
      "You don't have permission to view dashboard data. Please contact your administrator.",
  },
} as const;

export const DASHBOARD_QUERY_KEYS = {
  DASHBOARD_DATA: ["dashboardData"],
  INVOICES: ["invoices"],
} as const;
