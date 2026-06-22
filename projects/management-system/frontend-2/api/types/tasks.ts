import type {
  BaseListParams,
  IdOf,
  PaginatedResponse,
  PaginatedResponseAlt,
} from "./common";

// ============================================
// TASK TYPES
// ============================================

export type TaskPriority = "urgent" | "high" | "medium" | "low";

// ============================================
// TASK TYPE INFO (used in Task entity)
// ============================================

export interface TaskTypeInfo {
  id: number;
  type_name: string;
  type_color: string;
}

// ============================================
// TASK TYPE (full entity with all fields)
// ============================================

export interface TaskType {
  id: number;
  type_name: string;
  type_color: string;
  created_at: string; // ISO datetime string (read-only)
  task_count: number; // Read-only count of tasks using this type
}

// ============================================
// TASK TYPE LIST PARAMS
// ============================================

export interface TaskTypeListParams extends BaseListParams {
  search?: string;
}

// ============================================
// TASK TYPE CREATE PAYLOAD
// ============================================

export interface TaskTypeCreatePayload {
  type_name: string;
  type_color: string; // Must be valid hex color code (e.g., "#FF5733")
}

// ============================================
// TASK TYPE UPDATE PAYLOAD
// ============================================

export interface TaskTypeUpdatePayload {
  type_name?: string;
  type_color?: string; // Must be valid hex color code (e.g., "#FF5733")
}

// ============================================
// PAGINATED TASK TYPE RESPONSE
// ============================================

export interface PaginatedTaskTypeResponse extends PaginatedResponseAlt<TaskType> {
  count: number;
  next: string | null;
  previous: string | null;
  results: TaskType[];
}

// ============================================
// TASK STATUS INFO
// ============================================

export interface TaskStatusInfo {
  id: number;
  name: string;
  is_default: boolean;
}

// ============================================
// TASK STATUS (full entity)
// ============================================

export interface TaskStatus {
  id: number;
  organization: number;
  name: string;
  is_default: boolean;
  created_at: string;
}

// ============================================
// TASK STATUS LIST PARAMS
// ============================================

export type TaskStatusListParams = BaseListParams;

// ============================================
// PAGINATED TASK STATUS RESPONSE
// ============================================

export interface PaginatedTaskStatusResponse extends PaginatedResponseAlt<TaskStatus> {
  total_count?: number;
  page_size?: number;
  current_page?: number;
  total_pages?: number;
}

// ============================================
// ASSIGNEE INFO
// ============================================

export interface AssigneeInfo {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

// ============================================
// TASK
// ============================================

export interface Task {
  id: number;
  organization: number; // Organization ID (read-only)
  task_name: string;
  deadline: string | null; // ISO datetime string or null
  /** Legacy single assignee; backend keeps this aligned with `assignees` */
  assignee?: number | null;
  assignee_info?: AssigneeInfo | null;
  /** Member IDs for all assignees */
  assignees?: number[];
  assignees_info?: AssigneeInfo[];
  task_priority: TaskPriority;
  description?: string;
  overdue: boolean; // Read-only, default: false
  task_type: number | null; // Task type ID (optional)
  task_type_info: TaskTypeInfo | null; // Read-only
  task_status: number | null; // Task status ID (optional)
  task_status_info: TaskStatusInfo | null; // Read-only
  created_at: string; // ISO datetime string (read-only)
  updated_at: string; // ISO datetime string (read-only)
}

// ============================================
// TASK LIST PARAMS
// ============================================

export interface TaskListParams extends BaseListParams {
  search?: string;
  // arrays
  task_types?: number[];
  priorities?: TaskPriority[];
  // single values (backward compatibility)
  task_name?: string;
  assignee?: number;
  task_priority?: TaskPriority;
  task_type?: number;
  task_status?: number;
  // flags and ranges
  overdue?: boolean;
  deadline_from?: string; // ISO date string
  deadline_to?: string; // ISO date string
  deadline_start?: string; // API expects deadline_start
  deadline_end?: string; // API expects deadline_end
}

// ============================================
// TASK CREATE PAYLOAD
// ============================================

export interface TaskCreatePayload {
  task_name: string;
  deadline?: string | null; // ISO datetime string
  assignee?: number;
  /** Preferred: all assignees (member IDs). Backend syncs legacy `assignee` when needed. */
  assignees?: number[];
  task_priority?: TaskPriority;
  description?: string;
  task_type?: number | null;
  task_status?: number | null;
}

// ============================================
// TASK UPDATE PAYLOAD
// ============================================

export type TaskUpdatePayload = Partial<TaskCreatePayload>;

export interface TaskIdUpdateArgs {
  taskId: IdOf<Task>;
  data: TaskUpdatePayload;
}

export interface TaskTypeIdUpdateArgs {
  taskTypeId: IdOf<TaskType>;
  data: TaskTypeUpdatePayload;
}

// ============================================
// PAGINATED TASK RESPONSE
// ============================================

export interface PaginatedTaskResponse extends PaginatedResponse<Task> {
  total_count: number;
  page_size: number;
  current_page: number;
  total_pages: number;
  results: Task[];
}
