import { NavGroupLink } from '@fieldflow360/org-ui';
import Link from 'next/link';
import { CSSProperties, MouseEvent, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { OrganizationSettingsItem, SidebarItem, UserSettingsItem } from './sidebarConfig';

const CATEGORY_LABELS: Record<SidebarItem['category'], string> = {
  'ui-components': 'UI Components',
  widgets: 'Widgets',
  'system-components': 'System Components',
};
const SIDEBAR_SCROLL_STORAGE_KEY = 'org-ui-dev-sidebar-scroll-top';

interface SidebarProps {
  items: SidebarItem[];
  userSettingsItems: UserSettingsItem[];
  organizationSettingsItems: OrganizationSettingsItem[];
  activeTab: string;
  activeSection: 'components' | 'user-settings' | 'organization-settings';
  onTabChange: (tabId: string) => void;
  getItemHref: (item: SidebarItem) => string;
  getOrganizationSettingsHref: (item: OrganizationSettingsItem) => string;
  userSettingsRootHref: string;
  shouldAutoSelectFallback?: boolean;
  isCollapsed?: boolean;
  onRequestExpand?: () => void;
}

export const Sidebar = ({
  items,
  userSettingsItems,
  organizationSettingsItems,
  activeTab,
  activeSection,
  onTabChange,
  getItemHref,
  getOrganizationSettingsHref,
  userSettingsRootHref,
  shouldAutoSelectFallback = true,
  isCollapsed = false,
  onRequestExpand,
}: SidebarProps) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const getGroupForTab = useCallback(
    (tabId: string): NonNullable<SidebarItem['group']> | null => {
      const activeItem = items.find((item) => item.id === tabId);
      return activeItem?.group ?? null;
    },
    [items]
  );
  const groupLabels: Record<NonNullable<SidebarItem['group']>, string> = {
    controls: 'Controls',
    files: 'Files',
    'org-widgets': 'Org Widgets',
    theme: 'Theme',
  };
  const [expandedGroup, setExpandedGroup] = useState<NonNullable<SidebarItem['group']> | null>(() =>
    getGroupForTab(activeTab)
  );
  const groupedItems = useMemo(
    () =>
      (Object.keys(CATEGORY_LABELS) as Array<SidebarItem['category']>).map((category) => ({
        category,
        label: CATEGORY_LABELS[category],
        items: items.filter((item) => item.category === category),
      })),
    [items]
  );
  const availableOrganizationSettingsItems = useMemo(
    () => organizationSettingsItems.filter((item) => item.available !== false),
    [organizationSettingsItems]
  );

  useEffect(() => {
    if (!shouldAutoSelectFallback) return;
    const exists =
      items.some((item) => item.id === activeTab) ||
      userSettingsItems.some((item) => item.id === activeTab) ||
      organizationSettingsItems.some((item) => item.id === activeTab);
    if (!exists) {
      const firstAvailable = items.find((item) => item.available !== false);
      if (firstAvailable) onTabChange(firstAvailable.id);
    }
  }, [activeTab, items, onTabChange, organizationSettingsItems, shouldAutoSelectFallback, userSettingsItems]);

  useEffect(() => {
    const activeGroup = getGroupForTab(activeTab);
    if (!activeGroup) {
      return;
    }
    setExpandedGroup((prev) => (prev === activeGroup ? prev : activeGroup));
  }, [activeTab, getGroupForTab]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }
    const saved = Number.parseInt(
      window.sessionStorage.getItem(SIDEBAR_SCROLL_STORAGE_KEY) ?? '0',
      10
    );
    if (!Number.isNaN(saved) && saved > 0) {
      container.scrollTop = saved;
    }
  }, []);

  const persistScrollPosition = useCallback(() => {
    const top = scrollContainerRef.current?.scrollTop ?? 0;
    window.sessionStorage.setItem(SIDEBAR_SCROLL_STORAGE_KEY, String(top));
  }, []);

  const renderNextLink = (props: {
    href: string;
    children: ReactNode;
    className?: string;
    onClick?: (event: MouseEvent<HTMLElement>) => void;
    title?: string;
    style?: CSSProperties;
  }) => (
    <Link href={props.href} className={props.className} onClick={props.onClick} title={props.title} style={props.style}>
      {props.children}
    </Link>
  );

  const getItemIcon = (itemId: string) => {
    const iconClass = 'h-4 w-4';
    if (itemId.includes('theme')) return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClass}><path d="M4 7h16M4 12h16M4 17h16" /><circle cx="8" cy="7" r="2" /><circle cx="15" cy="12" r="2" /><circle cx="11" cy="17" r="2" /></svg>;
    if (itemId.includes('file')) return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClass}><path d="M12 16V6m0 0-3 3m3-3 3 3" /><rect x="4" y="16" width="16" height="4" rx="1.5" /></svg>;
    if (itemId.includes('dialog') || itemId.includes('modal')) return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClass}><rect x="3" y="5" width="18" height="14" rx="2" /></svg>;
    return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClass}><circle cx="12" cy="12" r="9" /></svg>;
  };

  const getGroupIcon = (group: NonNullable<SidebarItem['group']>) => {
    const iconClass = 'h-4 w-4';
    if (group === 'files') return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClass}><path d="M12 16V6m0 0-3 3m3-3 3 3" /><rect x="4" y="16" width="16" height="4" rx="1.5" /></svg>;
    return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClass}><path d="M4 7h16M4 12h16M4 17h16" /><circle cx="9" cy="7" r="2" /><circle cx="15" cy="12" r="2" /><circle cx="11" cy="17" r="2" /></svg>;
  };

  return (
    <div className="bg-bg-surface flex h-full min-h-0 w-full flex-col py-2 pl-2">
      <div className="flex min-h-0 flex-1 flex-col pr-2">
        <div
          ref={scrollContainerRef}
          className="min-h-0 flex-1 overflow-auto"
          onScroll={persistScrollPosition}
        >
          <div className={isCollapsed ? 'space-y-2' : 'space-y-3'}>
            {groupedItems.map((group) =>
              group.items.length > 0 ? (
                <div key={group.category}>
                  {!isCollapsed ? <span className="text-text-muted flex h-7 items-center px-2 text-xs font-medium">{group.label}</span> : null}
                  {group.items.filter((item) => !item.group).map((item) => (
                    <div key={item.id} className={item.available === false ? 'pointer-events-none opacity-50' : undefined}>
                      <NavGroupLink href={getItemHref(item)} isActive={activeTab === item.id} isCollapsed={isCollapsed} icon={getItemIcon(item.id)} title={item.label} linkComponent={renderNextLink} onClick={(event) => { event.preventDefault(); persistScrollPosition(); onTabChange(item.id); }} />
                    </div>
                  ))}
                  {[...new Set(group.items.map((item) => item.group).filter(Boolean))].map((groupKey) => {
                    const key = groupKey as NonNullable<SidebarItem['group']>;
                    const childItems = group.items.filter((item) => item.group === key);
                    const isExpanded = expandedGroup === key;
                    const hasActiveChild = childItems.some((item) => item.id === activeTab);
                    if (!childItems.length) return null;
                    return (
                      <div key={key} className={`space-y-1 rounded-md ${isExpanded ? 'bg-accent/20' : ''}`}>
                        <button
                          type="button"
                          onClick={() => {
                            if (isCollapsed) {
                              setExpandedGroup(key);
                              onRequestExpand?.();
                              return;
                            }
                            setExpandedGroup((prev) => (prev === key ? null : key));
                          }}
                          title={isCollapsed ? groupLabels[key] : undefined}
                          className={`relative flex w-full items-center overflow-hidden border-l-2 px-2 py-2 text-sm ${
                            hasActiveChild
                              ? 'border-l-accent bg-accent/20 font-semibold text-text-primary'
                              : isExpanded
                                ? 'border-l-transparent text-text-primary hover:bg-bg-hover'
                                : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary border-l-transparent'
                          } ${isCollapsed ? 'justify-center' : 'justify-between'} transition-colors duration-200`}
                        >
                          <span className="flex items-center"><span className={isCollapsed ? '' : 'mr-2'}>{getGroupIcon(key)}</span>{!isCollapsed && <span>{groupLabels[key]}</span>}</span>
                          {!isCollapsed ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className={`h-3.5 w-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                            >
                              <path d="m9 18 6-6-6-6" />
                            </svg>
                          ) : null}
                        </button>
                        <div className="grid transition-[grid-template-rows,opacity] duration-300 ease-out" style={{ gridTemplateRows: !isCollapsed && isExpanded ? '1fr' : '0fr', opacity: !isCollapsed && isExpanded ? 1 : 0 }}>
                          <div className="overflow-hidden">
                            <div className="ml-3 mt-1 space-y-1">
                              {childItems.map((item) => (
                                <NavGroupLink
                                  key={item.id}
                                  href={getItemHref(item)}
                                  isActive={activeTab === item.id}
                                  isCollapsed={isCollapsed}
                                  icon={getItemIcon(item.id)}
                                  title={item.label}
                                  className={isExpanded && activeTab !== item.id ? 'text-text-primary hover:text-text-primary hover:bg-bg-hover' : undefined}
                                  linkComponent={renderNextLink}
                                  onClick={(event) => { event.preventDefault(); persistScrollPosition(); onTabChange(item.id); }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null
            )}
          </div>
        </div>
      </div>
      <div className="mt-2 shrink-0 pr-2 pt-2">
        {!isCollapsed ? <div className="text-text-muted px-2 pb-1 text-xs font-medium tracking-wide">Tools</div> : null}
        <div className={isCollapsed ? 'space-y-2' : 'space-y-1'}>
          <NavGroupLink
            href={userSettingsRootHref}
            isActive={activeSection === 'user-settings'}
            isCollapsed={isCollapsed}
            icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><circle cx="12" cy="8" r="3" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>}
            title="User Settings"
            linkComponent={renderNextLink}
            onClick={(event) => {
              event.preventDefault();
              persistScrollPosition();
              const firstUserTab = userSettingsItems.find((item) => item.available !== false);
              if (firstUserTab) {
                onTabChange(firstUserTab.id);
              }
            }}
          />
          {availableOrganizationSettingsItems.map((item) => (
            <NavGroupLink key={item.id} href={getOrganizationSettingsHref(item)} isActive={activeTab === item.id} isCollapsed={isCollapsed} icon={getGroupIcon('org-widgets')} title={item.id === 'organization-info-settings' ? 'Organization Settings' : item.label} linkComponent={renderNextLink} onClick={(event) => { event.preventDefault(); persistScrollPosition(); onTabChange(item.id); }} />
          ))}
        </div>
      </div>
    </div>
  );
};

