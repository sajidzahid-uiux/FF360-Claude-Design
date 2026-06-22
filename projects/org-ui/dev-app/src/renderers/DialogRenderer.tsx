import { Button, ComponentSizeEnum, DeleteDialog, Dialog } from '@fieldflow360/org-ui';
import { useState } from 'react';
import { CodePreview } from '../ui-app/ui-app-components';
import { Section } from '../ui-app/ui-app-components/Section';

const InfoIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="h-6 w-6 text-zinc-700 dark:text-zinc-100 night:text-slate-100"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.04-.02a.75.75 0 0 1 1.06.85l-.71 2.84m1.16-7.19a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

export const DialogRenderer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      <Section>
        <h2 className="mb-6 text-2xl font-semibold text-black dark:text-white night:text-white">
          Dialog
        </h2>
        <CodePreview
          title="Dialog usage"
          code={`<Dialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={onConfirm}
  title="Apply changes?"
  description="This will apply your settings."
/>

<DeleteDialog
  isOpen={isDeleteOpen}
  onClose={() => setIsDeleteOpen(false)}
  onConfirm={onDelete}
  title="Delete this dataset?"
/>`}
        />
        <div className="flex flex-wrap gap-3">
          <Button
            title="Open confirmation dialog"
            size={ComponentSizeEnum.SM}
            onClick={() => setIsOpen(true)}
          />
          <Button
            title="Open delete dialog"
            size={ComponentSizeEnum.SM}
            onClick={() => setIsDeleteOpen(true)}
          />
        </div>
      </Section>

      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={() => setIsOpen(false)}
        title="Apply changes?"
        description="This will apply your settings to the current workspace."
        confirmLabel="Apply"
        cancelLabel="Cancel"
        icon={InfoIcon}
      />

      <DeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => {
          setIsLoading(true);
          window.setTimeout(() => {
            setIsLoading(false);
            setIsDeleteOpen(false);
          }, 700);
        }}
        isLoading={isLoading}
        title="Delete this dataset?"
        description="This action cannot be undone."
      />
    </>
  );
};

