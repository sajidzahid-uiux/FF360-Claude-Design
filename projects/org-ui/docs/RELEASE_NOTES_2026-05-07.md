# Release Notes - 2026-05-07

## Scope

This release consolidates the `org-ui` migration work across theming, layout/system components, and reusable widgets for Tile Design and CMS adoption.

## Highlights

- Unified semantic theming in `styles.css` and theme sources.
- Expanded reusable system/widgets set (app layout, dialog/modal stack, org switcher pieces, sidebar primitives, dynamic favicon, map location picker).
- Upgraded loader with connected pipeline animation and accent-aware visuals.
- Dev app improvements for discovery (grouped navigation, token preview, controls panel/search, route organization).

## Permission-Safe APIs

- `OrganizationInfo` supports edit gating via `canEdit` + `onEdit`.
- `DeleteOrganization` now supports permission gating:
  - `canDelete?: boolean`
  - `noPermissionLabel?: string`
  - `onDelete?: () => void` (button auto-disables if missing)

## Quality Gates Run

- `npm run lint`
- `npm run test`
- `npm run type-check`
- `npm run build`

## Test Additions

- `tests/organization-widgets.test.tsx`
  - Verifies permission behavior for `OrganizationInfo` / `DeleteOrganization`.
- `tests/library-exports.test.ts`
  - Verifies consumer-facing exports for key components/utils/theme APIs.
- `tests/theme-provider.test.tsx`
  - Added assertions to prevent dark/night class bleed during mode toggle.

## Edge Cases Reviewed

- Theme mode switching class cleanup (`dark` vs `night`) on `html` and `body`.
- Accent color persistence and CSS variable propagation.
- Export surface smoke check for core imports from package root.

