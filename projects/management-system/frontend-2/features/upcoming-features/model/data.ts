import {
  ConnectedPortal,
  FeatureCategory,
  PlatformModule,
  UpcomingFeature,
} from "./types";

export const UPCOMING_FEATURES: UpcomingFeature[] = [
  // Leads & Jobs
  {
    id: "f4",
    title: "On Hold Section for Jobs",
    category: FeatureCategory.LEADS_JOBS,
  },
  {
    id: "f5",
    title: "Assigned Comments Section (Restricted)",
    category: FeatureCategory.LEADS_JOBS,
  },
  {
    id: "f6",
    title: "Revert Jobs to Leads",
    category: FeatureCategory.LEADS_JOBS,
  },
  {
    id: "f7",
    title: "Change Job Status from List View",
    category: FeatureCategory.LEADS_JOBS,
  },
  {
    id: "f8",
    title: "Editable Default Statuses (Leads & Jobs)",
    category: FeatureCategory.LEADS_JOBS,
  },
  {
    id: "f9",
    title: "Preview Before Converting Leads to Jobs",
    category: FeatureCategory.LEADS_JOBS,
  },
  {
    id: "f10",
    title: "Real Acres on Job (Different from Farm Acres)",
    category: FeatureCategory.LEADS_JOBS,
  },
  {
    id: "f11",
    title: "Job Status Priority Field",
    category: FeatureCategory.LEADS_JOBS,
  },
  {
    id: "f12",
    title: "Vehicles & Trailers Support for Tiling Jobs",
    category: FeatureCategory.LEADS_JOBS,
  },

  // Notifications
  {
    id: "f22",
    title: "Notifications Categorized by Type",
    category: FeatureCategory.NOTIFICATIONS,
  },
  {
    id: "f23",
    title: "Notifications Support Hyperlinks (Deep Links)",
    category: FeatureCategory.NOTIFICATIONS,
  },

  // Equipment
  {
    id: "f20",
    title: "Equipment Subcategories (Faster Assignment)",
    category: FeatureCategory.EQUIPMENT,
  },
  {
    id: "f21",
    title: "Maintenance Page Equipment Count Indicator",
    category: FeatureCategory.EQUIPMENT,
  },

  // Chat
  {
    id: "f26",
    title: "Message Delivered Status",
    category: FeatureCategory.CHAT,
  },
  {
    id: "f27",
    title: "Message Seen Status",
    category: FeatureCategory.CHAT,
  },

  // Logging & Audit Trail
  {
    id: "f28",
    title: "Global Activity Logging Across the System",
    category: FeatureCategory.LOGGING,
  },
  {
    id: "f29",
    title: "Tracking Hours Logged + Editable with Audit Trail",
    category: FeatureCategory.LOGGING,
  },
  {
    id: "f30",
    title: "Installed Footage Logs Visible + Editable in System",
    category: FeatureCategory.LOGGING,
  },

  // Roles & Access
  {
    id: "f35",
    title: "Responsibility & Access (R&A) Section per User",
    category: FeatureCategory.ROLES_ACCESS,
  },

  // Maintenance / Installed Footage / Time Tracking
  {
    id: "f31",
    title: "Maintenance Advanced Filters (Date Range, Assigned Member)",
    category: FeatureCategory.MAINTENANCE,
  },
  {
    id: "f32",
    title: "Installed Footage Export Design Improvement",
    category: FeatureCategory.MAINTENANCE,
  },
  {
    id: "f33",
    title: "Time Tracking Excel Export + Per-User Work Summary",
    category: FeatureCategory.MAINTENANCE,
  },
  {
    id: "f34",
    title: "Installed Footage Advanced Filters",
    category: FeatureCategory.MAINTENANCE,
  },

  // User Management
  {
    id: "f41",
    title: "Owner Can Update Member Info (Non-owner users)",
    category: FeatureCategory.USER_MANAGEMENT,
  },

  // Onboarding
  {
    id: "f36",
    title: "Profile Completion Prompt After Registration",
    category: FeatureCategory.ONBOARDING,
  },
  {
    id: "f37",
    title: "New Org Member Onboarding Page (Role & Responsibilities)",
    category: FeatureCategory.ONBOARDING,
  },

  // Emails
  {
    id: "f24",
    title: "Monthly Automated Summary Email (Org Activity)",
    category: FeatureCategory.EMAILS,
  },
  {
    id: "f25",
    title: "Improved Email Template Design",
    category: FeatureCategory.EMAILS,
  },

  // Map
  {
    id: "f44",
    title: "Client Farms Shown on Map + Create Leads/Jobs from Map",
    category: FeatureCategory.MAP,
  },

  // Billing & Payments
  {
    id: "f42",
    title: "Support More Payment Methods & Types",
    category: FeatureCategory.BILLING,
  },
  {
    id: "f43",
    title: "Enterprise Plan: Payment Link in Email",
    category: FeatureCategory.BILLING,
  },

  // Navigation & UX
  {
    id: "f38",
    title: "Breadcrumb Navigation Across the System",
    category: FeatureCategory.NAVIGATION,
  },
  {
    id: "f39",
    title: "Advanced Filtering Across All Pages",
    category: FeatureCategory.NAVIGATION,
  },
  {
    id: "f40",
    title: "User Preferences for View Mode",
    category: FeatureCategory.NAVIGATION,
  },
];

