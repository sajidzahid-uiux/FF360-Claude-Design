import {
  type SerializeTableServerQueryOptions,
  type TableServerQuery,
  serializeTableServerQuery,
} from "@fieldflow360/org-ui";

import { CMS_DEFAULT_PAGE_SIZE } from "./constants";

/** Builds Django-style list API params from org-ui table query state. */
export function cmsTableQueryToApiParams(
  query: TableServerQuery,
  serializeOptions?: SerializeTableServerQueryOptions
): Record<string, string | number | string[]> {
  return serializeTableServerQuery(
    {
      ...query,
      pageSize: query.pageSize ?? CMS_DEFAULT_PAGE_SIZE,
    },
    serializeOptions
  );
}
