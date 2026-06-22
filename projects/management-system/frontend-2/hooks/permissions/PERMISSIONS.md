# Permissions (frontend-2)

This document describes the client-side permission system in `frontend-2`, aligned with **`frontend/` (v1)**. Both apps consume the same backend model: org-scoped `permission_codes` in the shape `{resource}_{read|write|delete}`.

## Data flow

```
Auth + org selection
  → PermissionsService.getMyPermissions(orgId)
  → localStorage: userPermissions, userPermissionCodes, userRole
  → hooks read storage and/or live React Query data
  → UI gates (PermissionCodeGate, domain hooks, sidebar)
```

**Storage keys** (`hooks/storage-data/constants.ts`):

| Key                   | Purpose                                                         |
| --------------------- | --------------------------------------------------------------- |
| `userPermissionCodes` | Flat list of codes (+ pseudo-codes `is_admin`, `is_bookkeeper`) |
| `userRole`            | Role object (`name`, `is_admin`, …)                             |
| `userPermissions`     | Full API response cache                                         |

**Precedence:** `useHasPermission` prefers live API codes over cache (`hooks/queries/useUserPermissions.ts`).

## Code format

- Pattern: `{resource}_{read|write|delete}` (validated by `isValidPermissionCode`)
- Resources: `hooks/permissions/constants.ts` → `PERMISSION_RESOURCES`
- Typed subset: `constants/enums.ts` → `PermissionCode`

Legacy codes such as `equipment_read` match the format regex but are **not** in `PERMISSION_RESOURCES` and are ignored by `parsePermissionCodes` and equipment helpers.

## Core modules

| Module                         | Role                                                      |
| ------------------------------ | --------------------------------------------------------- |
| `parsePermissionCodes.ts`      | Codes → `{ [resource]: { read, write, delete } }`         |
| `permissionRules.ts`           | **Pure rules** shared by hooks and tests (parity with v1) |
| `matchAppRoutePermission.ts`   | URL → resource (v2 org prefix + legacy `/:id/` paths)     |
| `usePermissionsFromStorage.ts` | Read codes from localStorage                              |
| `useRoutePermissions.ts`       | Current route read/write/delete                           |

## Domain hooks → rules

All CRUD hooks delegate to `permissionRules.ts` (same semantics as v1).

| Hook                                   | Resource                              | Flags                                                  |
| -------------------------------------- | ------------------------------------- | ------------------------------------------------------ |
| `useJobPermissions(jobType)`           | `{type}_page` + `{type}_edit_status`  | read, add/edit (=write), delete, editStatus            |
| `useJobCrewPermissions(jobType)`       | `{type}_crew_management`              | canManageCrew (=write)                                 |
| `useContactPermissions()`              | `contact_access`                      | read, add, delete                                      |
| `useFarmPermissions()`                 | `contact_farm_tab`                    | read, add, edit, delete                                |
| `useSettingsPermissions()`             | `settings_page`                       | read, add, delete                                      |
| `useOrderPipePermissions()`            | `order_pipes_list`                    | read, write, delete                                    |
| `useTodoPermission()`                  | `todo_list` + `todo_list_edit_status` | read, edit, delete, editStatus, isAdmin                |
| `useEquipmentPermissions()`            | `equipment_page`                      | Admin bypass + page + comment rules                    |
| `useOrganizationSettingsPermissions()` | `team_organization_info`              | view, edit, delete                                     |
| `useDashboardPermissions()`            | All resources with `_read`            | Job/leads/equipment/completed flags + roles            |
| `useCompletedJobPermissions()`         | Route + job type                      | **AND** page + job-type per action                     |
| `useCanEditTerminalJobScheduling()`    | CO&CA write + job page write          | Admin OR both codes                                    |
| `useCalendarEntityPermissions()`       | Per calendar item resource            | View = read; terminal schedule = CO&CA + job write     |
| `useJobProgressPermissions()`          | Job payload + job page                | Admin / on-site assignment / tiling read-write         |
| `useDesignRequestAccess()`             | TD integration + route                | Admin or write to submit; view if submit or route read |

### Job tab permissions (`useJobTabPermissions.ts`)

Estimate/financial tabs use `useHasPermission` with:

- `jobs_excavation_estimate_financial_{read|write}`
- `jobs_tiling_estimate_financial_{read|write}`

Returns `false` while loading (v1 parity).

## Combined / special rules

### Completed & Canceled page

- **Page access:** `completed_canceled_page` read **and** at least one job-type read.
- **Row actions:** `getJobPermissions(subclass)` = page permission **AND** job-type permission for each flag.
- **Comments on terminal jobs:** `canAddCommentsOnTerminalJob` — job write required; on CO&CA jobs also requires `completed_canceled_page_write`.
- **Terminal scheduling edit:** Admin OR (`completed_canceled_page_write` + `{jobType}_page_write`).

### Notes (`utils/notes.ts`)

- **General:** requires page write unless `commentsReadOnly === false`.
- **Office:** write allowed without page write (bookkeeper).
- **On-site:** allowed with tab access or `assignedToJob`.
- **CO&CA:** `commentsReadOnly: true` blocks general notes.

### Equipment on jobs

