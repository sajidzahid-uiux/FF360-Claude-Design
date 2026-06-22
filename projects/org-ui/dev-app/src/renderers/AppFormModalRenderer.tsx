import { AppFormModal, Button, ComponentSizeEnum, Input } from '@fieldflow360/org-ui';
import { useState } from 'react';
import { CodePreview } from '../ui-app/ui-app-components';
import { Section } from '../ui-app/ui-app-components/Section';

export const AppFormModalRenderer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <>
      <Section>
        <h2 className="mb-6 text-2xl font-semibold text-black dark:text-white night:text-white">
          App Form Modal
        </h2>
        <CodePreview
          title="AppFormModal usage"
          code={`<AppFormModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Invite Member"
  onSubmit={handleSubmit}
  submitLabel="Save"
>
  <Input label="Name" />
  <Input label="Email" type="email" />
</AppFormModal>`}
        />
        <div className="max-w-md">
          <Button
            title="Open modal"
            size={ComponentSizeEnum.SM}
            onClick={() => setIsOpen(true)}
          />
        </div>
      </Section>

      <AppFormModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Invite Member"
        onSubmit={(e) => {
          e.preventDefault();
          setIsSubmitting(true);
          window.setTimeout(() => {
            setIsSubmitting(false);
            setIsOpen(false);
          }, 700);
        }}
        isSubmitting={isSubmitting}
        submitDisabled={!name.trim() || !email.trim()}
        submitLabel="Save"
        width={640}
      >
        <div className="space-y-4">
          <Input
            label="Name"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Email"
            placeholder="john@company.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </AppFormModal>
    </>
  );
};

