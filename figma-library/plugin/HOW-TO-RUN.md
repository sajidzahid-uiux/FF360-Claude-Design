# Run the FF360 Screens Generator (Figma desktop)

Generates **Job List (Excavation)** + **Job Detail (Excavation)** as native,
editable, auto-layout frames — using org-ui light-theme colors.

## Steps (≈1 min)
1. Open **Figma desktop** → open (or create) a file.
2. Top menu → **Plugins → Development → Import plugin from manifest…**
3. Select `figma-library/plugin/manifest.json` (this folder).
4. Run it: **Plugins → Development → FF360 Screens Generator**.
5. Two frames appear side by side and the canvas zooms to fit. Done.

## What you get
- **Job List — Excavation**: sidebar shell, breadcrumb, Active/Archived tabs,
  title + Add Job, toolbar (search + Status filter + List/Grid), and the real
  table columns (Job Name, Estimate Number, Topo, Material Status, Job Status,
  Job Progress, Actions) with 6 sample rows, status badges, progress bars.
- **Job Detail — Excavation**: breadcrumb, title + status badge + actions,
  the real tab bar (Job Details / Production Tracking / Financial / Estimate /
  Files), a details field grid, and a map card **with the bottom drag-resize
  handle** (per the project maps rule).

Everything is real Figma auto layout — select any frame and you'll see the
layout controls; resize the outer frame and children reflow.

## Notes
- Uses **Inter** (Figma's bundled font) so it runs with no font install.
- Colors are exact org-ui light-theme tokens. To also get variables, import
  `../ff360-figma-tokens.json` via the Tokens Studio plugin (see ../README.md).
- Sample row data is placeholder text — edit freely, or ask Claude to pull the
  exact dummy records from the running prototype.
- To add the other trades (Repair, Drainage-Tiling) or the Leads screens, ask
  Claude to extend `code.js` — the structure is identical, only labels differ.