`features/jobs/lib/jobEquipmentPermissions.ts` → `getJobEquipmentPermissionCodes(jobType)` maps to page read + equipment management write/delete (same as v1 `equipmentPermissions.ts`).

### Owner protection (`utils/ownerProtection.ts`)

Not RBAC codes — blocks role change and profile edit for org owners, removed/inactive members.

### Major roles (`useMajorRoleAccess`)

v1 sidebar `MAJOR_ROLES` parity: Admin, PM, Bookkeeper, Viewer, Crew, Owner → upkeep / industry specialists nav.

## UI gates

| Component               | Behavior                                      |
| ----------------------- | --------------------------------------------- |
| `PermissionCodeGate`    | Renders children if `useHasPermission` passes |
| `JobPagePermissionGate` | Job-type page read + `AccessDeniedView`       |
| `MajorRoleGate`         | Major role check + denied view                |
| `AccessDeniedView`      | Static denied page                            |

Forms: `components/forms/utils/permissions.ts` — `checkFieldPermissions` / `checkSectionPermissions` (default hide without read, disable without write).

## Navigation (`components/layout/cmsNavigation.tsx`)

Derived from resource list + role (see `deriveCmsNavigationPermissions`, tested in `cmsNavigation.test.ts`):

- Resource `_read` → show nav item
- **Book Keeping:** Admin or Bookkeeper role
- **Pending Approval / Quick Actions:** Admin only
- **Equipment (upkeep):** major role + equipment access
- **Calendar:** any leads or job access

Route mapping includes **legacy v1 paths** (`/org/trash`, `/99/jobs/repair`, …) via `LEGACY_APP_ROUTES` and `normalizeAppPathname`.

## Role editor warnings

`getSectionWarnings` (same as v1):

- **Completed & Canceled:** CO&CA read needs a job read; CO&CA write/delete needs job read + edit status write for at least one type.
- **Trash:** trash read warns if leads/jobs/equipment read missing.

## Admin / bookkeeper pseudo-codes

| Source               | Injected codes                     |
| -------------------- | ---------------------------------- |
| `useUserPermissions` | `is_admin` when role name is Admin |
| `auth-context`       | `is_admin`, `is_bookkeeper`        |

Dashboard and todo also check role **name** (`Admin`, `Bookkeeper`). `useIsAdmin` checks `role.is_admin`, role name, and cached/auth role.

## v1 vs v2 differences

| Area              | v1                        | v2                                          |
| ----------------- | ------------------------- | ------------------------------------------- |
| Route prefix      | `/[orgId]/…` inline regex | `/organizations/[orgId]/…` + legacy aliases |
| Route config      | In `useRoutePermissions`  | `matchAppRoutePermission.ts` + `APP_ROUTES` |
| Pure rules        | Inline in hooks           | Centralized `permissionRules.ts`            |
| Major roles       | Sidebar only              | `useMajorRoleAccess` + `MajorRoleGate`      |
| Org settings hook | Inline in pages           | `useOrganizationSettingsPermissions`        |
| Design requests   | N/A                       | `useDesignRequestAccess`                    |

**Behavior intentionally matched:** resource constants, CRUD mapping, CO&CA AND logic, terminal comment/scheduling rules, notes, equipment codes, sidebar gating, role editor warnings.

## Test coverage

| Area                          | Test file                                                                                 |
| ----------------------------- | ----------------------------------------------------------------------------------------- |
| Pure rules (all domain hooks) | `hooks/permissions/__tests__/permissionRules.test.ts`, `domainPermissions.test.ts`        |
| Route → resource              | `hooks/permissions/__tests__/matchAppRoutePermission.test.ts`                             |
| Code parsing                  | `hooks/permissions/__tests__/parsePermissionCodes.test.ts`                                |
| Equipment page/comments       | `hooks/permissions/__tests__/useEquipmentPermissions.test.ts`                             |
| Notes                         | `utils/__tests__/notes.test.ts`                                                           |
| Owner protection              | `utils/__tests__/ownerProtection.test.ts`                                                 |
| CO&CA comments                | `features/completed/lib/__tests__/resolveCommentsReadOnly.test.ts`                        |
| Form fields                   | `components/forms/utils/__tests__/permissions.test.ts`                                    |
| Sidebar nav                   | `components/layout/__tests__/cmsNavigation.test.ts`                                       |
| Role editor                   | `features/team-management/.../getSectionWarnings.test.ts`, `hasPermissionChanged.test.ts` |
| Code format                   | `utils/validation/__tests__/securityValidation.test.ts`                                   |
| Major roles                   | `shared/lib/roles/__tests__/isMajorRoleName.test.ts`                                      |

Run: `npm test` from `frontend-2/`.

## Adding a new permission

1. Add resource to backend + `PERMISSION_RESOURCES` (and `PermissionCode` if used in gates).
2. Add rule in `permissionRules.ts` if non-trivial.
3. Add hook or extend existing hook; wire UI gate.
4. Add route pattern in `matchAppRoutePermission.ts` if page-scoped.
5. Update `permissions-config.ts` for role editor.
6. Add tests in `permissionRules` / `domainPermissions` / route tests.
7. Update this document.
