import { Avatar } from '@fieldflow360/org-ui';
import { CodePreview } from '../ui-app-components';
import { Section } from '../ui-app-components/Section';

export const AvatarRenderer = () => {
  return (
    <>
      <Section>
        <h2 className="mb-6 text-2xl font-semibold text-black dark:text-white night:text-white">
          Avatar
        </h2>
        <CodePreview
          title="Avatar usage"
          code={`import { Avatar } from '@fieldflow360/org-ui';

<Avatar src="https://i.pravatar.cc/64?img=12" alt="User profile" fallback="JD" size="sm" />
<Avatar fallback="MS" />
<Avatar fallback="AB" size={52} />`}
        />
        <div className="flex items-center gap-6">
          <Avatar
            src="https://i.pravatar.cc/64?img=12"
            alt="User profile"
            fallback="JD"
            size="sm"
          />
          <Avatar fallback="MS" />
          <Avatar
            src="https://i.pravatar.cc/96?img=25"
            alt="Organization logo"
            fallback="FF"
            size="lg"
          />
          <Avatar fallback="AB" size={52} />
        </div>
      </Section>
    </>
  );
};

