import {
  ComponentSizeEnum,
  CornerRadiusEnum,
  TabsSwitcher,
  TabsSwitcherViewEnum,
} from '@fieldflow360/org-ui';
import { useState } from 'react';
import { CodePreview } from '../ui-app/ui-app-components';
import { Section } from '../ui-app/ui-app-components/Section';

type DemoTab = 'overview' | 'analytics' | 'settings';
type DemoSize = (typeof ComponentSizeEnum)[keyof typeof ComponentSizeEnum];
type DemoRadius = (typeof CornerRadiusEnum)[keyof typeof CornerRadiusEnum];
type DemoView = (typeof TabsSwitcherViewEnum)[keyof typeof TabsSwitcherViewEnum];

export const TabsSwitcherRenderer = () => {
  const [activeTab, setActiveTab] = useState<DemoTab>('overview');
  const [sizeTab, setSizeTab] = useState<DemoSize>(ComponentSizeEnum.MD);
  const [radiusTab, setRadiusTab] = useState<DemoRadius>(CornerRadiusEnum.MD);
  const [viewTab, setViewTab] = useState<DemoView>(TabsSwitcherViewEnum.PILL);

  return (
    <>
      <Section>
        <h2 className="mb-6 text-2xl font-semibold text-black dark:text-white night:text-white">
          TabsSwitcher
        </h2>
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 night:text-slate-400">
          Global controls (applies to all examples)
        </h3>
        <CodePreview
          title="TabsSwitcher controls"
          code={`<TabsSwitcher
  label="Size"
  value={sizeTab}
  onChange={setSizeTab}
  items={[
    { value: ComponentSizeEnum.SM, label: 'Small' },
    { value: ComponentSizeEnum.MD, label: 'Medium' },
    { value: ComponentSizeEnum.LG, label: 'Large' },
  ]}
/>`}
        />
        <div className="grid gap-4 md:grid-cols-3">
          <TabsSwitcher
            label="Size"
            value={sizeTab}
            onChange={(value) => setSizeTab(value)}
            size={ComponentSizeEnum.MD}
            radius={CornerRadiusEnum.MD}
            view={TabsSwitcherViewEnum.PILL}
            items={[
              { value: ComponentSizeEnum.SM, label: 'Small' },
              { value: ComponentSizeEnum.MD, label: 'Medium' },
              { value: ComponentSizeEnum.LG, label: 'Large' },
            ]}
          />
          <TabsSwitcher
            label="Radius"
            value={radiusTab}
            onChange={(value) => setRadiusTab(value)}
            size={ComponentSizeEnum.MD}
            radius={CornerRadiusEnum.MD}
            view={TabsSwitcherViewEnum.PILL}
            items={[
              { value: CornerRadiusEnum.SM, label: 'Sm' },
              { value: CornerRadiusEnum.MD, label: 'Md' },
              { value: CornerRadiusEnum.LG, label: 'Lg' },
              { value: CornerRadiusEnum.FULL, label: 'Full' },
            ]}
          />
          <TabsSwitcher
            label="View"
            value={viewTab}
            onChange={(value) => setViewTab(value)}
            size={ComponentSizeEnum.MD}
            radius={CornerRadiusEnum.MD}
            view={TabsSwitcherViewEnum.PILL}
            items={[
              { value: TabsSwitcherViewEnum.PILL, label: 'Pill' },
              { value: TabsSwitcherViewEnum.UNDERLINED, label: 'Underlined' },
            ]}
          />
        </div>
      </Section>

      <Section>
        <CodePreview
          title="Basic TabsSwitcher"
          code={`<TabsSwitcher
  value={activeTab}
  onChange={setActiveTab}
  items={[
    { value: 'overview', label: 'Overview' },
    { value: 'analytics', label: 'Analytics' },
    { value: 'settings', label: 'Settings' },
  ]}
/>`}
        />
        <TabsSwitcher
          label="Project sections"
          value={activeTab}
          onChange={setActiveTab}
          size={sizeTab}
          radius={radiusTab}
          view={viewTab}
          items={[
            { value: 'overview', label: 'Overview' },
            { value: 'analytics', label: 'Analytics' },
            { value: 'settings', label: 'Settings' },
          ]}
        />

        <div className="mt-6 rounded-lg border border-border/70 bg-gray-50 p-4 text-sm dark:border-zinc-700 dark:bg-zinc-900 night:border-[#2d4a48] night:bg-[#142433]">
          Active tab: <span className="font-semibold capitalize">{activeTab}</span>
        </div>
      </Section>

      <Section>
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 night:text-slate-400">
          With icons
        </h3>
        <CodePreview
          title="TabsSwitcher with icons"
          code={`<TabsSwitcher
  items={[
    { value: 'overview', label: 'Overview', icon: <HomeIcon /> },
    { value: 'analytics', label: 'Analytics', icon: <ChartIcon /> },
    { value: 'settings', label: 'Settings', icon: <SettingsIcon /> },
  ]}
/>`}
        />
        <TabsSwitcher
          defaultValue="overview"
          size={sizeTab}
          radius={radiusTab}
          view={viewTab}
          items={[
            {
              value: 'overview',
              label: 'Overview',
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776 12 3l8.25 6.776v10.099A2.125 2.125 0 0 1 18.125 22H5.875A2.125 2.125 0 0 1 3.75 19.875V9.776Z" />
                </svg>
              ),
            },
            {
              value: 'analytics',
              label: 'Analytics',
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7.5 15v-4.5m4.5 4.5V6.75M16.5 15V9" />
                </svg>
              ),
            },
            {
              value: 'settings',
              label: 'Settings',
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75m-9.75 12h9.75M3.75 6h1.5m-1.5 12h1.5m9-6h6.75m-6.75 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-9-6a2.25 2.25 0 1 1 0 4.5 2.25 2.25 0 0 1 0-4.5Zm0 8.25a2.25 2.25 0 1 1 0 4.5 2.25 2.25 0 0 1 0-4.5Z" />
                </svg>
              ),
            },
          ]}
        />
      </Section>

      <Section>
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 night:text-slate-400">
          Disabled item
        </h3>
        <CodePreview
          title="Disabled tab item"
          code={`<TabsSwitcher
  defaultValue="overview"
  items={[
    { value: 'overview', label: 'Overview' },
    { value: 'analytics', label: 'Analytics', disabled: true },
    { value: 'settings', label: 'Settings' },
  ]}
/>`}
        />
        <TabsSwitcher
          defaultValue="overview"
          size={sizeTab}
          radius={radiusTab}
          view={viewTab}
          items={[
            { value: 'overview', label: 'Overview' },
            { value: 'analytics', label: 'Analytics', disabled: true },
            { value: 'settings', label: 'Settings' },
          ]}
        />
      </Section>
    </>
  );
};
