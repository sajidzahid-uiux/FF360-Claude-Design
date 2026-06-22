import type { TableServerQuery, TableSortRule } from "@fieldflow360/org-ui";

import type { ContactListParams, ContactSubtype } from "@/api/types";
import { cmsTableQueryToApiParams } from "@/shared/lib/table";

export const CONTACTS_CATEGORY_FILTER_ID = "categories";
export const CONTACTS_SUBTYPE_FILTER_ID = "contact_subtype";
export const CONTACTS_NAME_SORT_COLUMN_KEY = "full_name";

function parseCategoryIds(raw: unknown): number[] {
  if (raw == null) return [];

  const values = Array.isArray(raw) ? raw : [raw];

  return values
    .map((entry) => (typeof entry === "string" ? Number(entry) : Number(entry)))
    .filter((id) => !Number.isNaN(id));
}

/** Maps org-ui name sort to the contacts API `sort` param. */
export function tableSortRulesToContactSort(
  sortRules: TableSortRule[]
): "az" | "za" | undefined {
  const nameRule = sortRules.find(
    (rule) => rule.columnKey === CONTACTS_NAME_SORT_COLUMN_KEY
  );
  if (!nameRule) return undefined;

  return nameRule.direction === "asc" ? "az" : "za";
}

export function contactSortToTableSortRules(
  sort?: "az" | "za" | null
): TableSortRule[] {
  if (sort === "az") {
    return [{ columnKey: CONTACTS_NAME_SORT_COLUMN_KEY, direction: "asc" }];
  }
  if (sort === "za") {
    return [{ columnKey: CONTACTS_NAME_SORT_COLUMN_KEY, direction: "desc" }];
  }
  return [];
}

/** Maps org-ui table query state to the contacts list API params. */
export function contactsTableQueryToListParams(
  query: TableServerQuery
): ContactListParams {
  const params = cmsTableQueryToApiParams(query, {
    filterParamMap: { [CONTACTS_CATEGORY_FILTER_ID]: "categories" },
  });

  const listParams: ContactListParams = {
    page: Number(params.page),
    page_size: Number(params.page_size),
  };

  const subtypeRaw = params[CONTACTS_SUBTYPE_FILTER_ID];
  if (typeof subtypeRaw === "string" && subtypeRaw.length > 0) {
    listParams.contact_subtype = subtypeRaw as ContactSubtype;
  }

  const search = params.search;
  if (typeof search === "string" && search.length > 0) {
    listParams.search = search;
  }

  const categories = parseCategoryIds(params.categories);
  if (categories.length > 0) {
    listParams.categories = categories;
  }

  const sort = tableSortRulesToContactSort(query.sortRules);
  if (sort) {
    listParams.sort = sort;
  }

  return listParams;
}
