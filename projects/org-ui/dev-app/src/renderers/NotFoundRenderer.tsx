import { NotFound } from '@fieldflow360/org-ui';
import { CodePreview } from '../ui-app/ui-app-components';
import { Section } from '../ui-app/ui-app-components/Section';

export const NotFoundRenderer = () => {
  return (
    <Section>
      <h2 className="mb-6 text-2xl font-semibold text-black dark:text-white night:text-white">
        NotFound
      </h2>
      <CodePreview
        title="NotFound usage"
        code={`<NotFound
  title="Page Not Found"
  onBack={() => router.back()}
/>`}
      />
      <NotFound title="Page Not Found" onBack={() => undefined} />
    </Section>
  );
};
