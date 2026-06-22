import { ComponentSizeEnum, Loader } from '@fieldflow360/org-ui';
import { CodePreview } from '../ui-app/ui-app-components';
import { Section } from '../ui-app/ui-app-components/Section';

export const LoaderRenderer = () => {
  return (
    <Section>
      <h2 className="mb-6 text-2xl font-semibold text-black dark:text-white night:text-white">
        Loader
      </h2>
      <CodePreview
        title="Loader usage"
        code={`<Loader size={ComponentSizeEnum.SM} />
<Loader />
<Loader size={ComponentSizeEnum.LG} />
<Loader text="Loading organizations..." />`}
      />
      <div className="flex flex-wrap items-center gap-4">
        <Loader size={ComponentSizeEnum.SM} centerInContainer={false} />
        <Loader centerInContainer={false} />
        <Loader size={ComponentSizeEnum.LG} centerInContainer={false} />
      </div>
      <div className="border-border-subtle mt-6 flex min-h-[200px] rounded-lg border">
        <Loader text="Loading organizations..." />
      </div>
    </Section>
  );
};
