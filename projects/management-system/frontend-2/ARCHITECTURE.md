# Frontend Architecture (Feature-Sliced Design)

This app follows [Feature-Sliced Design (FSD)](https://feature-sliced.design/) with Next.js App Router.

## Layers (top → bottom)

| Layer        | Path        | Responsibility                                         |
| ------------ | ----------- | ------------------------------------------------------ |
| **app**      | `app/`      | Routes, layouts, providers wired to pages only         |
| **widgets**  | `widgets/`  | Composite UI blocks (e.g. calendar board)              |
| **features** | `features/` | User scenarios: forms, tables, mutations, page content |
| **entities** | `entities/` | Business nouns: models, entity UI primitives           |
| **shared**   | `shared/`   | UI kit, lib, API-agnostic utilities                    |
| **api**      | `api/`      | HTTP client, endpoints, services (no React)            |

Supporting cross-cutting folders (legacy, migrate into layers):

- `hooks/` — global hooks; domain-specific hooks live in `features/*/hooks/` (re-exported here)
  - `hooks/lib/` — cross-cutting utilities (`useRouteIds`, `useDialogManager`, storage)
  - `hooks/org/`, `hooks/auth/`, `hooks/billing/`, `hooks/team/`, `hooks/leads/`, `hooks/map/`
  - `hooks/queries/`, `hooks/mutations/`, `hooks/permissions/`
- `constants/` — env and domain constants
- `utils/` — legacy root helpers (`apiError`, `kml.utils`, `actions/`); see [`lib` vs `utils`](#lib-vs-utils)
- `lib/` (repo root) — small app-level helpers (`cms-theme`, `geo`); prefer `shared/lib` for new code

**Do not create a top-level `stores/` folder.** All stores belong inside a layer slice (see [Where to put state](#where-to-put-state-stores)).

Deprecated import paths (removed — use canonical paths):

- `@/shared/ui/primitives/*` (was `@/components/ui/*`)
- `@/shared/ui/common/*` (was `@/components/common/*`)
- `@/shared/ui/layout/*` (was `@/components/layout/*`)
- `@/features/forms/ui/*` (was `@/components/forms/*`)
- `@/stores/*` (was root stores — use `@/shared/model/*` or `features/*/model/*`)
- `@/contexts/auth-context` → `@/features/auth/hooks/useAuth`, `@/features/auth/ui/AuthSync`
- `@/contexts/OnlineMembersContext` → `@/features/messaging/model/online-members-store`, `@/features/messaging/ui/OnlineMembersSync`
- `@/contexts/ChatBotContext` → `@/shared/model/chat-bot-store`, `@/shared/ui/common/ChatBotSync`
- `@/contexts/JobAssignedToFilterContext` → `@/features/jobs/hooks/useJobAssignedToFilter`, `@/features/jobs/ui/JobAssignedToFilterSync`

## v1 ↔ v2 parity tests

See `PARITY.md`. Co-located under `shared/lib/parity/__tests__/` — route registry, permission mapping vs classic frontend, shared validation/payload modules, and job-lead route config.

## FSD glossary

Terms used throughout this repo (from [Feature-Sliced Design](https://feature-sliced.design/)):

| Term                | Meaning                                                                                                                                                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Layer**           | Top-level folder with a fixed role and import direction: `app` → `widgets` → `features` → `entities` → `shared` → `api`. Lower layers never import higher layers.                                                         |
| **Slice**           | One folder inside a layer — a bounded unit of code. Examples: `features/contacts`, `entities/job`, `widgets/calendar-board`, `shared/lib/table`.                                                                          |
| **Segment**         | Subfolder inside a slice that groups code by technical role. Common segments: `ui/`, `model/`, `lib/`, `api/`, `hooks/`.                                                                                                  |
| **Public API**      | A slice’s `index.ts` (or explicit deep exports). Other slices should import from here when possible, not from internal files.                                                                                             |
| **Feature**         | A **user scenario** or page-level capability: something a user _does_ (“manage contacts”, “order pipe”, “completed jobs”). Lives in `features/<name>/`. Usually owns routes, tables, dialogs, mutations, and page stores. |
| **Entity**          | A **business noun** reused in many places: Job, Contact, Equipment. Lives in `entities/<noun>/`. Mostly display pieces and small helpers — not full pages or wizards.                                                     |
| **Widget**          | A **large composed block** on a screen, built from several features/entities, not owned by a single route. Example: `widgets/calendar-board`.                                                                             |
| **Shared**          | **Domain-agnostic** building blocks: UI kit, table shell, theme, dialog manager, cross-feature normalizers. Lives in `shared/`.                                                                                           |
| **App**             | Next.js **routing shell** only: `page.tsx`, `layout.tsx`, lazy imports into features. No business UI in route files.                                                                                                      |
| **Scenario**        | Same idea as **feature** — a flow the user performs.                                                                                                                                                                      |
| **Business entity** | Same idea as **entity** — a stable domain object with an identity.                                                                                                                                                        |

**Rule of thumb:** noun → **entity**; verb/scenario → **feature**; big composed section → **widget**; generic → **shared**; route wiring → **app**.

### Layer vs slice vs segment (example)

```
features/contacts/          ← slice (feature “contacts”)
  index.ts                  ← public API
  ui/                       ← segment: React components
    ContactsPageContent.tsx
  model/                    ← segment: stores, types
    contacts-page-store.ts
  lib/                      ← segment: pure helpers for this feature only
    contactTableRows.ts
  hooks/                    ← segment (optional): feature-only hooks
```

Same pattern applies to `entities/job/`, `widgets/calendar-board/`, and `shared/lib/table/`.

## `lib` vs `utils`

Both hold **non-React, mostly pure functions**. The difference is **where they live and who owns them**.

|                      | **`lib/`** (preferred)                                                                               | **`utils/`** (legacy)                                                                       |
| -------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Ownership**        | Belongs to a **slice** or **shared domain** — clear boundary                                         | Root `utils/` is a **global grab bag** with no slice owner                                  |
| **Domain knowledge** | Slice `lib/` may know about jobs, contacts, etc. `shared/lib/<domain>/` may know shared domain rules | Root `utils/` should stay **domain-agnostic** (formatting, HTTP errors, file download)      |
| **Typical location** | `features/<slice>/lib/`, `entities/<slice>/lib/`, `shared/lib/`, `hooks/lib/`                        | `utils/` at repo root; some features still have `features/<slice>/utils/` from older layout |
| **New code**         | **Yes** — default for helpers                                                                        | **Avoid** — only add here if the helper is truly generic and used everywhere                |
| **Tests**            | Next to the module under `__tests__/` in the same slice                                              | `utils/__tests__/`                                                                          |

### Where each `lib` folder goes

| Path                    | Put code here when…                                                 | Examples                                                            |
| ----------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `features/<slice>/lib/` | Used **only inside that feature** (one page/flow)                   | Column builders, page-specific mappers, validation for one wizard   |
| `entities/<slice>/lib/` | Logic for **one business noun**, reused by features                 | Format entity title, route helper for calendar item                 |
| `shared/lib/<domain>/`  | **Multiple features** or **`api/`** need the same normalizer/parser | `shared/lib/job-time-entries/`, `shared/lib/parity/`                |
| `shared/lib/` (root)    | Cross-cutting, not tied to one domain folder                        | `parseEntityId`, `bulkConfirmationCopy`, table helpers              |
| `hooks/lib/`            | Small utilities **for hooks** (not hooks themselves)                | `useRouteIds`, `useDialogManager`, storage helpers                  |
| `lib/` (repo root)      | Rare **app-level** infra (legacy/small)                             | `cms-theme`, `geo`, `server-env` — prefer `shared/lib` for new code |

### Where `utils/` is used today

| Path                      | Role                                                                                                                             |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `utils/` (repo root)      | Legacy shared helpers: `apiError`, `kml.utils`, `actions/`, `persistentStorage`, generic validation                              |
| `features/<slice>/utils/` | Older feature helpers not yet moved to `lib/` (e.g. `features/dashboard/utils/`, `features/order-pipe/order-pipe-wizard/utils/`) |
| `api/utils/`              | Parsers used only by API layer                                                                                                   |

### Decision guide

1. **Only one feature needs it?** → `features/<slice>/lib/`
2. **Several features or `api/services` need it?** → `shared/lib/<domain>/`
3. **Tied to one entity display/model?** → `entities/<slice>/lib/`
4. **Supports hook infrastructure?** → `hooks/lib/`
5. **Truly generic, no domain, and you would have put it in npm `lodash`-style?** → `shared/lib/` first; root `utils/` only if matching existing patterns (`apiError`, file IO)

**Do not** put React components, hooks, or Zustand stores in `lib/` or `utils/` — those belong in `ui/`, `hooks/`, or `model/`.

## How to choose layer: feature vs entity vs widget

Use this order:

1. **Entity** — Is it a **business noun** with a stable identity, shown in many places, mostly presentation + small helpers?
   - Examples: `JobStatusCell`, `ContactNumberRow`, `EquipmentStatusBadge`
   - Path: `entities/<noun>/ui/`, `entities/<noun>/model/`
   - Not an entity if it orchestrates a full page, mutations, or multi-step UX.

2. **Feature** — Is it a **user scenario** or **page-level behavior** (table + filters + dialogs + API)?
   - Examples: contacts list, order-pipe wizard, completed jobs page, messaging
   - Path: `features/<scenario>/ui/`, `features/<scenario>/model/`, `features/<scenario>/lib/`
   - One route ≈ one feature slice (or a small group of related routes).

3. **Widget** — Is it a **large composite block** used on a page but not tied to one route, built from several features/entities?
   - Examples: calendar board, dashboard sections that combine multiple domains
   - Path: `widgets/<name>/`

4. **Shared** — Is it **domain-agnostic** (UI kit, table shell, theme, dialog manager)?
   - Path: `shared/ui/`, `shared/lib/`, `shared/model/`

5. **App** — Route wiring only: `page.tsx`, `layout.tsx`, providers that connect layers.

## Where to put code (segments)

### UI components (`ui/`)

| Location               | When                                                                                      |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| `features/<slice>/ui/` | Page content, feature-specific dialogs, tables wired to that scenario                     |
| `entities/<slice>/ui/` | Reusable display/action pieces for one business noun (card cell, badge, row)              |
| `widgets/<slice>/ui/`  | Composition of multiple features/entities for one screen area                             |
| `shared/ui/`           | Design-system wrappers, layout shells, org-ui adapters (`OrgUiDataTable`, `PageRenderer`) |

Route files in `app/` stay thin; page UI lives in `features/*/ui/*PageContent.tsx`.

### Utilities (`lib/` and `utils/`)

See [`lib` vs `utils`](#lib-vs-utils) for the full comparison. Short version:

| Location                | When                                                                          |
| ----------------------- | ----------------------------------------------------------------------------- |
| `features/<slice>/lib/` | Helpers used only inside that feature (column builders, mappers for one page) |
| `entities/<slice>/lib/` | Pure logic for one entity (format job title, normalize contact)               |
| `shared/lib/<domain>/`  | Normalizers and parsers used by **api** or **multiple features** (no React)   |
| `hooks/lib/`            | Utilities consumed by hooks (`useRouteIds`, dialog manager wiring)            |
| `utils/` (root)         | Legacy generic helpers — prefer `shared/lib` or slice `lib/` for new code     |

**Forbidden:** `api/services/*` importing `features/*`. Put shared normalizers in `shared/lib/`.

### State (stores)

| Location                            | When                                                             | Examples                                                                                |
| ----------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `features/<slice>/model/*-store.ts` | UI state for **one feature/page** (tabs, selection, wizard step) | `contacts-page-store`, `completed-page-store`, `order-pipe-wizard-store`                |
| `entities/<slice>/model/`           | Entity-scoped client state reused by several features (rare)     | —                                                                                       |
| `shared/model/*-store.ts`           | **App-wide** or **shell** state used across layers/features      | `dialog-manager-store`, `sidebar-store`, `user-settings-store`, `cms-table-query-store` |
| Slice UI subfolder                  | Store tightly coupled to one component tree                      | `shared/ui/layout/cms-breadcrumb-toolbar/breadcrumb-toolbar-store.ts`                   |

**Do not use** root `stores/`. If `shared/` needs the state (e.g. `ThemeProvider`), the store **must** live in `shared/model/`, not in `features/user-settings/model/`.

Store conventions:

- File: `kebab-case-store.ts` or `<page>-store.ts`
- Export store + selector hooks (`useXStore`, `useXActions`, `useShallow` for objects)
- Colocate types in the same file or slice `model/types.ts`
- Prefer feature stores over prop drilling; keep server data in React Query, not Zustand

### Sync components (side effects → store)

When state needs **React lifecycle** (Auth0, WebSocket, URL sync) but consumers should read **Zustand**:

| Pattern                | Store                                                 | Sync component                                 |
| ---------------------- | ----------------------------------------------------- | ---------------------------------------------- |
| Auth session + org     | `features/auth/model/auth-store.ts`                   | `features/auth/ui/AuthSync.tsx`                |
| Imperative auth APIs   | `features/auth/model/auth-actions.ts`                 | registered in `AuthSync`                       |
| Online members WS      | `features/messaging/model/online-members-store.ts`    | `features/messaging/ui/OnlineMembersSync.tsx`  |
| Chat bot WS            | `shared/model/chat-bot-store.ts`                      | `shared/ui/common/ChatBotSync.tsx`             |
| Job assigned-to filter | `features/jobs/model/job-assigned-to-filter-store.ts` | `features/jobs/ui/JobAssignedToFilterSync.tsx` |

Mount `*Sync` once in a layout/provider; use store hooks (`useAuth`, `useOnlineMembers`, `useChatBotUi`) in UI.

### API

| Location                | When                                                                         |
| ----------------------- | ---------------------------------------------------------------------------- |
| `api/`                  | HTTP client, endpoints, services (no React)                                  |
| `features/<slice>/api/` | Optional slice-specific fetch helpers (still no imports from other features) |

### Hooks

| Location                                | When                                              |
| --------------------------------------- | ------------------------------------------------- |
| `features/<slice>/hooks/` or next to UI | Feature-only hooks                                |
| `entities/<slice>/hooks/`               | Entity-only hooks                                 |
| `hooks/queries/`, `hooks/mutations/`    | React Query wrappers (legacy central location)    |
| `hooks/lib/`                            | Cross-cutting (`useRouteIds`, `useDialogManager`) |

## Slice structure

Each feature/entity/widget slice uses segments:

```
features/<slice>/
  index.ts          # public API
  ui/               # React components
  model/            # stores, types, constants for the slice
  lib/              # pure helpers
  api/              # slice-specific API (optional)
  hooks/            # optional; may live under ui/ for local hooks
```

**Naming:**

- Components: `PascalCase.tsx` (`CategoryDialog`, `MessagesPageContent`)
- Composite UI folders: parent component in `index.tsx`; siblings (`types.ts`, `hooks/`, `tabs/`) stay alongside
- Public named exports for a folder: `exports.ts` when `index.tsx` is the default component
- Hooks: `useCamelCase.ts`
- Stores: `<scope>-store.ts` in `model/`
- Lib helpers: `camelCase.ts` or `kebab-case.ts` matching repo neighbors
- No British spellings in component names (`Dialog`, not `Dialogue`)

**Public API:** Import from `@/features/<slice>` or deep paths within the same slice. Avoid cross-feature deep imports when a public export exists.

## Import rules

```
app       → widgets, features, entities, shared, api, hooks, constants, utils
widgets   → features, entities, shared, api
features  → entities, shared, api, hooks, constants, utils
entities  → shared, api
shared    → api (types only where needed), utils
api       → shared/lib only (never features, app, components)
```

**Forbidden:**

- `features` → `app`
- `api` → `features`
- `shared` → `features` or `app`
- `entities` → `features`

Enforced via ESLint `import/no-restricted-paths` (warn).

## App router

`app/**/page.tsx` must stay thin:

```tsx
const PageContent = createLazyRoutePage(
  () => import("@/features/foo/ui/FooPageContent")
);
export default function Page() {
  return <PageContent />;
}
```

Page UI lives in `features/<slice>/ui/`. Route-only providers stay in `app/**/layout.tsx`.

## Reference slices

### Entities

- `entities/calendar-item/` — entity model + UI
- `entities/job/` — `JobTableRow`, `JobStatusCell`
- `entities/contact/` — `ContactNumberRow`, `StakeholderHeaderBadges`
- `entities/equipment/` — `EquipmentStatusBadge`

### Features

- `features/messaging/` — full page feature (ui + lib + hooks + `model/messages-page-store`)
- `features/contacts/` — forms, tables, dialogs + `model/contacts-page-store`
- `features/equipment/` — list, detail + `model/equipment-page-store`
- `features/order-pipe/` — `model/order-pipe-wizard-store`
- `features/completed/` — `model/completed-page-store`
- `features/job-lead/` — ShowMore card + `model/show-more-card-store`

### Shared model (global stores)

- `shared/model/dialog-manager-store.ts` — global dialogs
- `shared/model/sidebar-store.ts` — shell sidebar
- `shared/model/user-settings-store.ts` — theme/accent (used by `ThemeProvider`)
- `shared/model/user-store.ts` — trial subscription snapshot
- `shared/model/cms-table-query-store.ts` — table pagination/filter slices

### Widgets

- `widgets/calendar-board/` — widget composition

## API normalization

Response normalizers belong in `shared/lib/<domain>/`, not in `features/`, so `api/services/*` never imports features.

Examples:

- `shared/lib/job-time-entries/normalizeJobTimeEntriesPage.ts`
- `shared/lib/footage/parseCrewFilterSelections.ts`

## Error handling

Use `@/utils/apiError` for `getErrorMessage`, `isApiForbiddenError`, `extractApiErrorPayload`.  
`@/features/forms` re-exports these plus form-specific helpers (`getApiFieldErrorMessages`, Zod mappers).

## Checklist for new code

1. Pick **layer** (entity / feature / widget / shared / app).
2. Pick **segment** (`ui`, `model`, `lib`, `api`).
3. Add exports to slice `index.ts` if others need it.
4. Confirm imports respect layer rules (no `shared` → `features`).
5. Page route → `features/*/ui/*PageContent.tsx`; state → `features/*/model/*-store.ts` unless shell-wide → `shared/model/`.

## Migration backlog

1. ~~Move `app/**/PageContent.tsx` into matching `features/*/ui/`~~ ✓
2. ~~Move domain table columns from `shared/columns/*` into feature `lib/columns/`~~ ✓ (org-ui + common stay in `shared/lib/table/`)
3. ~~Move `ShowMoreCard` into `features/job-lead/ui/show-more-card/`~~ ✓
4. ~~Collapse remaining `components/` into `shared/ui` or feature slices~~ ✓
5. ~~Colocate `hooks/*` that serve a single feature~~ ✓
6. ~~Extract entities from large features (job, contact, equipment)~~ ✓
7. ~~Remove root `stores/`; colocate in `shared/model` or `features/*/model`~~ ✓

## Post-migration

- ESLint warns on `@/components/*` imports (`no-restricted-imports`)
- ESLint warns on FSD layer violations (`import/no-restricted-paths`)
- Optional: remove `tsconfig` `@/components/*` path aliases once stable
