import { ComponentSizeEnum, Input } from '@fieldflow360/org-ui';
import { useState } from 'react';
import { CodePreview } from '../ui-app-components';
import { Section } from '../ui-app-components/Section';

export const InputRenderer = () => {
  const [email, setEmail] = useState('');
  const [search, setSearch] = useState('');

  const showEmailError = email.length > 0 && !email.includes('@');

  return (
    <>
      <Section>
        <h2 className="mb-6 text-2xl font-semibold text-black dark:text-white night:text-white">
          Input
        </h2>
        <CodePreview
          title="Basic Input"
          code={`<Input
  label="Name"
  placeholder="Enter full name"
  helperText="This will be shown in your profile"
/>`}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Name"
            placeholder="Enter full name"
            helperText="This will be shown in your profile"
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            error={showEmailError ? 'Please enter a valid email address' : undefined}
          />
        </div>
      </Section>

      <Section>
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 night:text-slate-400">
          Sizes
        </h3>
        <CodePreview
          title="Input sizes"
          code={`<Input size={ComponentSizeEnum.SM} />
<Input />
<Input size={ComponentSizeEnum.LG} />`}
        />
        <div className="grid gap-4 md:grid-cols-3">
          <Input label="Small" size={ComponentSizeEnum.SM} placeholder="Small input" />
          <Input label="Medium" size={ComponentSizeEnum.MD} placeholder="Medium input" />
          <Input label="Large" size={ComponentSizeEnum.LG} placeholder="Large input" />
        </div>
      </Section>

      <Section>
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 night:text-slate-400">
          With icons and states
        </h3>
        <CodePreview
          title="Input with icon"
          code={`<Input
  label="Search"
  leftIcon={<SearchIcon />}
  placeholder="Search components"
/>`}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search components"
            leftIcon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35m1.35-5.15a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
              </svg>
            }
          />
          <Input
            label="Disabled"
            placeholder="Disabled value"
            defaultValue="Read only"
            disabled
            rightIcon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m6 2.25a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            }
          />
        </div>
      </Section>
    </>
  );
};
