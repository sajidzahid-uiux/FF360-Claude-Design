/**
 * Mock route definition for the "Sajid & Sons Contractors" dummy dataset.
 *
 * Each module under mocks/data/<key>.ts exports `routes: MockRoute[]`. The mock
 * adapter (mocks/mockApi.ts) tests each route's `match` against the NORMALIZED
 * request URL — protocol+host stripped, leading slashes removed, query string
 * dropped — e.g. an axios GET to
 *   `${API_URL}/ms/organizations/1/leads/repair/?page=1`
 * is matched as `ms/organizations/1/leads/repair/`.
 *
 *  - `list` (default true): `data` is an array of records; it is served wrapped
 *    in the array+pagination hybrid (listResponse) so it satisfies every list
 *    consumer pattern (`data.map`, `data.results`, `total_count` checks).
 *  - `list: false`: detail/object endpoint — `data` is served verbatim.
 *  - `methods` defaults to ["get"].
 */
export type MockRoute = {
  match: RegExp;
  methods?: string[];
  list?: boolean;
  data: unknown;
};
