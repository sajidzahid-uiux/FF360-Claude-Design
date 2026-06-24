"use client";

import Link from "next/link";
import { useState, type ComponentType } from "react";

import { ThemeControlsPopover } from "@/shared/ui/theme/ThemeControlsPopover";

import { RendererBoundary } from "./RendererBoundary";
import {
  AppBreadcrumbsRenderer,
  AppFormModalRenderer,
  AppLayoutRenderer,
  AvatarRenderer,
  ButtonRenderer,
  ChartsRenderer,
  ControlsRenderer,
  DeleteOrganizationRenderer,
  DialogRenderer,
  DropdownRenderer,
  FileUploadRenderer,
  InputRenderer,
  LoaderRenderer,
  MapComponentsRenderer,
  ModalRenderer,
  NotFoundRenderer,
  OrganizationInfoRenderer,
  OrganizationSwitcherRenderer,
  SearchInputRenderer,
  SidebarPrimitivesRenderer,
  SliderColorPickerRenderer,
  TableRenderer,
  TabsSwitcherRenderer,
  ThemeControlsRenderer,
  ThemeTokensRenderer,
  UploadedFileRenderer,
} from "./renderers";

type Item = { id: string; label: string; Component: ComponentType };
type Group = { group: string; items: Item[] };

const MENU: Group[] = [
  {
    group: "UI Components",
    items: [
      { id: "buttons", label: "Button", Component: ButtonRenderer },
      { id: "input", label: "Input", Component: InputRenderer },
      { id: "controls", label: "Controls", Component: ControlsRenderer },
      { id: "slider-color-picker", label: "Slider & Color Picker", Component: SliderColorPickerRenderer },
      { id: "search-input", label: "Search Input", Component: SearchInputRenderer },
      { id: "dropdown", label: "Dropdown", Component: DropdownRenderer },
      { id: "tabs-switcher", label: "Tabs Switcher", Component: TabsSwitcherRenderer },
      { id: "avatar", label: "Avatar", Component: AvatarRenderer },
      { id: "loader", label: "Loader", Component: LoaderRenderer },
    ],
  },
  {
    group: "Data & Charts",
    items: [
      { id: "charts", label: "Charts", Component: ChartsRenderer },
      { id: "table", label: "Table", Component: TableRenderer },
    ],
  },
  {
    group: "Overlays & Dialogs",
    items: [
      { id: "modal", label: "Modal", Component: ModalRenderer },
      { id: "dialog", label: "Dialog", Component: DialogRenderer },
      { id: "app-form-modal", label: "App Form Modal", Component: AppFormModalRenderer },
    ],
  },
  {
    group: "Files",
    items: [
      { id: "file-upload", label: "File Upload", Component: FileUploadRenderer },
      { id: "uploaded-file", label: "Uploaded File", Component: UploadedFileRenderer },
    ],
  },
  {
    group: "Navigation & Layout",
    items: [
      { id: "app-breadcrumbs", label: "App Breadcrumbs", Component: AppBreadcrumbsRenderer },
      { id: "app-layout", label: "App Layout", Component: AppLayoutRenderer },
      { id: "sidebar-primitives", label: "Sidebar Primitives", Component: SidebarPrimitivesRenderer },
      { id: "not-found", label: "Not Found", Component: NotFoundRenderer },
    ],
  },
  {
    group: "Organization",
    items: [
      { id: "organization-switcher", label: "Organization Switcher", Component: OrganizationSwitcherRenderer },
      { id: "organization-info", label: "Organization Info", Component: OrganizationInfoRenderer },
      { id: "delete-organization", label: "Delete Organization", Component: DeleteOrganizationRenderer },
    ],
  },
  {
    group: "Maps",
    items: [
      { id: "map-components", label: "Map Components", Component: MapComponentsRenderer },
    ],
  },
  {
    group: "Theme",
    items: [
      { id: "theme-controls", label: "Theme Controls", Component: ThemeControlsRenderer },
      { id: "theme-tokens", label: "Theme Tokens", Component: ThemeTokensRenderer },
    ],
  },
];

const ALL_ITEMS = MENU.flatMap((g) => g.items);

export default function DesignSystemPage() {
  const [activeId, setActiveId] = useState("buttons");
  const active = ALL_ITEMS.find((i) => i.id === activeId) ?? ALL_ITEMS[0];
  const ActiveComponent = active.Component;

  return (
    <div className="flex min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Left component menu */}
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-4 dark:border-zinc-800">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-zinc-900 text-xs font-bold text-white dark:bg-white dark:text-zinc-900">
            FF
          </span>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Design System</div>
            <div className="text-[11px] text-zinc-500">@fieldflow360/org-ui</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {MENU.map((group) => (
            <div key={group.group} className="mb-4">
              <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                {group.group}
              </p>
              {group.items.map((item) => {
                const isActive = item.id === activeId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveId(item.id)}
                    className={
                      "block w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors " +
                      (isActive
                        ? "bg-zinc-900 font-medium text-white dark:bg-white dark:text-zinc-900!"
                        : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800")
                    }
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-zinc-200 px-3 py-3 text-xs dark:border-zinc-800">
          <Link href="/hub" className="text-zinc-500 hover:underline">
            ← Back to Hub
          </Link>
          <span className="px-2 text-zinc-300">·</span>
          <Link href="/flows" className="text-zinc-500 hover:underline">
            Flows
          </Link>
        </div>
      </aside>

      {/* Main content — full width */}
      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white/85 px-8 py-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/85">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{active.label}</h1>
            <p className="text-sm text-zinc-500">
              Live component from the same package the CMS imports.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeControlsPopover align="right" />
            <a
              href="/organizations/1/dashboard"
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Open CMS ↗
            </a>
          </div>
        </header>

        <div className="px-8 py-8">
          <div className="space-y-8">
            <RendererBoundary name={active.label}>
              <ActiveComponent />
            </RendererBoundary>
          </div>
        </div>
      </main>
    </div>
  );
}
