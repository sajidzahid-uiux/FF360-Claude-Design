import type {
  JobTimeEntriesListPageResult,
  PaginatedJobTimeEntriesResponse,
  TimeEntry,
} from "@/api/types/jobTimeEntries";

/** Normalizes GET job-time-entries responses (paginated envelope or legacy array). */
export function normalizeJobTimeEntriesPage(
  raw: unknown,
  requestedPage: number,
  requestedPageSize: number
): JobTimeEntriesListPageResult {
  if (Array.isArray(raw)) {
    const results = raw as TimeEntry[];
    return {
      results,
      totalCount: results.length,
      pageSize: requestedPageSize,
      currentPage: 1,
      totalPages: 1,
    };
  }

  const r = raw as Partial<PaginatedJobTimeEntriesResponse> & {
    count?: number;
    results?: TimeEntry[];
  };
  const results = Array.isArray(r.results) ? r.results : [];
  const totalCount =
    typeof r.total_count === "number"
      ? r.total_count
      : typeof r.count === "number"
        ? r.count
        : results.length;
  const pageSize =
    typeof r.page_size === "number" ? r.page_size : requestedPageSize;
  const currentPage =
    typeof r.current_page === "number" ? r.current_page : requestedPage;
  const totalPages =
    typeof r.total_pages === "number"
      ? r.total_pages
      : Math.max(1, Math.ceil(totalCount / Math.max(1, pageSize)));

  return {
    results,
    totalCount,
    pageSize,
    currentPage,
    totalPages,
  };
}
