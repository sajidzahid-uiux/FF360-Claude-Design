export enum FeatureCategory {
  LEADS_JOBS = "Leads & Jobs",
  NOTIFICATIONS = "Notifications",
  EQUIPMENT = "Equipment",
  CHAT = "Chat",
  LOGGING = "Logging & Audit Trail",
  ROLES_ACCESS = "Roles & Access (R&A)",
  MAINTENANCE = "Maintenance / Installed Footage / Time Tracking",
  USER_MANAGEMENT = "User Management",
  ONBOARDING = "Onboarding",
  EMAILS = "Emails",
  MAP = "Map",
  BILLING = "Billing & Payments",
  NAVIGATION = "Navigation & UX",
}

export enum FeatureModule {
  JOBS = "Jobs",
  LEADS = "Leads",
  EQUIPMENT = "Equipment",
  NOTIFICATIONS = "Notifications",
  EMAIL = "Email",
  CHAT = "Chat",
  SYSTEM = "System",
  MAINTENANCE = "Maintenance",
  FOOTAGE = "Footage",
  TIME_TRACKING = "Time Tracking",
  ROLES = "Roles & Access",
  PROFILE = "Profile",
  NAVIGATION = "Navigation",
  FILTERING = "Filtering",
  BILLING = "Billing",
  MAP = "Map",
  UI = "UI",
  EXPORT = "Export",
}

export interface UpcomingFeature {
  id: string;
  title: string;
  category: FeatureCategory;
}

export interface FeatureCategoryGroup {
  category: FeatureCategory;
  features: UpcomingFeature[];
}

export interface PlatformModule {
  id: string;
  title: string;
  description: string;
}

export interface ConnectedPortal {
  id: string;
  title: string;
  description: string;
}
