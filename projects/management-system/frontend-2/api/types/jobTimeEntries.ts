import type { JobType } from "@/constants";

export interface TimeEntry {
  id: number;
  hours: number;
  description: string | null;
  entered_by: number;
  entered_by_name: string;
  timestamp: string;
  job_title: string;
}

export interface TimeEntryResponse {
  message: string;
  entry: TimeEntry;
}

export interface TimeEntryPayload {
  job_id: number;
  job_type: JobType | "tiling";
  hours: number;
  description?: string;
}

export interface UpdateTimeEntryPayload {
  id: number;
  hours: number;
  description?: string | null;
}

/** Paginated list from GET job-time-entries with `page` / `page_size`. */
export interface PaginatedJobTimeEntriesResponse {
  total_count: number;
  next: string | null;
  previous: string | null;
  page_size: number;
  current_page: number;
  total_pages: number;
  results: TimeEntry[];
}

export interface JobTimeEntriesListPageResult {
  results: TimeEntry[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}
