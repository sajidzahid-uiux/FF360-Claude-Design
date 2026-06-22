import type { FieldFlowSettingsSection } from './FieldFlowSettingsLayout';

function SettingsSectionBlock({
  section,
  onLinkNavigate,
}: {
  section: FieldFlowSettingsSection;
  onLinkNavigate?: () => void;
}) {
  const hasSectionHeader = Boolean(section.icon || section.title?.trim());

  return (
    <section className="border-border-subtle/80 border-b px-2 py-3 last:border-b-0">
      {hasSectionHeader ? (
        <div className="text-text-primary mb-2 flex h-8 items-center gap-2 px-2 text-sm font-semibold">
          {section.icon ? (
            <span className="text-text-secondary inline-flex h-4 w-4">{section.icon}</span>
          ) : null}
          {section.title ? <span>{section.title}</span> : null}
        </div>
      ) : null}

      <nav className="space-y-1">
        {section.links.map((link) => (
          <a
            key={link.id}
            href={link.href}
            onClick={(event) => {
              if (link.onSelect) {
                event.preventDefault();
                link.onSelect();
              }
              onLinkNavigate?.();
            }}
            aria-current={link.isActive ? 'page' : undefined}
            className={`flex min-h-10 items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              link.isActive
                ? 'bg-accent/30 text-text-primary'
                : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
            }`}
          >
            <span>{link.title}</span>
          </a>
        ))}
      </nav>
    </section>
  );
}

export interface SettingsNavPanelProps {
  sections: FieldFlowSettingsSection[];
  onLinkNavigate?: () => void;
}

export function SettingsNavPanel({ sections, onLinkNavigate }: SettingsNavPanelProps) {
  return (
    <>
      {sections.map((section) => (
        <SettingsSectionBlock
          key={section.id}
          section={section}
          onLinkNavigate={onLinkNavigate}
        />
      ))}
    </>
  );
}
