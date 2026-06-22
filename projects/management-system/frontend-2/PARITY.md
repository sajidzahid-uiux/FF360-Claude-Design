# Frontend v1 ↔ v2 Parity

Classic CMS UI lives in `frontend/`; org-ui migration lives in `frontend-2/`. Layout and components differ; **API contracts, permissions, validations, and route behavior must match**.

## What must stay aligned

| Area                       | v1                                           | v2                            | Verified by                                                           |
| -------------------------- | -------------------------------------------- | ----------------------------- | --------------------------------------------------------------------- |
| Permission resources       | `hooks/permissions/constants.ts`             | same file                     | `shared/lib/parity/__tests__/sharedSourceParity.test.ts`              |
| Route → permission mapping | `useRoutePermissions` inline patterns        | `matchAppRoutePermission.ts`  | `v1V2RoutePermissionParity.test.ts`                                   |
| Org routes                 | `app/[orgId]/…`                              | `app/organizations/[orgId]/…` | `appRouteCoverage.test.ts`                                            |
| Legacy redirects           | `/org/*`, `/preferences`, numeric org prefix | `shared/config/routes.js`     | `legacyRedirectsParity.test.ts`                                       |
| Contact validation         | `contactFormSchema` + Zod                    | `contact-form-validation.ts`  | `contact-form-validation.test.ts`, `contactFieldLimitsParity.test.ts` |
| Job/lead routes            | per-type pages                               | `jobLeadRouteConfig`          | `jobLeadRouteParity.test.ts`                                          |
| Payload builders           | `features/*/lib/*Payload.ts`                 | mirrored paths                | `sharedSourceParity.test.ts`                                          |
| Sidebar/nav gating         | `Sidebar.tsx`                                | `cmsNavigation.ts`            | `cmsNavigation.test.ts`                                               |
| Domain permission rules    | inline in hooks                              | `permissionRules.ts`          | `domainPermissions.test.ts`                                           |

## Running parity tests

From `frontend-2/`:

```bash
npm test -- shared/lib/parity features/job-lead/model/__tests__/jobLeadRouteParity.test.ts
npm test
```

## Adding a new org route

1. Add `app/organizations/[orgId]/…/page.tsx` (thin wrapper → `*PageContent` or lazy job-lead route).
2. Register in `shared/lib/parity/appRouteRegistry.ts`.
3. If permission-gated, extend `hooks/permissions/matchAppRoutePermission.ts` and add a row to `v1V2RouteMap.ts` when v1 had an equivalent path.
4. Run `npm test -- shared/lib/parity`.

## Intentional v2 differences

- **Route prefix:** `/organizations/[orgId]` (+ legacy numeric redirects).
- **Settings layout:** `/settings/org/*` and `/settings/user/*` instead of scattered `/org/*` and `/user/*`.
- **FF360 design parameters:** v2-only settings route.
- **Extra permission mappings:** org info, billing, role-access (v2 maps them; v1 `useRoutePermissions` returned `null`).

## Not covered by unit tests (manual / future E2E)

Run Playwright smoke tests (top 10 flows + contact validation modal):

```bash
cd frontend-2
npm install
npm run test:e2e:install
E2E_ORG_ID=123 E2E_ACCESS_TOKEN=<jwt> npm run test:e2e
# or: E2E_EMAIL=... E2E_PASSWORD=... npm run test:e2e
```

Unit coverage added for:

- Contact backend rejection rules — `features/contacts/lib/__tests__/contact-form-validation.test.ts`
- Equipment forms — `features/equipment/lib/__tests__/equipment-form-validation.test.ts`
- Order pipe wizard items — `features/order-pipe/order-pipe-wizard/lib/__tests__/order-pipe-item-validation.test.ts`
- Route map integrity — `shared/lib/parity/__tests__/v1V2RouteMapIntegrity.test.ts`

When fixing a v2 route/permission bug: add a pair to `shared/lib/parity/v1V2RouteMap.ts` and extend `v1V2RoutePermissionParity.test.ts` or `v1V2RouteMapIntegrity.test.ts`.

Still manual / future E2E depth:

- Full CRUD against a live backend for every entity
- Org-ui table/kanban interactions vs classic DataTable
- Stripe billing and Auth0 redirects in a browser

Use the dev version switcher (`shared/lib/cmsVersionSwitcher.ts`) to compare the same org in v1 and v2 side by side.

## Shared modules that must not drift

Listed in `shared/lib/parity/sharedSourceParity.ts`. When changing validation or payload logic, update **both** frontends or keep hashes equal.