export const PLATFORM_MODULES: PlatformModule[] = [
  {
    id: "pm1",
    title: "Advanced Invoicing + QuickBooks Integration",
    description:
      "Seamless syncing of invoices, billing, financial records, and payment tracking directly with QuickBooks.",
  },
  {
    id: "pm2",
    title: "Complete Fleet Management",
    description:
      "Track trucks, trailers, loaders, excavators, and service vehicles. Monitor location, usage, service status, and movement history.",
  },
  {
    id: "pm3",
    title: "Advanced CMMS + Inventory Management",
    description:
      "Maintenance scheduling, service logs, parts history, alerts, and full equipment lifecycle management.",
  },
  {
    id: "pm4",
    title: "Enhanced Job Management System",
    description:
      "Expanded scheduling, job progress tracking, documentation, crew/equipment assignment, and centralized job files.",
  },
  {
    id: "pm5",
    title: "Crew Clock-In / Clock-Out",
    description:
      "Teams clock in/out from the app with time, GPS location, and automated work-hour capture.",
  },
  {
    id: "pm6",
    title: "Client Relationship Management (CRM)",
    description:
      "Manage leads, clients, contractors, farms, contacts, communication logs, and complete job history.",
  },
  {
    id: "pm7",
    title: "Expenses & Internal Billing Management",
    description:
      "Track expenses, receipts, bills, payments, and internal financial documents in one place.",
  },
  {
    id: "pm8",
    title: "Real-Time Equipment Telemetry",
    description:
      "Connect GPS + CAN-Bus data for real-time visibility into equipment performance, utilization, and predictive maintenance alerts.",
  },
  {
    id: "pm10",
    title: "Historical Imagery for Every Farm",
    description:
      "Access multi-year imagery to analyze long-term drainage performance and patterns beyond single-season insights.",
  },
  {
    id: "pm11",
    title: "Field Scanning via Mobile App",
    description:
      "Mobile scanning tools for crews to capture critical field data on-site, in real time, using smartphones.",
  },
];

export const CONNECTED_PORTALS: ConnectedPortal[] = [
  {
    id: "cp1",
    title: "Farmer Portal",
    description:
      "Empowers farmers to map fields, manage tiling projects, request professional designs, and collaborate with contractors/designers, fully connected to the CMS workflow.",
  },
  {
    id: "cp2",
    title: "Pipe Suppliers Portal",
    description:
      "Suppliers receive orders from contractors, manage deliveries, track order status in real time, and communicate across the supply chain through CMS-connected processes.",
  },
  {
    id: "cp3",
    title: "Designer Portal",
    description:
      "Designers receive design requests, collaborate with role-based workflows, provide feedback, and deliver final designs efficiently—tied to the CMS job/order lifecycle.",
  },
  {
    id: "cp4",
    title: "Tile Design Software",
    description:
      "A professional drainage planning workspace to create and review designs step-by-step, collaborate with teams, and export final plans—integrated with CMS jobs and orders.",
  },
];
