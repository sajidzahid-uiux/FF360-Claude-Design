# FF360 org-ui → Figma Library (Path B)

Goal: a real Figma library that mirrors `@fieldflow360/org-ui` — true component
instances + shared variables — so sprint pages are built from the design system,
not pasted images. First pages to build: **leads/jobs list views**.

This is a design build-out, not something that can be auto-generated from React.
This folder gives you the two things that *can* come from code — the **tokens** and
the **spec** — plus the exact order to build in.

---

## 0. What's in this folder

| File | What it is |
|---|---|
| `ff360-figma-tokens.json` | Tokens Studio–format tokens (colors + spacing + radius + type), faithful to `org-ui/src/theme/`. Imports straight into Figma Variables. |
| `README.md` | This build plan. |

---

## 1. Import the tokens → Figma Variables (do this first)

The tokens are the backbone of "the design system is present." Get them in before
building any component.

1. In your Figma file, install the **Tokens Studio for Figma** plugin (free).
2. Plugin → **Settings → Import** → paste/upload `ff360-figma-tokens.json`.
3. You'll get token sets: `primitives`, `feedback`, and `semantic-light/-dark/-night`.
4. Tokens Studio → **Themes** already contains three themes (Light / Dark / Night).
   Use **Export → Styles & Variables** to push them into Figma. The three themes
   become **three modes** on a `semantic` variable collection; `primitives` become a
   raw palette collection.

After this, every fill/stroke/text in your components should reference a **variable**
(`semantic/bg/surface`, `semantic/text/primary`, …), never a raw hex. Switching a
frame's mode Light→Dark→Night then just works.

### Fidelity notes (so you trust the values)
- **Colors** are exact, pulled from `org-ui/src/theme/colors.ts` + `themes.ts`
  (single source of truth). Light / Dark / Night all covered.
- **Spacing / radius / type scales** are Tailwind v4 defaults — org-ui defines no
  custom scale, so it inherits these. Confirm against a live component if a value
  looks off.
- **Font family** — org-ui declares no custom font; it uses the system sans stack.
  The token reflects that. **If the team ships a brand font later, update
  `primitives.fontFamily.sans`** and re-export.

---

## 2. Library file structure

One published library file. Suggested pages:

```
📄 00 · Foundations   → color/type/spacing variable swatches, elevation, iconography
📄 01 · Components     → every org-ui component as a Figma component + variants
📄 02 · Patterns       → composed blocks (page header, toolbar, list-view shell, empty state)
🔒 Publish this file as a Team Library. Sprint/story files consume it.
```

Then a **separate** consuming file per the sprint workflow we set up:
`Sprint NN` page → one Section per story → screens built from the library instances.

---

## 3. Component inventory (from org-ui source)

Build these as Figma components with variants matching the real props. Priority is
ordered for the **leads/jobs list views** — build the ⭐ ones first; they're what
those screens are made of.

### UI components — `src/components/ui-components/`
| Component | Key variants / props to model | Priority |
|---|---|---|
| ⭐ Button | `variant` (default/white/ghost/delete/danger), `iconOnly`, size, disabled, `title` | High |
| ⭐ Input | default / focus / error / disabled, with/without label + helper | High |
| ⭐ SearchInput | idle / typing / clear-visible | High |
| ⭐ Dropdown | closed / open, selected, disabled | High |
| ⭐ SearchableDropdown / SearchSelect | closed / open / filtering | High |
| ⭐ Checkbox | unchecked / checked / indeterminate / disabled | High |
| ⭐ TabsSwitcher | `PILL` and `UNDERLINED` views, 2–4 tabs, active index | High |
| Radio | unchecked / checked / disabled | Med |
| Toggle | off / on / disabled | Med |
| Textarea | default / focus / error | Med |
| Slider | default / dragging | Low |
| ColorPicker | closed / open | Low |
| Avatar | image / initials, sizes | Med |

### Widgets — `src/components/widgets/`
| Component | Notes | Priority |
|---|---|---|
| ⭐ Table / toolbar | The heart of list views. Model: header row, row, row-hover, selected, sortable header, pagination, toolbar w/ search + filter tabs + actions | High |
| Charts (Bar / GroupedBar / Radial / Trend) | Container + legend + empty state; use `chart/series-*` vars | Med |
| Loader | spinner / skeleton | Med |
| NotFound / EmptyState | list empty state | ⭐ High (list views need it) |
| FileUpload / DownloadedFile | | Low |
| OrganizationSwitcher | cards + create form | Low |
| AuthSignIn | full auth layout | Low |

### System components — `src/components/system-components/`
| Component | Notes | Priority |
|---|---|---|
| ⭐ AppLayout | sidebar + top shell — the frame every page sits in | High |
| ⭐ AppBreadcrumbs | list-view header | High |
| Modal / Dialog / DeleteDialog / AppFormModal | overlays (URL-driven in the app) | Med |
| SettingsLayout | settings pages | Low |
| Nav items (NavGroupLink, NavExpandableMenuItem, Sidebar*) | sidebar internals | Med |

> Prop truth lives in each component's `.tsx` and the renderers under
> `app/design-system/renderers/*` — reference those for exact variant names when
> you build the Figma variants, so Figma variant names match code.

---

## 4. Build order (fastest path to the first sprint)

1. **Import tokens** (§1) → variables exist.
2. **Foundations page** — drop swatches for the variable collections so the team can
   see the system. ~30 min.
3. **Build the ⭐ High components** in this order — they compose upward:
   Button → Input/SearchInput → Checkbox → Dropdown/SearchSelect → TabsSwitcher →
   Table (+ toolbar) → EmptyState → AppBreadcrumbs → AppLayout shell.
4. **Compose the list-view pattern** (02 · Patterns): AppLayout shell → breadcrumb
   header → toolbar (search + `TabsSwitcher` trade filter + actions) → Table → empty
   state. This *is* the leads/jobs list view skeleton.
5. **Publish** the library.
6. In the **Sprint file**, build the 6 list views from instances:
   - Leads: `leads/drainage-tiling`, `leads/excavation`, `leads/repair`
   - Jobs:  `jobs/drainage-tiling`, `jobs/excavation`, `jobs/repair`

   (Reference live at `localhost:3000/organizations/1/<path>` — capture data/labels
   from there so the Figma content matches the prototype.)

---

## 5. Keeping Figma ↔ code in sync

- **Tokens** — when `org-ui/src/theme/colors.ts` changes, re-generate this JSON and
  re-import via Tokens Studio → variables update everywhere. (Ask Claude to re-export.)
- **Components** — no auto-sync exists. When a component's props/variants change in
  code, update the matching Figma variant. Keep Figma variant names === code prop
  values so the mapping stays obvious.
- **History/proof** — new sprint = new page in the Sprint file; old pages stay frozen.

---

## 6. Auto layout cheatsheet (so frames match org-ui's flex)

- List-view shell: vertical auto layout, `gap = spacing/4 (16)`, `padding = spacing/6 (24)`.
- Toolbar: horizontal auto layout, space-between, `gap = spacing/2 (8)`.
- Table row: horizontal auto layout, fixed row height, cells hug/fill per column.
- Buttons: horizontal auto layout, `padding` from spacing scale, `radius = radius/md (6)`.
- Everything uses **fill container / hug** — no fixed widths except the sidebar.
