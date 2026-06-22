# FieldFlow360 — Frontend (Next.js)

Multi-tenant field service management SaaS — Next.js 16 frontend in a monorepo with a Django backend.

## Project Structure

```
management-system/
├── frontend/          # Next.js 16 (App Router, Turbopack) ← you are here
├── backend/           # Django 4.2 + DRF + Daphne (ASGI)
├── infrastructure/    # Terraform (ECS, S3, RDS, etc.)
├── docker-compose.yml # Local dev stack (backend, db, redis, celery)
└── .github/workflows/ # CI/CD pipelines
```

## Commands

```bash
npm install                    # Install dependencies
npm run dev                    # Dev server (Webpack) at http://localhost:3000
npm run dev:turbo              # Dev server (Turbopack) at http://localhost:3000
npm run dev:clean              # Delete .next cache, then start Webpack dev server
npm run build                  # Production build (standalone output)
npm run lint                   # ESLint check (no writes)
npm run lint:fix               # ESLint autofix (unused imports, jsx-sort-props, etc.)
npm run format                 # Prettier format all files
npm run format:check           # Prettier check only
npm test                       # Vitest (unit tests)
npm run test:watch             # Vitest in watch mode
```

## Tech Stack

- **Framework:** Next.js 16 (App Router, Webpack dev) + React 19 + TypeScript 5.9 (strict)
- **UI:** shadcn/ui (New York style) + Radix UI primitives + Tailwind CSS 4
- **State:** TanStack React Query v5 (server), React Context (client)
- **Forms:** React Hook Form + Zod v4
- **Auth:** Auth0 (JWT in cookies, RS256 verification)
- **Icons:** lucide-react only
- **Charts:** Recharts
- **Analytics:** PostHog
- **Package Manager:** npm — do not use yarn or pnpm

## Code Conventions

- **TypeScript strict mode** — no `any` types, no `@ts-ignore`
- **Pages are thin wrappers** that delegate to feature components:

  ```tsx
  // app/organizations/[orgId]/dashboard/page.tsx
  import { Dashboard } from "@/features/dashboard";

  export default function DashboardPage() {
    return <Dashboard />;
  }
  ```

