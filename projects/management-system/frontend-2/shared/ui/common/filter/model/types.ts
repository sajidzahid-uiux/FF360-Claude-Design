import { ReactNode } from "react";

// ============================================
// Single Filter Types
// ============================================

/**
 * Base configuration shared by all filter types
 */
interface BaseFilterConfig {
  icon?: ReactNode;
  label: string;
  searchPlaceholder?: string;
  showSelectAll?: boolean;
  showClear?: boolean;
  multiSelect?: boolean;
}

/**
 * Configuration for checkbox filters
 */
export interface CheckboxFilterConfig<T> extends BaseFilterConfig {
  type?: "checkbox";
  items: T[];
  labelField: keyof T;
  idField: keyof T;
  renderItem?: (item: T) => ReactNode;
  dateRange?: never;
  customRender?: never;
}

/**
 * Configuration for date-range filters
 */
interface DateRangeFilterConfig extends BaseFilterConfig {
  type: "date-range";
  dateRange: {
    startValue: string;
    endValue: string;
    onStartChange: (date: string) => void;
    onEndChange: (date: string) => void;
    onClear: () => void;
  };
  items?: never;
  labelField?: never;
  idField?: never;
  renderItem?: never;
  customRender?: never;
}

/**
 * Configuration for custom filters
 */
interface CustomFilterConfig extends BaseFilterConfig {
  type: "custom";
  customRender: () => ReactNode;
  items?: never;
  labelField?: never;
  idField?: never;
  renderItem?: never;
  dateRange?: never;
}

/**
 * Union type for all filter configurations
 */
export type FilterConfig<T = Record<string, unknown>> =
  | CheckboxFilterConfig<T>
  | DateRangeFilterConfig
  | CustomFilterConfig;

// ============================================
// Multi-Filter Types
// ============================================

/**
 * State management for multiple filters
 */
export interface MultiFilterState {
  [filterKey: string]: string[];
}

/**
 * Configuration for a filter item in multi-filter mode
 */
export type MultiFilterConfig<T = Record<string, unknown>> = FilterConfig<T> & {
  key: string;
};

/**
 * State management for multiple filters
 */
export interface FilterState {
  [filterKey: string]: string[] | { startValue: string; endValue: string };
}

/**
 * Props for Filter component supporting multiple filters
 */
export interface FilterProps {
  configs: MultiFilterConfig[];
  page?: string;
  filterState: FilterState;
  onFilterChange: (filterState: FilterState) => void;
  direction?: "horizontal" | "vertical";
  className?: string;
  showClearAll?: boolean;
  /** When true, filter controls open in a modal instead of inline. */
  wrapInModal?: boolean;
  modalTitle?: string;
  /** Max width of the filter modal, e.g. `"320px"`. */
  modalWidth?: string;
  buttonLabel?: string;
}

// ============================================
// Filter Enums
// ============================================

/**
 * Generic filter type keys
 * Use this enum for all filter configurations across the application
 */
export enum FilterType {
  // Common filter types
  TYPE = "type",
  STATUS = "status",

  // Task-specific filters
  TASK_TYPES = "task-types",
  TASK_STATUS = "task-status",
  PRIORITIES = "priorities",
  ASSIGNEES = "assignees",
  DEADLINE_RANGE = "deadline-range",

  // Map-specific filters
  JOB_TYPES = "job_types",
  TILING_JOB_STATUSES = "tiling_job_statuses",
  EXCAVATION_JOB_STATUSES = "excavation_job_statuses",
  REPAIR_JOB_STATUSES = "repair_job_statuses",
  LEAD_TYPES = "lead_types",
  LEAD_STATUSES = "lead_statuses",
  LEAD_SOURCES = "lead_sources",
  STATES = "states",
  /** Map: filter jobs and leads by organization project type ids */
  PROJECT_TYPES = "project_types",

  // Contact-specific filters
  CONTACT_CATEGORIES = "contact_categories",
  CATEGORIES = "categories",
  /** Jobs/leads: filter by Farm Management contact id */
  FARM_MANAGEMENT_CONTACT = "farm_management_id",

  // Equipment-specific filters
  EQUIPMENT_TYPES = "equipment_types",

  // Team-specific filters
  MEMBER_ROLES = "member_roles",

  // Knowledge Base filters
  KNOWLEDGE_BASE_SECTIONS = "knowledge_base_sections",

  // Trash-specific filters
  TRASH_CATEGORIES = "trash_categories",
  TRASH_ASSIGNED_TO = "trash_assigned_to",

  // Footage-specific filters
  FOOTAGE_PERIOD_TYPE = "footage_period_type",
  FOOTAGE_DATE = "footage_date",
  FOOTAGE_YEAR = "footage_year",
  /** Selected crew / crew-group ids (string[]) for Installed Footage API `crew` query */
  FOOTAGE_CREW = "footage_crew",
}
