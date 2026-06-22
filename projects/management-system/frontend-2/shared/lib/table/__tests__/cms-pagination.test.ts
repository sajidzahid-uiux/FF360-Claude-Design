import type { TableServerPaginationMeta } from "@fieldflow360/org-ui";
import { describe, expect, it } from "vitest";

import {
  CMS_TABLE_QUERY_DEFAULT_SLICE,
  cmsFilterStateToTableFilterValues,
  cmsTableQueryToApiParams,
  createCmsTableStateKey,
  mapCmsPaginationMeta,
  mapPaginatedResponseMeta,
  tableFilterValuesToCmsFilterState,
  useCmsTableQueryStore,
} from "@/shared/lib/table";

describe("mapCmsPaginationMeta", () => {
  it("maps snake_case API pagination", () => {
    expect(
      mapCmsPaginationMeta({
        total_count: 240,
        total_pages: 3,
        current_page: 2,
        page_size: 100,
      })
    ).toEqual({
      totalCount: 240,
      totalPages: 3,
      currentPage: 2,
      pageSize: 100,
    } satisfies TableServerPaginationMeta);
  });

  it("maps camelCase hook pagination", () => {
    expect(
      mapCmsPaginationMeta({
        totalCount: 12,
        totalPages: 1,
        currentPage: 1,
        pageSize: 100,
      })
    ).toEqual({
      totalCount: 12,
      totalPages: 1,
      currentPage: 1,
      pageSize: 100,
    });
  });

  it("returns null for empty input", () => {
    expect(mapCmsPaginationMeta(null)).toBeNull();
    expect(mapPaginatedResponseMeta(undefined)).toBeNull();
  });
});

describe("createCmsTableStateKey", () => {
  it("builds table keys from pathname, org, and tab", () => {
    expect(
      createCmsTableStateKey({
        pathname: "/organizations/1/contact",
        orgId: 1,
        tabKey: "active",
      })
    ).toBe("table_organizations-1-contact_tab_active_org_1");
  });
});

describe("useCmsTableQueryStore", () => {
  it("stores page, search, filters, and sort per table key", () => {
    const tableKey = "table_test_org_1";

    useCmsTableQueryStore.getState().resetSlice(tableKey);

    useCmsTableQueryStore.getState().setCurrentPage(tableKey, 3);
    expect(
      useCmsTableQueryStore.getState().getSlice(tableKey).currentPage
    ).toBe(3);

    useCmsTableQueryStore.getState().setSearch(tableKey, "acme");
    const afterSearch = useCmsTableQueryStore.getState().getSlice(tableKey);
    expect(afterSearch.search).toBe("acme");
    expect(afterSearch.currentPage).toBe(1);

    useCmsTableQueryStore
      .getState()
      .setFilterValues(tableKey, [{ filterId: "status", values: ["active"] }]);
    expect(
      useCmsTableQueryStore.getState().getSlice(tableKey).filterValues
    ).toEqual([{ filterId: "status", values: ["active"] }]);

    useCmsTableQueryStore.getState().resetSlice(tableKey);
    expect(useCmsTableQueryStore.getState().getSlice(tableKey)).toEqual(
      CMS_TABLE_QUERY_DEFAULT_SLICE
    );
  });
});

describe("cms filter mapper", () => {
  it("maps filter state to table filter values and back", () => {
    const filterState = {
      contact_categories: ["1", "2"],
      ignored_date_range: { startValue: "2024-01-01", endValue: "2024-02-01" },
    };

    const tableValues = cmsFilterStateToTableFilterValues(filterState, {
      contact_categories: "categories",
    });

    expect(tableValues).toEqual([
      { filterId: "categories", values: ["1", "2"] },
    ]);

    expect(
      tableFilterValuesToCmsFilterState(tableValues, {
        contact_categories: "categories",
      })
    ).toEqual({
      contact_categories: ["1", "2"],
    });
  });
});

describe("cmsTableQueryToApiParams", () => {
  it("serializes page, search, ordering, and filter map", () => {
    expect(
      cmsTableQueryToApiParams(
        {
          page: 2,
          pageSize: 100,
          search: "  acme ",
          filterValues: [{ filterId: "categories", values: ["1", "3"] }],
          sortRules: [{ columnKey: "name", direction: "desc" }],
        },
        { filterParamMap: { categories: "categories" } }
      )
    ).toEqual({
      page: 2,
      page_size: 100,
      search: "acme",
      ordering: ["-name"],
      categories: ["1", "3"],
    });
  });
});
