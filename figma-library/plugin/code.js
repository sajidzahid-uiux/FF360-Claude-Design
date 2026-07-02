// FF360 Screens Generator — builds Job List + Job Detail as native
// auto-layout Figma frames, using @fieldflow360/org-ui light-theme tokens.
// Run: Figma desktop → Plugins → Development → Import plugin from manifest → run.

// ---- org-ui light theme tokens (from projects/org-ui/src/theme/colors.ts) ----
const C = {
  bgApp: "#ffffff",
  surface: "#fafafa",
  hover: "#f3f4f6",
  white: "#ffffff",
  black: "#18181b",
  border: "#e4e4e7",
  borderSubtle: "#e5e7eb",
  textPrimary: "#0a0a0a",
  textSecondary: "#404040",
  textMuted: "#737373",
  accent: "#d9f46e",
  errBase: "#ff3b30",
  errStrong: "#82181a",
  succSoft: "#b9f8cf",
  succText: "#0d542b",
  zinc100: "#f4f4f5",
  zinc300: "#d4d4d8",
  zinc700: "#3f3f46",
};

function hex(h) {
  const n = parseInt(h.slice(1), 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}
function paint(h) { return [{ type: "SOLID", color: hex(h) }]; }

// ---- factory helpers ----
function F(name, o) {
  o = o || {};
  const f = figma.createFrame();
  f.name = name;
  f.layoutMode = o.dir || "VERTICAL";
  f.itemSpacing = o.gap == null ? 0 : o.gap;
  const p = o.pad;
  if (typeof p === "number") { f.paddingTop = f.paddingBottom = f.paddingLeft = f.paddingRight = p; }
  else if (p) { f.paddingTop = p.t || 0; f.paddingBottom = p.b || 0; f.paddingLeft = p.l || 0; f.paddingRight = p.r || 0; }
  f.primaryAxisSizingMode = "AUTO";
  f.counterAxisSizingMode = "AUTO";
  f.fills = o.fill ? paint(o.fill) : [];
  if (o.radius != null) f.cornerRadius = o.radius;
  if (o.stroke) { f.strokes = paint(o.stroke); f.strokeWeight = o.strokeW || 1; f.strokeAlign = "INSIDE"; }
  if (o.align) f.primaryAxisAlignItems = o.align;          // START|CENTER|MAX|SPACE_BETWEEN
  if (o.cross) f.counterAxisAlignItems = o.cross;          // START|CENTER|MAX
  return f;
}
function T(chars, size, style, color) {
  const t = figma.createText();
  t.fontName = { family: "Inter", style: style };
  t.fontSize = size;
  t.lineHeight = { value: size * 1.4, unit: "PIXELS" };
  t.characters = chars;
  t.fills = paint(color);
  return t;
}
// append child then set its sizing inside the (auto-layout) parent
function add(parent, child, s) {
  parent.appendChild(child);
  if (s) {
    if (s.h) child.layoutSizingHorizontal = s.h;   // FILL|HUG|FIXED
    if (s.v) child.layoutSizingVertical = s.v;
    if (s.w != null) { child.layoutSizingHorizontal = "FIXED"; child.resize(s.w, child.height); }
    if (s.hpx != null) { child.layoutSizingVertical = "FIXED"; child.resize(child.width, s.hpx); }
  }
  return child;
}
function bottomBorder(node, color) {
  node.strokes = paint(color);
  node.strokeTopWeight = 0; node.strokeLeftWeight = 0; node.strokeRightWeight = 0;
  node.strokeBottomWeight = 1; node.strokeAlign = "INSIDE";
}

// ---- reusable UI bits ----
function badge(text, bg, fg) {
  const b = F("Badge", { dir: "HORIZONTAL", pad: { t: 3, b: 3, l: 10, r: 10 }, radius: 999, fill: bg, cross: "CENTER" });
  add(b, T(text, 12, "Medium", fg));
  return b;
}
const STATUS = {
  "In Progress": [C.accent, C.black],
  "Completed": [C.succSoft, C.succText],
  "Scheduled": [C.zinc100, C.zinc700],
  "Pending": [C.hover, C.textMuted],
  "On Hold": [C.hover, C.textMuted],
};
function statusBadge(s) { const c = STATUS[s] || [C.hover, C.textMuted]; return badge(s, c[0], c[1]); }

function button(label, variant) {
  const isPrimary = variant === "primary";
  const b = F("Button/" + (variant || "white"), {
    dir: "HORIZONTAL", pad: { t: 9, b: 9, l: 16, r: 16 }, radius: 8, gap: 8, cross: "CENTER",
    fill: isPrimary ? C.black : C.white, stroke: isPrimary ? null : C.border, strokeW: 1,
  });
  add(b, T(label, 14, "Medium", isPrimary ? C.white : C.textPrimary));
  return b;
}
function progressBar(pct) {
  const track = F("Progress", { dir: "HORIZONTAL", radius: 999, fill: C.hover });
  track.counterAxisSizingMode = "FIXED"; track.primaryAxisSizingMode = "FIXED";
  track.resize(96, 6);
  const fill = F("Fill", { fill: C.accent, radius: 999 });
  add(track, fill);
  fill.layoutSizingVertical = "FILL";
  fill.layoutSizingHorizontal = "FIXED";
  fill.resize(Math.max(2, Math.round(96 * pct / 100)), 6);
  return track;
}

// ---- app shell (sidebar) ----
function sidebar(activeLabel) {
  const s = F("Sidebar", { dir: "VERTICAL", pad: { t: 20, b: 20, l: 12, r: 12 }, gap: 6, fill: C.white, stroke: C.border, strokeW: 1 });
  const brand = F("Brand", { dir: "HORIZONTAL", pad: { t: 4, b: 16, l: 8, r: 8 }, gap: 8, cross: "CENTER" });
  const dot = F("Logo", { fill: C.accent, radius: 6 }); add(brand, dot); dot.resize(24, 24); dot.layoutSizingHorizontal = "FIXED"; dot.layoutSizingVertical = "FIXED";
  add(brand, T("FieldFlow360", 15, "Bold", C.textPrimary));
  add(s, brand, { h: "FILL" });
  ["Dashboard", "Leads", "Jobs", "Calendar", "Map", "Messages", "Settings"].forEach(function (label) {
    const active = label === activeLabel;
    const item = F("Nav/" + label, { dir: "HORIZONTAL", pad: { t: 9, b: 9, l: 12, r: 12 }, radius: 8, gap: 10, cross: "CENTER", fill: active ? C.hover : null });
    add(item, T(label, 14, active ? "Semi Bold" : "Regular", active ? C.textPrimary : C.textSecondary));
    add(s, item, { h: "FILL" });
  });
  return s;
}

function pageHeader(crumbTrail) {
  const h = F("Breadcrumbs", { dir: "HORIZONTAL", gap: 8, cross: "CENTER" });
  crumbTrail.forEach(function (c, i) {
    add(h, T(c, 13, i === crumbTrail.length - 1 ? "Medium" : "Regular", i === crumbTrail.length - 1 ? C.textPrimary : C.textMuted));
    if (i < crumbTrail.length - 1) add(h, T("›", 13, "Regular", C.textMuted));
  });
  return h;
}

// =================== JOB LIST ===================
function buildJobList() {
  const page = F("Job List — Excavation", { dir: "HORIZONTAL", fill: C.bgApp });
  page.primaryAxisSizingMode = "FIXED"; page.counterAxisSizingMode = "FIXED"; page.resize(1440, 900);

  const sb = add(page, sidebar("Jobs"), { v: "FILL" }); sb.layoutSizingHorizontal = "FIXED"; sb.resize(240, sb.height);

  const main = add(page, F("Main", { dir: "VERTICAL", pad: 28, gap: 20, fill: C.bgApp }), { h: "FILL", v: "FILL" });

  add(main, pageHeader(["Jobs", "Excavation"]), { h: "FILL" });

  // tabs (Active / Archived) — UNDERLINED TabsSwitcher
  const tabs = F("Tabs", { dir: "HORIZONTAL", gap: 24 }); bottomBorder(tabs, C.border);
  [["Active (14)", true], ["Archived (14)", false]].forEach(function (t) {
    const tab = F("Tab", { dir: "VERTICAL", pad: { t: 0, b: 10, l: 2, r: 2 } });
    if (t[1]) bottomBorder(tab, C.black);
    add(tab, T(t[0], 14, t[1] ? "Semi Bold" : "Regular", t[1] ? C.textPrimary : C.textMuted));
    add(tabs, tab);
  });
  add(main, tabs, { h: "FILL" });

  // title row + Add Job
  const titleRow = F("TitleRow", { dir: "HORIZONTAL", align: "SPACE_BETWEEN", cross: "CENTER" });
  const titleCol = F("TitleCol", { dir: "VERTICAL", gap: 4 });
  add(titleCol, T("Excavation Jobs", 22, "Bold", C.textPrimary));
  add(titleCol, T("View and manage excavation jobs here.", 14, "Regular", C.textMuted));
  add(titleRow, titleCol, { h: "FILL" });
  add(titleRow, button("+  Add Job", "primary"));
  add(main, titleRow, { h: "FILL" });

  // toolbar (search + status filter + view toggle)
  const toolbar = F("Toolbar", { dir: "HORIZONTAL", gap: 12, cross: "CENTER" });
  const search = F("SearchInput", { dir: "HORIZONTAL", pad: { t: 9, b: 9, l: 12, r: 12 }, radius: 8, fill: C.white, stroke: C.border, strokeW: 1 });
  add(search, T("Search jobs…", 14, "Regular", C.textMuted));
  add(toolbar, search, { w: 280 });
  const filter = F("Filter/Status", { dir: "HORIZONTAL", pad: { t: 9, b: 9, l: 12, r: 12 }, radius: 8, gap: 8, fill: C.white, stroke: C.border, strokeW: 1 });
  add(filter, T("Status", 14, "Regular", C.textSecondary)); add(filter, T("▾", 12, "Regular", C.textMuted));
  add(toolbar, filter);
  const spacer = F("sp", {}); add(toolbar, spacer, { h: "FILL" }); spacer.layoutSizingVertical = "FIXED"; spacer.resize(spacer.width, 1);
  const toggle = F("ViewToggle", { dir: "HORIZONTAL", radius: 8, fill: C.hover, pad: 3, gap: 2 });
  [["List", true], ["Grid", false]].forEach(function (v) {
    const seg = F("Seg", { dir: "HORIZONTAL", pad: { t: 5, b: 5, l: 12, r: 12 }, radius: 6, fill: v[1] ? C.white : null });
    add(seg, T(v[0], 13, "Medium", v[1] ? C.textPrimary : C.textMuted)); add(toggle, seg);
  });
  add(toolbar, toggle);
  add(main, toolbar, { h: "FILL" });

  // table
  const cols = [
    { label: "", w: 40 },
    { label: "Job Name", grow: true },
    { label: "Estimate Number", w: 150 },
    { label: "Topo", w: 70 },
    { label: "Material Status", w: 140 },
    { label: "Job Status", w: 130 },
    { label: "Job Progress", w: 130 },
    { label: "Actions", w: 80 },
  ];
  const table = F("Table", { dir: "VERTICAL", radius: 10, fill: C.white, stroke: C.border, strokeW: 1 });
  table.clipsContent = true;

  function makeRow(cells, opts) {
    opts = opts || {};
    const row = F(opts.header ? "HeaderRow" : "Row", { dir: "HORIZONTAL", pad: { t: 12, b: 12, l: 16, r: 16 }, gap: 16, cross: "CENTER", fill: opts.header ? C.surface : C.white });
    bottomBorder(row, C.borderSubtle);
    cols.forEach(function (col, i) {
      const cell = F("Cell", { dir: "HORIZONTAL", cross: "CENTER" });
      const content = cells[i];
      if (content == null) { /* empty (checkbox col) */
        const box = F("Checkbox", { radius: 4, stroke: C.zinc300, strokeW: 1, fill: C.white }); add(cell, box); box.resize(16, 16); box.layoutSizingHorizontal = "FIXED"; box.layoutSizingVertical = "FIXED";
      } else if (typeof content === "string") {
        add(cell, T(content, 14, opts.header ? "Semi Bold" : "Regular", opts.header ? C.textSecondary : C.textPrimary));
      } else {
        add(cell, content); // node (badge / progress)
      }
      add(row, cell, col.grow ? { h: "FILL" } : { w: col.w });
    });
    return row;
  }

  add(table, makeRow(cols.map(function (c) { return c.label; }), { header: true }), { h: "FILL" });

  const rows = [
    ["Johnson Field Excavation", "EST-10241", "✓", "Ordered", "In Progress", 60],
    ["Miller Farm Dig", "EST-10238", "—", "Pending", "Scheduled", 20],
    ["Green Acres Site Prep", "EST-10233", "✓", "Received", "In Progress", 45],
    ["Sunrise Drainage Cut", "EST-10229", "✓", "Ordered", "Completed", 100],
    ["Cedar Ridge Excavation", "EST-10225", "—", "Pending", "On Hold", 10],
    ["Prairie View Trenching", "EST-10220", "✓", "Received", "Scheduled", 0],
  ];
  rows.forEach(function (r) {
    add(table, makeRow([null, r[0], r[1], r[2], r[3], statusBadge(r[4]), progressBar(r[5]), "•••"]), { h: "FILL" });
  });
  add(main, table, { h: "FILL" });

  return page;
}

// =================== JOB DETAIL ===================
function fieldPair(label, value, valNode) {
  const p = F("Field", { dir: "VERTICAL", gap: 4, pad: { t: 0, b: 14, l: 0, r: 0 } });
  add(p, T(label, 12, "Medium", C.textMuted));
  if (valNode) add(p, valNode); else add(p, T(value, 14, "Regular", C.textPrimary));
  return p;
}
function buildJobDetail() {
  const page = F("Job Detail — Excavation", { dir: "HORIZONTAL", fill: C.bgApp });
  page.primaryAxisSizingMode = "FIXED"; page.counterAxisSizingMode = "FIXED"; page.resize(1440, 900);

  const sb = add(page, sidebar("Jobs"), { v: "FILL" }); sb.layoutSizingHorizontal = "FIXED"; sb.resize(240, sb.height);
  const main = add(page, F("Main", { dir: "VERTICAL", pad: 28, gap: 20, fill: C.bgApp }), { h: "FILL", v: "FILL" });

  add(main, pageHeader(["Jobs", "Excavation", "Johnson Field Excavation"]), { h: "FILL" });

  // header: title + status + actions
  const head = F("DetailHead", { dir: "HORIZONTAL", align: "SPACE_BETWEEN", cross: "CENTER" });
  const left = F("l", { dir: "HORIZONTAL", gap: 12, cross: "CENTER" });
  add(left, T("Johnson Field Excavation", 22, "Bold", C.textPrimary));
  add(left, statusBadge("In Progress"));
  add(head, left, { h: "FILL" });
  const actions = F("actions", { dir: "HORIZONTAL", gap: 10 });
  add(actions, button("On-site Tracking", "white")); add(actions, button("Edit", "primary"));
  add(head, actions);
  add(main, head, { h: "FILL" });

  // tab bar
  const tabs = F("DetailTabs", { dir: "HORIZONTAL", gap: 24 }); bottomBorder(tabs, C.border);
  ["Job Details", "Production Tracking", "Financial", "Estimate", "Files"].forEach(function (label, i) {
    const tab = F("Tab", { dir: "VERTICAL", pad: { t: 0, b: 10, l: 2, r: 2 } });
    if (i === 0) bottomBorder(tab, C.black);
    add(tab, T(label, 14, i === 0 ? "Semi Bold" : "Regular", i === 0 ? C.textPrimary : C.textMuted));
    add(tabs, tab);
  });
  add(main, tabs, { h: "FILL" });

  // content: details grid (left) + map card (right)
  const body = F("Body", { dir: "HORIZONTAL", gap: 20 });
  const card = F("DetailsCard", { dir: "VERTICAL", pad: 24, gap: 0, radius: 10, fill: C.white, stroke: C.border, strokeW: 1 });
  add(card, T("Job Details", 16, "Semi Bold", C.textPrimary));
  const grid = F("Grid", { dir: "HORIZONTAL", gap: 40, pad: { t: 16, b: 0, l: 0, r: 0 } });
  const colA = F("colA", { dir: "VERTICAL", gap: 0 });
  const colB = F("colB", { dir: "VERTICAL", gap: 0 });
  [["Client Name", "Robert Johnson"], ["Phone", "(555) 214-8890"], ["Address", "4821 County Rd 12, Ames, IA"], ["Estimate Number", "EST-10241"], ["Description", "Full field excavation and grading for new tile install."]]
    .forEach(function (f) { add(colA, fieldPair(f[0], f[1]), { h: "FILL" }); });
  add(colB, fieldPair("Job Status", null, statusBadge("In Progress")), { h: "FILL" });
  [["Topo", "Completed"], ["Material Status", "Ordered"], ["Start Date", "Jul 8, 2026"], ["Assigned Crew", "Crew A — 4 members"]]
    .forEach(function (f) { add(colB, fieldPair(f[0], f[1]), { h: "FILL" }); });
  add(grid, colA, { h: "FILL" }); add(grid, colB, { h: "FILL" });
  add(card, grid, { h: "FILL" });
  add(body, card, { h: "FILL", v: "FILL" });

  // map card w/ bottom drag-to-resize handle (per CLAUDE.md maps rule)
  const mapWrap = F("MapCard", { dir: "VERTICAL", radius: 10, fill: C.hover, stroke: C.border, strokeW: 1 });
  mapWrap.clipsContent = true;
  const mapArea = F("Map", { dir: "VERTICAL", align: "CENTER", cross: "CENTER", fill: C.hover });
  add(mapArea, T("🗺  Job Location Map", 14, "Medium", C.textMuted));
  add(mapWrap, mapArea, { h: "FILL", v: "FILL" });
  const handle = F("ResizeHandle", { dir: "HORIZONTAL", align: "CENTER", cross: "CENTER", pad: { t: 6, b: 6, l: 0, r: 0 }, fill: C.surface });
  const grip = F("grip", { radius: 999, fill: C.zinc300 }); add(handle, grip); grip.resize(36, 4); grip.layoutSizingHorizontal = "FIXED"; grip.layoutSizingVertical = "FIXED";
  bottomBorder(handle, C.border);
  add(mapWrap, handle, { h: "FILL" });
  add(body, mapWrap, { v: "FILL" }); mapWrap.layoutSizingHorizontal = "FIXED"; mapWrap.resize(420, mapWrap.height);

  add(main, body, { h: "FILL" });
  return page;
}

async function main() {
  await Promise.all([
    figma.loadFontAsync({ family: "Inter", style: "Regular" }),
    figma.loadFontAsync({ family: "Inter", style: "Medium" }),
    figma.loadFontAsync({ family: "Inter", style: "Semi Bold" }),
    figma.loadFontAsync({ family: "Inter", style: "Bold" }),
  ]);

  const list = buildJobList();
  const detail = buildJobDetail();
  list.x = 0; list.y = 0;
  detail.x = 1440 + 80; detail.y = 0;

  figma.currentPage.appendChild(list);
  figma.currentPage.appendChild(detail);
  figma.currentPage.selection = [list, detail];
  figma.viewport.scrollAndZoomIntoView([list, detail]);
  figma.closePlugin("✅ Created Job List + Job Detail frames");
}

main();
