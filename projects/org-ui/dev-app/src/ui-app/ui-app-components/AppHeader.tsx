import {
  SearchInput,
  SurfaceVariantEnum,
  ThemeControls,
  ThemeControlsOrientationEnum,
} from '@fieldflow360/org-ui';
import { ReactNode, useMemo, useState } from 'react';
import type { SidebarItem } from './sidebarConfig';

interface AppHeaderProps {
  title: string;
  mode: string;
  activeTab?: string;
  items: SidebarItem[];
  onSelectItem: (itemId: string) => void;
  children?: ReactNode;
}

const ControlsSearchIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M3.75 6h2.25m4.5 6h9.75m-16.5 0h2.25m4.5 6h9.75m-16.5 0h2.25" />
    <circle cx="8.25" cy="6" r="2.25" />
    <circle cx="8.25" cy="12" r="2.25" />
    <circle cx="8.25" cy="18" r="2.25" />
  </svg>
);

export const AppHeader = ({ title, mode, activeTab, items, onSelectItem, children }: AppHeaderProps) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter((item) =>
      `${item.label} ${item.description} ${item.category}`.toLowerCase().includes(normalized)
    );
  }, [items, query]);

  return (
    <>
      {isPanelOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/25"
          onClick={() => setIsPanelOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      <aside
        className={`border-border-subtle bg-bg-surface fixed top-0 left-0 z-50 flex h-screen w-[360px] max-w-[92vw] flex-col overflow-hidden border-r p-5 shadow-2xl transition-transform duration-300 ${isPanelOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-hidden={!isPanelOpen}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-text-primary text-base font-semibold">Layout Controls</h2>
          <button
            type="button"
            onClick={() => setIsPanelOpen(false)}
            className="text-text-muted hover:text-text-primary hover:bg-bg-hover rounded-md px-2 py-1 text-sm"
          >
            Close
          </button>
        </div>
        <div className="min-h-0 flex-1 space-y-5 overflow-auto pr-1">
          <ThemeControls
            showHexInput
            surface={SurfaceVariantEnum.PLAIN}
            orientation={ThemeControlsOrientationEnum.VERTICAL}
          />
          <div className="space-y-2">
            <p className="text-text-secondary text-sm font-medium">Search components</p>
            <SearchInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onClear={() => setQuery('')}
              placeholder="Search by name or category"
            />
          </div>
          <div className="border-border-subtle rounded-lg border p-2">
            <div className="space-y-1">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectItem(item.id);
                    setIsPanelOpen(false);
                  }}
                  className="hover:bg-bg-hover w-full rounded-md px-3 py-2 text-left"
                >
                  <div className="text-text-primary text-sm font-medium">{item.label}</div>
                  <div className="text-text-muted text-xs">{item.category} · {item.description}</div>
                </button>
              ))}
              {filteredItems.length === 0 ? (
                <p className="text-text-muted px-3 py-2 text-xs">No matching components.</p>
              ) : null}
            </div>
          </div>
        </div>
      </aside>

      <header className="space-y-6 rounded-lg border border-border/60 bg-white p-6 shadow-lg transition-colors duration-200 dark:border-zinc-700 dark:bg-zinc-800 night:border-[#2d4a48] night:bg-[#111f2c]/95 night:shadow-black/35">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => setIsPanelOpen(true)}
            className="text-text-primary border-border-subtle hover:bg-bg-hover mt-1 inline-flex h-9 w-9 items-center justify-center rounded-md border"
            aria-label="Open layout controls"
            title="Open theme controls and search"
          >
            {ControlsSearchIcon}
          </button>
          <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 night:text-slate-400">
            {mode === 'Consumer' ? 'Consumer Preview · Tailwind CSS v4' : 'Live component development with hot reload'}
          </p>
          <h1 className="mt-1 text-3xl font-bold text-black dark:text-white night:text-white">{title}</h1>
          </div>
        </div>
        {activeTab && (
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400 night:text-slate-400">Active tab</div>
            <div className="font-semibold capitalize text-black dark:text-white night:text-white">{activeTab}</div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-6 flex-1">
        {children}
      </div>
      </header>
    </>
  );
};

