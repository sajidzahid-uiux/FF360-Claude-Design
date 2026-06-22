import { Button, ComponentSizeEnum, Modal } from '@fieldflow360/org-ui';
import { useState } from 'react';
import { CodePreview } from '../ui-app/ui-app-components';
import { Section } from '../ui-app/ui-app-components/Section';

export const ModalRenderer = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Section>
        <h2 className="mb-6 text-2xl font-semibold text-black dark:text-white night:text-white">
          Modal
        </h2>
        <CodePreview
          title="Modal usage"
          code={`<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Boundary Stats"
  size="lg"
>
  <YourContent />
</Modal>`}
        />
        <Button
          title="Open modal"
          size={ComponentSizeEnum.SM}
          onClick={() => setIsOpen(true)}
        />
      </Section>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Simple modal"
        size="lg"
      >
        <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300 night:text-slate-300">
          <p>
            This modal is ported from Tile Design and aligned to org-ui theme tokens.
          </p>
          <p>
            Use it for generic content modals where `AppFormModal` or `Dialog` is too opinionated.
          </p>
        </div>
      </Modal>
    </>
  );
};
