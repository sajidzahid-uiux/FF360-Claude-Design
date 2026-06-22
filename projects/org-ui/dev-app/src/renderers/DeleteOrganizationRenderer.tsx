import { DeleteOrganization } from '@fieldflow360/org-ui';
import { useState } from 'react';
import { CodePreview } from '../ui-app/ui-app-components';
import { Section } from '../ui-app/ui-app-components/Section';

export const DeleteOrganizationRenderer = () => {
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <Section>
      <h2 className="mb-6 text-2xl font-semibold text-black dark:text-white night:text-white">
        Delete Organization
      </h2>
      <CodePreview
        title="DeleteOrganization usage"
        code={`<DeleteOrganization
  onDelete={async () => {
    await deleteOrganization();
  }}
/>`}
      />
      <DeleteOrganization
        loading={isDeleting}
        onDelete={async () => {
          setIsDeleting(true);
          await new Promise((resolve) => setTimeout(resolve, 900));
          setIsDeleting(false);
        }}
      />
    </Section>
  );
};