- **`app/` directory is routes only** — only `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, and server components belong in `app/`. Reusable UI, domain logic, and feature components live in `features/`, `components/`, or their own slices — never inside `app/`
- **One component per file**, PascalCase filenames (`JobCard.tsx`)
- **Hooks:** camelCase files (`useJobs.ts`), split into `hooks/queries/` (fetching) and `hooks/mutations/` (writes)
- **Import order** (enforced by Prettier plugin): React/Next → third-party → aliases → local
- **Unused vars:** prefix with `_` (ESLint rule)
- **Barrel exports:** avoid — import directly from source files
- **Max ~150 lines** per component file; extract to `features/` if larger
- **All hooks at the top** — declare every `useState`, `useRef`, `useMemo`, `useEffect`, and other hooks at the top of the component body, before any logic or handlers
- **No business logic in JSX** — extract conditional logic, transformations, and computations into helper functions or custom hooks
- **Prefer `useCallback` for handlers** — avoid inline callbacks like `onClick={() => ...}` unless trivial; memoize handlers that are passed as props
- **No `console.log` in components** — debug logs fire on every render, clutter the console, and may leak data in production. Remove them or move necessary logging into `useEffect` with proper dependencies
- **Remove all unused code** — dead variables, unused state declarations, and leftover functions must be cleaned up; they bloat the bundle and create noise during refactors
- **Split large components early** — when a component grows, break it into smaller presentational components, feature-specific components, or extracted hooks (`useSomething()`)

## API & Data Fetching

- **All endpoints** defined in `api/endpoints.ts` — single source of truth, never hardcode URLs
- **Service layer** in `api/services/` — static methods per domain (`JobsService`, `LeadsService`, etc.)
- **HTTP client:** `api/client.ts` (ApiClient class) — handles JWT injection, DOMPurify sanitization, error normalization
- **Legacy client:** `lib/axios.ts` exists for auth flows only — do not use for new code
- **React Query hooks** wrap services: queries in `hooks/queries/`, mutations in `hooks/mutations/`
- **Query defaults:** staleTime 1min, refetchInterval 2min, refetchOnWindowFocus disabled
- **Error handling:** Use `ApiError.getFieldErrors()` for form-level errors, `ApiError.getUserMessage()` for toasts
- **Backend API prefix:** `/ms/` (management), `/auth/`, `/chat/`, `/rag/`

## Auth & Permissions

- Auth0 handles login — never build custom login forms
- JWT stored in cookies via `lib/cookies.ts`, refreshed by `TokenRefreshProvider` at ~75% lifetime
- `AuthProvider` (context) exposes: user, org, token, role, permissions
- Gate features with `<PermissionCodeGate code="permission_code">` component
- All org-scoped routes live under `app/organizations/[orgId]/` — use `@/lib/auth-routes` (`orgScopedPath`, `AUTH_ROUTES`) for navigation

## Component & Styling Patterns

- **shadcn/ui first** — use existing components from `components/ui/` before building custom ones
- **Tailwind utility classes** — no CSS modules, no styled-components
- Use `cn()` from `@fieldflow360/org-ui` for conditional classes
- **CVA** (Class Variance Authority) for component variants
- **Icons:** lucide-react only — do not add other icon libraries
- **Forms:** Use `GenericForm` from `components/forms/` with Zod schemas for consistency
- **Charts:** Recharts for data visualization

## WebSockets

- `useWebSocket` hook for real-time features (chat, online members)
- WebSocket URL from `NEXT_PUBLIC_WS_URL` env var

## Testing (CMS frontend)

Vitest + Testing Library run from `frontend/`. **Pre-commit runs `npm test`**; commits are blocked if tests fail.

### Where to put tests

Co-locate tests in a `__tests__/` folder **next to the code under test** (not under `app/`):

```
frontend/
├── entities/<name>/lib/__tests__/     # pure domain helpers, mappers, date/grid logic
├── features/<name>/lib/__tests__/     # feature-specific helpers (filters, URL state parsers)
├── features/<name>/hooks/__tests__/   # hook logic when worth isolating (mock providers)
├── widgets/<name>/lib/__tests__/      # widget-level helpers only
└── shared/lib/__tests__/              # shared utilities
```

**Prefer unit tests** for pure functions (mappers, formatters, permission predicates, grid/timeline math). **Component tests** only when behavior is hard to cover via libs/hooks; mock Next.js/router and React Query as needed.

**Naming:** `*.test.ts` or `*.test.tsx` (e.g. `mapSchedulingItem.test.ts`).

**Do not** put tests in `app/`, `api/`, or `node_modules/`. Avoid a single global `tests/` dump — keep tests discoverable beside their module.

**Example (calendar):** `entities/calendar-item/lib/__tests__/gridDistribution.test.ts`

## Git Workflow

### Feature Branch Workflow

- **Branch from the active sprint release branch** — do **not** branch feature/bugfix work off `dev` during an active sprint. Use `release/sprint-N` (see repo-root `RELEASES.md` for the current branch name, e.g. `release/sprint-06`, `release/sprint-6.1`).
- **Branch naming:** `initials/type-description` — e.g. `lb/feat-auth-form`, `th/fix-navbar-overflow`, `lb/refactor-map-hooks`
  - Types: `feat` / `fix` / `refactor` / `chore`

```bash
# From repo root (management-system/)
git fetch origin
git checkout release/sprint-07          # replace with active sprint from RELEASES.md
git pull origin release/sprint-07
git checkout -b th/feat-calendar-filters
```

- **Pull requests:** open into the **same** `release/sprint-N` branch you branched from (not `dev` / `stage` / `main` unless release leads say otherwise).

### Conventional Commits

- **Format:** `<type>(optional scope): short, clear summary`
- **Examples:**
  - `feat(dashboard): add user profile sidebar`
  - `fix(layout): correct header alignment on mobile`
  - `refactor: simplify form validation logic`
  - `chore(deps): update dependencies`
- Enforced by **commitlint** via Husky `commit-msg` hook

### Pull Requests

- Open PRs into the active **`release/sprint-N`** branch (see `RELEASES.md`) — not into `dev` for sprint work
- Never open feature PRs directly into `stage` or `main`
- Request review from 1–2 team members
- PR must include: short description, screenshots/gifs for UI changes, breaking change notes if any
- After approval: **Squash & Merge** into `dev` (one commit per feature)
- Delete the feature branch after merging

### Promotion Flow

- `dev` → active development
- `stage` → testing / QA (merged from `dev` as part of release cycle)
- `main` → stable, production-ready (merged from `stage` after verification)
- Do not merge directly to `stage` or `main`

### Pre-commit Hooks (Husky)

- `pre-commit`: runs project checks once based on staged paths — `frontend/` → format + lint:fix + test; `frontend-2/` → lint-staged + test (via `frontend/.husky/pre-commit`)
- `commit-msg`: validates conventional commit format
- Do not skip with `--no-verify`

## Boundaries

### Always

- Use `api/endpoints.ts` for all backend URLs
- Use `api/client.ts` (ApiClient) for new API calls — not `lib/axios.ts`
- Validate forms with Zod schemas via React Hook Form
- Gate features behind `PermissionCodeGate` when permissions apply
- Use shadcn/ui primitives before building custom components
- Handle loading, error, and empty states in data-fetching components
- Sanitize user input (DOMPurify interceptor handles API calls; use `SanitizedInput`/`SanitizedTextarea` for display)
- Run `npm run lint`, `npm run format`, and `npm test` before committing (or rely on Husky pre-commit)
- Add or update unit tests in `__tests__/` when changing pure logic in `entities/`, `features/`, or `shared/`

### Ask First

- Adding new npm dependencies
- Modifying Auth0 configuration or auth flow
- Changes to `api/client.ts` interceptors

### Never

- Use `any` type or `@ts-ignore` in TypeScript
- Hardcode API URLs — always use `api/endpoints.ts`
- Create new axios instances — use the existing ApiClient
- Skip Husky pre-commit hooks
- Leave `console.log` in components — remove or move to `useEffect`
- Leave unused variables, state declarations, or dead code in files
- Place reusable components inside the `app/` directory — it is for routes and layouts only
- Put business logic directly inside JSX
- Branch sprint feature work off `dev` — use `release/sprint-N` per `RELEASES.md`
- Merge directly to `stage` or `main` — follow the promotion flow through `dev`
- Commit `.env` files, API keys, secrets, or credentials
- Modify `node_modules/`, `dist/`, or generated files
- Force push to release branches
