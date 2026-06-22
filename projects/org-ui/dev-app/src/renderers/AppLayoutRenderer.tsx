import { CodePreview } from "../ui-app/ui-app-components";
import { Section } from "../ui-app/ui-app-components/Section";

export const AppLayoutRenderer = () => {
  return (
    <Section>
      <h2 className="mb-6 text-2xl font-semibold text-black dark:text-white night:text-white">
        App Layout
      </h2>

      <CodePreview
        title="FieldFlowAppLayout minimal usage (code only)"
        code={`<FieldFlowAppLayout
  appTitle="@fieldflow360/org-ui"
  logo={<span>FF</span>}
  user={{ fullName: "Jane Doe", subtitle: "UI Engineer" }}
  userMenuActions={[
    { id: "profile", label: "Profile", onSelect: () => {} },
    { id: "logout", label: "Log out", onSelect: () => {}, tone: "danger" },
  ]}
  currentPath={pathname}
>
  <YourPageContent />
</FieldFlowAppLayout>`}
      />

      <CodePreview
        title="Per-component config examples (code only)"
        code={`const toolsConfig = createFieldFlowToolsConfig({
  title: "Tools",
  userSettings: {
    enabled: true,
    href: "/settings/user/appearance",
    showThemeControls: true,
  },
  organizationSettings: {
    enabled: true,
    href: "/settings/organization/organization-info",
    options: [
      { id: "organization-danger-zone", title: "Danger Zone", href: "/settings/organization/danger-zone" },
    ],
  },
});

const orgInfo = mapOrganizationToFieldFlow(orgPayload, FieldFlowOrganizationSourceEnum.CMS);
const orgCards = mapOrganizationsToFieldFlow(orgListPayload, FieldFlowOrganizationSourceEnum.TILE_DESIGN);`}
      />

      <CodePreview
        title="Settings mobile layout (master–detail)"
        code={`<FieldFlowSettingsLayout
  config={settingsConfig}
  mobileNavBackLabel="Settings"
>
  <FieldFlowSettingsPageLayout title="Appearance">
    <ThemeControls />
  </FieldFlowSettingsPageLayout>
</FieldFlowSettingsLayout>

// Mark the active page with isActive on the matching link in config.
// Mobile: nav list OR full-width detail + back button — never side-by-side.`}
      />

      <CodePreview
        title="Mobile layout (CMS-style top bar)"
        code={`<FieldFlowAppLayout
  appTitle="Contractor CMS"
  logo={<Logo />}
  hideMobileShellTopBar
  mainTopBar={<TopNavBar onToggleSidebar={toggleMobileSidebar} />}
  mobileShellBarEnd={<NotificationBell />}
  sidebarNav={({ isMobile, closeMobileSidebar }) => (
    <Sidebar onNavigate={isMobile ? closeMobileSidebar : undefined} />
  )}
>
  <Page />
</FieldFlowAppLayout>`}
      />

      <CodePreview
        title="Whole component usage (code + config)"
        code={`const toolsConfig = createFieldFlowToolsConfig({
  organizationSettings: {
    enabled: true,
    options: [
      { id: "organization-billing", title: "Billing", href: "/settings/organization/billing" },
    ],
  },
});

const organization = mapOrganizationToFieldFlow(
  rawOrganization,
  FieldFlowOrganizationSourceEnum.CMS
);

<FieldFlowAppLayout
  appTitle="@fieldflow360/org-ui"
  logo={<span>FF</span>}
  currentPath={pathname}
  user={{ fullName: "Developer", subtitle: "UI Engineer", avatarFallback: "DV" }}
  userMenuActions={[
    { id: "profile", label: "Profile", onSelect: openProfile },
    { id: "logout", label: "Log out", onSelect: logout, tone: "danger" },
  ]}
  toolsConfig={toolsConfig}
  breadcrumbs={[
    { id: "settings", label: "Settings", href: "/settings" },
    { id: "organization", label: "Organization", href: "/settings/organization", isCurrent: true },
  ]}
>
  <OrganizationInfo organization={organization} canEdit onEdit={openEditOrgModal} />
</FieldFlowAppLayout>`}
      />
    </Section>
  );
};

