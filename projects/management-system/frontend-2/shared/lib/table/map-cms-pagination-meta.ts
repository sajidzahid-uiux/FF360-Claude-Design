import type { TableServerPaginationMeta } from "@fieldflow360/org-ui";

import type { PaginatedResponse } from "@/api/types/common";

import type {
  CmsPaginatedMetaCamel,
  CmsPaginatedMetaSnake,
  CmsPaginationSource,
} from "./cms-pagination-types";

function isSnakeCaseMeta(
  source: CmsPaginationSource
): source is CmsPaginatedMetaSnake {
  if (!source || typeof source !== "object") return false;
  return "total_count" in source;
}

function isCamelCaseMeta(
  source: CmsPaginationSource
): source is CmsPaginatedMetaCamel {
  if (!source || typeof source !== "object") return false;
  return "totalCount" in source;
}

/** Normalizes CMS API / hook pagination into org-ui server table meta. */
export function mapCmsPaginationMeta(
  source: CmsPaginationSource
): TableServerPaginationMeta | null {
  if (!source) return null;

  if (isSnakeCaseMeta(source)) {
    return {
      totalCount: source.total_count,
      totalPages: source.total_pages,
      currentPage: source.current_page,
      pageSize: source.page_size,
    };
  }

  if (isCamelCaseMeta(source)) {
    return {
      totalCount: source.totalCount,
      totalPages: source.totalPages,
      currentPage: source.currentPage,
      pageSize: source.pageSize,
    };
  }

  return null;
}

/** Maps a paginated API response body to org-ui pagination meta. */
export function mapPaginatedResponseMeta<T extends CmsPaginatedMetaSnake>(
  response: T | null | undefined
): TableServerPaginationMeta | null {
  if (!response) return null;
  return mapCmsPaginationMeta(response);
}

/** Django list response or plain array — for {@link CmsPaginationSource}. */
export function cmsPaginationSourceFromResponse<T>(
  data: PaginatedResponse<T> | T[] | null | undefined
): PaginatedResponse<T> | null {
  if (!data || Array.isArray(data)) return null;
  return data;
}
