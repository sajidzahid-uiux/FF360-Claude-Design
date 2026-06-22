import {
  NavExpandableMenuItem,
  NavGroupLink,
  SidebarCollapseButton,
  SidebarHeader,
} from '@fieldflow360/org-ui';
import { useState } from 'react';
import { CodePreview } from '../ui-app/ui-app-components';
import { Section } from '../ui-app/ui-app-components/Section';

const HomeIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776 12 3l8.25 6.776v10.099A2.125 2.125 0 0 1 18.125 22H5.875A2.125 2.125 0 0 1 3.75 19.875V9.776Z" />
  </svg>
);

export const SidebarPrimitivesRenderer = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState<'dashboard' | 'org-settings' | 'user-settings'>(
    'dashboard'
  );
  const [isToolsExpanded, setIsToolsExpanded] = useState(true);

  return (
    <Section>
      <h2 className="mb-6 text-2xl font-semibold text-black dark:text-white night:text-white">
        Sidebar Primitives
      </h2>
      <CodePreview
        title="SidebarHeader + NavGroupLink + SidebarCollapseButton"
        code={`<SidebarHeader title="FieldFlow" logo={<span>FF</span>} />
<NavGroupLink
  href="/dashboard"
  isActive
  isCollapsed={false}
  icon={<HomeIcon />}
  title="Dashboard"
/>
<SidebarCollapseButton
  isCollapsed={collapsed}
  onToggle={() => setCollapsed((v) => !v)}
/>`}
      />
      <CodePreview
        title="NavExpandableMenuItem"
        code={`<NavExpandableMenuItem
  id="tools"
  title="Tools"
  icon={<HomeIcon />}
  isExpanded={expanded}
  onExpandedChange={setExpanded}
  items={[
    { id: 'org', href: '/settings/org', title: 'Organization settings', icon, isActive },
    { id: 'user', href: '/settings/user', title: 'User settings', icon },
  ]}
/>`}
      />

      <div className="space-y-3">
        <div className="overflow-hidden rounded-lg border border-border-subtle">
          <SidebarHeader
            title="FieldFlow"
            logo={
              <span className="text-xs font-black leading-none" aria-hidden="true">
                FF
              </span>
            }
            isCollapsed={collapsed}
          />
        </div>
        <div className="rounded-lg border border-border-subtle p-2">
          <p className="text-text-muted mb-2 px-2 text-xs font-medium uppercase tracking-wide">
            NavGroupLink in action
          </p>
          <div className="space-y-1">
            <NavGroupLink
              href="#dashboard"
              isActive={activeItem === 'dashboard'}
              isCollapsed={collapsed}
              icon={HomeIcon}
              title="Dashboard"
              onClick={(e) => {
                e.preventDefault();
                setActiveItem('dashboard');
              }}
            />
          </div>
        </div>
        <div className="rounded-lg border border-border-subtle p-2">
          <p className="text-text-muted mb-2 px-2 text-xs font-medium uppercase tracking-wide">
            NavExpandableMenuItem
          </p>
          <NavExpandableMenuItem
            id="tools"
            title="Tools"
            icon={HomeIcon}
            isCollapsed={collapsed}
            isExpanded={isToolsExpanded}
            onExpandedChange={setIsToolsExpanded}
            items={[
              {
                id: 'org-settings',
                href: '#org-settings',
                title: 'Organization settings',
                icon: HomeIcon,
                isActive: activeItem === 'org-settings',
                onClick: (e) => {
                  e.preventDefault();
                  setActiveItem('org-settings');
                },
              },
              {
                id: 'user-settings',
                href: '#user-settings',
                title: 'User settings',
                icon: HomeIcon,
                isActive: activeItem === 'user-settings',
                onClick: (e) => {
                  e.preventDefault();
                  setActiveItem('user-settings');
                },
              },
            ]}
          />
        </div>
        <div className="pt-2">
          <SidebarCollapseButton
            isCollapsed={collapsed}
            onToggle={() => setCollapsed((v) => !v)}
          />
        </div>
      </div>
    </Section>
  );
};
