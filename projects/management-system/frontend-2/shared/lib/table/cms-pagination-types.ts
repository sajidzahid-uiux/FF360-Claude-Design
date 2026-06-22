import type { PaginatedResponse } from "@/api/types/common";

/** Snake_case pagination block from Django list APIs. */
export interface CmsPaginatedMetaSnake {
  total_count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
}

/** CamelCase pagination from CMS query hooks (e.g. `useContacts`). */
export interface CmsPaginatedMetaCamel {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export type CmsPaginationSource =
  | CmsPaginatedMetaSnake
  | CmsPaginatedMetaCamel
  | null
  | undefined;

export type CmsPaginatedApiResponse<T> = PaginatedResponse<T>;
