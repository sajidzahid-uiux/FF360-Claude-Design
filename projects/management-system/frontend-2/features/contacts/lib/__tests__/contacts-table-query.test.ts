import { describe, expect, it } from "vitest";

import {
  CONTACTS_CATEGORY_FILTER_ID,
  CONTACTS_NAME_SORT_COLUMN_KEY,
  contactSortToTableSortRules,
  contactsTableQueryToListParams,
  tableSortRulesToContactSort,
} from "@/features/contacts/lib";

describe("contactsTableQueryToListParams", () => {
  it("maps table query to contacts API params with categories and sort", () => {
    expect(
      contactsTableQueryToListParams({
        page: 2,
        pageSize: 100,
        search: "  acme ",
        filterValues: [
          {
            filterId: CONTACTS_CATEGORY_FILTER_ID,
            values: ["1", "3"],
          },
        ],
        sortRules: [
          { columnKey: CONTACTS_NAME_SORT_COLUMN_KEY, direction: "asc" },
        ],
      })
    ).toEqual({
      page: 2,
      page_size: 100,
      search: "acme",
      categories: [1, 3],
      sort: "az",
    });
  });

  it("omits empty search, categories, and sort", () => {
    expect(
      contactsTableQueryToListParams({
        page: 1,
        pageSize: 100,
        search: "   ",
        filterValues: [],
        sortRules: [],
      })
    ).toEqual({
      page: 1,
      page_size: 100,
    });
  });
});

describe("contact sort mappers", () => {
  it("maps table sort rules to az/za API values", () => {
    expect(
      tableSortRulesToContactSort([
        { columnKey: CONTACTS_NAME_SORT_COLUMN_KEY, direction: "desc" },
      ])
    ).toBe("za");
    expect(tableSortRulesToContactSort([])).toBeUndefined();
  });

  it("maps stored az/za values to table sort rules", () => {
    expect(contactSortToTableSortRules("az")).toEqual([
      { columnKey: CONTACTS_NAME_SORT_COLUMN_KEY, direction: "asc" },
    ]);
    expect(contactSortToTableSortRules(null)).toEqual([]);
  });
});
