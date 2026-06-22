import { ReactNode, useEffect, useMemo, useState } from 'react';
import { FIELD_FLOW_APP_LAYOUT_MOBILE_MEDIA_QUERY } from '../AppLayout/constants';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { SettingsMobileDetailHeader } from './SettingsMobileDetailHeader';
import { SettingsNavPanel } from './SettingsNavPanel';

function resolveMobileBackLabel(
  fallbackLabel: string,
  activeEntry: { section: FieldFlowSettingsSection; link: FieldFlowSettingsLink } | null
): string {
  const sectionTitle = activeEntry?.section.title?.trim();
  if (sectionTitle) return sectionTitle;

  const sectionId = activeEntry?.section.id;
  if (sectionId === 'organization-settings') return 'Organization Settings';
  if (sectionId === 'user-settings') return 'User Settings';

  return fallbackLabel;
}

export interface FieldFlowSettingsLink {
  id: string;
  title: string;
  href: string;
  isActive?: boolean;
  onSelect?: () => void;
}

export interface FieldFlowSettingsSection {
  id: string;
  title: string;
  icon?: ReactNode;
  links: FieldFlowSettingsLink[];
}

export interface FieldFlowSettingsConfig {
  organization?: FieldFlowSettingsSection;
  user?: FieldFlowSettingsSection;
  additionalSections?: FieldFlowSettingsSection[];
}

export interface FieldFlowSettingsLayoutProps {
  config: FieldFlowSettingsConfig;
  children: ReactNode;
  ariaLabel?: string;
  /** CSS media query for mobile master–detail layout (defaults to app layout breakpoint). */
  mobileMediaQuery?: string;
  /** Back button label on mobile detail view (default "Settings"). */
  mobileNavBackLabel?: string;
}

function dedupeSectionLinks(links: FieldFlowSettingsLink[]): FieldFlowSettingsLink[] {
  const seenKeys = new Set<string>();
  const deduped: FieldFlowSettingsLink[] = [];

  for (const link of links) {
    const key = `${link.id}::${link.href}`;
    if (seenKeys.has(key)) {
      continue;
    }
    seenKeys.add(key);
    deduped.push(link);
  }

  return deduped;
}

function dedupeSections(
  sections: FieldFlowSettingsSection[]
): FieldFlowSettingsSection[] {
  return sections.map((section) => ({
    ...section,
    links: dedupeSectionLinks(section.links),
  }));
}

function findActiveSettingsEntry(sections: FieldFlowSettingsSection[]) {
  for (const section of sections) {
    const link = section.links.find((item) => item.isActive);
    if (link) {
      return { section, link };
    }
  }
  return null;
}

export function FieldFlowSettingsLayout({
  config,
  children,
  ariaLabel = 'Settings sections',
  mobileMediaQuery = FIELD_FLOW_APP_LAYOUT_MOBILE_MEDIA_QUERY,
  mobileNavBackLabel = 'Settings',
}: FieldFlowSettingsLayoutProps) {
  const isMobile = useMediaQuery(mobileMediaQuery);

  const sections = useMemo(
    () =>
      dedupeSections([
        ...(config.organization ? [config.organization] : []),
        ...(config.user ? [config.user] : []),
        ...(config.additionalSections ?? []),
      ]),
    [config]
  );

  const activeEntry = useMemo(() => findActiveSettingsEntry(sections), [sections]);
  const hasActiveSettingsPage = Boolean(activeEntry);

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(() => !hasActiveSettingsPage);

  useEffect(() => {
    if (hasActiveSettingsPage) {
      setIsMobileNavOpen(false);
      return;
    }
    setIsMobileNavOpen(true);
  }, [hasActiveSettingsPage]);

  const showMobileNav = isMobile && isMobileNavOpen;
  const showMobileDetail = isMobile && !isMobileNavOpen;

  const closeMobileNav = () => setIsMobileNavOpen(false);
  const openMobileNav = () => setIsMobileNavOpen(true);

  const settingsNav = (
    <SettingsNavPanel sections={sections} onLinkNavigate={isMobile ? closeMobileNav : undefined} />
  );

  const mobileDetailBackLabel = resolveMobileBackLabel(mobileNavBackLabel, activeEntry);

  return (
    <div className="flex h-full w-full flex-col md:flex-row">
      <aside
        className="bg-bg-surface border-border-subtle hidden h-full w-[264px] shrink-0 flex-col border-r md:flex"
        aria-label={ariaLabel}
      >
        <div className="min-h-0 flex-1 overflow-y-auto">{settingsNav}</div>
      </aside>

      {showMobileNav ? (
        <div
          data-testid="ff-settings-mobile-nav"
          className="bg-bg-surface flex h-full min-h-0 w-full flex-col md:hidden"
          aria-label={ariaLabel}
        >
          <div className="border-border-subtle text-text-primary shrink-0 border-b px-4 py-3 text-base font-semibold">
            {mobileNavBackLabel}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">{settingsNav}</div>
        </div>
      ) : null}

      {!isMobile || showMobileDetail ? (
        <div className="bg-bg-main flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {showMobileDetail && activeEntry ? (
            <SettingsMobileDetailHeader
              backLabel={mobileDetailBackLabel}
              onBack={openMobileNav}
            />
          ) : null}
          <div data-testid="ff-settings-content" className="min-h-0 flex-1 overflow-auto">
            {children}
          </div>
        </div>
      ) : null}
    </div>
  );
}
