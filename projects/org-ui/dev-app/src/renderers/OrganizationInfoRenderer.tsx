import { OrganizationInfo } from '@fieldflow360/org-ui';
import { CodePreview } from '../ui-app/ui-app-components';
import { Section } from '../ui-app/ui-app-components/Section';

const DEMO_CREATED_AT = '2026-05-01T10:30:00.000Z';

export const OrganizationInfoRenderer = () => {
  return (
    <Section>
      <h2 className="mb-6 text-2xl font-semibold text-black dark:text-white night:text-white">
        Organization Info
      </h2>
      <CodePreview
        title="OrganizationInfo usage"
        code={`<OrganizationInfo
  organization={{
    name: 'FieldFlow Demo Org',
    email: 'ops@fieldflow.dev',
    phoneNumber: '+1 (555) 0168',
    address: '490 Market Street, San Francisco',
    memberCount: 24,
    createdAt: '${DEMO_CREATED_AT}',
  }}
  canEdit
  onEdit={() => openEditModal()}
/>`}
      />
      <OrganizationInfo
        organization={{
          name: 'FieldFlow Demo Org',
          email: 'ops@fieldflow.dev',
          phoneNumber: '+1 (555) 0168',
          address: '490 Market Street, San Francisco',
          memberCount: 24,
          createdAt: DEMO_CREATED_AT,
        }}
        canEdit
        onEdit={() => undefined}
      />
    </Section>
  );
};
