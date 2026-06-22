import {
  Button,
  ButtonVariantEnum,
  cn,
  ComponentSizeEnum,
  Dropdown,
  SearchSelect,
} from '@fieldflow360/org-ui';
import { useState } from 'react';
import { CodePreview } from '../ui-app/ui-app-components';
import { Section } from '../ui-app/ui-app-components/Section';


const COUNTRIES = [
  { value: 'lb', label: 'Lebanon', description: 'Beirut' },
  { value: 'us', label: 'United States', description: 'Washington, D.C.' },
  { value: 'fr', label: 'France', description: 'Paris' },
  { value: 'es', label: 'Spain', description: 'Madrid' },
] as const;

type CountryOption = (typeof COUNTRIES)[number];

const EditIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 2.651 2.651M9 13.5l6.95-6.95a1.875 1.875 0 1 1 2.652 2.652L11.652 16.152a4.5 4.5 0 0 1-1.897 1.13L6.75 18l.718-3.005A4.5 4.5 0 0 1 8.6 13.1Z" />
  </svg>
);
const CopyIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8.25 7.5A2.25 2.25 0 0 1 10.5 5.25h7.5A2.25 2.25 0 0 1 20.25 7.5v10.5A2.25 2.25 0 0 1 18 20.25h-7.5A2.25 2.25 0 0 1 8.25 18Zm-4.5-1.125A2.625 2.625 0 0 1 6.375 3.75H14.25a.75.75 0 0 1 0 1.5H6.375c-.621 0-1.125.504-1.125 1.125V15a.75.75 0 0 1-1.5 0Z" />
  </svg>
);
const ArchiveIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3.75 4.5A2.25 2.25 0 0 1 6 2.25h12A2.25 2.25 0 0 1 20.25 4.5v2.25H3.75ZM3.75 8.25h16.5V18A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18Zm5.25 4.5a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 0-1.5Z" />
  </svg>
);

export const DropdownRenderer = () => {
  const [country, setCountry] = useState<CountryOption['value']>('lb');
  const [menuAction, setMenuAction] = useState<'edit' | 'archive' | 'duplicate'>('edit');
  const [searchableCountry, setSearchableCountry] =
    useState<CountryOption['value']>('us');

  return (
    <>
      <Section>
        <h2 className="mb-6 text-2xl font-semibold text-black dark:text-white night:text-white">
          Dropdown
        </h2>
        <CodePreview
          title="Basic Dropdown"
          code={`<Dropdown
  label="Country"
  value={country}
  onChange={setCountry}
  options={[
    { value: 'lb', label: 'Lebanon' },
    { value: 'us', label: 'United States' },
  ]}
/>`}
        />

        <div className="max-w-md space-y-4">
          <Dropdown
            label="Country"
            value={country}
            onChange={setCountry}
            helperText="Use arrow keys and Enter for keyboard navigation"
            options={[
              ...COUNTRIES,
            ]}
          />

          <p className="text-sm text-gray-600 dark:text-gray-400 night:text-slate-400">
            Selected: <span className="font-semibold">{country.toUpperCase()}</span>
          </p>
        </div>
      </Section>

      <Section>
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 night:text-slate-400">
          Search select (input + list)
        </h3>
        <CodePreview
          title="SearchSelect"
          code={`<SearchSelect
  label="Country"
  value={country}
  onChange={setCountry}
  searchPlaceholder="Search country..."
  options={COUNTRIES}
/>`}
        />
        <div className="max-w-md space-y-4">
          <SearchSelect
            label="Country"
            value={searchableCountry}
            onChange={setSearchableCountry}
            searchPlaceholder="Search country..."
            options={[...COUNTRIES]}
          />
          <p className="text-sm text-gray-600 dark:text-gray-400 night:text-slate-400">
            Selected: <span className="font-semibold">{searchableCountry.toUpperCase()}</span>
          </p>
        </div>
      </Section>

      <Section>
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 night:text-slate-400">
          Validation and disabled options
        </h3>
        <CodePreview
          title="Dropdown with error"
          code={`<Dropdown
  label="Plan"
  placeholder="Choose a plan"
  error="Please select an available plan"
  options={[
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro', disabled: true },
    { value: 'enterprise', label: 'Enterprise' },
  ]}
/>`}
        />
        <div className="max-w-md space-y-4">
          <Dropdown
            label="Plan"
            placeholder="Choose a plan"
            error="Please select an available plan"
            options={[
              { value: 'free', label: 'Free', description: 'Starter plan' },
              { value: 'pro', label: 'Pro', description: 'Recommended', disabled: true },
              { value: 'enterprise', label: 'Enterprise', description: 'Custom setup' },
            ]}
          />
        </div>
      </Section>

      <Section>
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 night:text-slate-400">
          Tiny trigger (15px) + fixed menu width
        </h3>
        <CodePreview
          title="Custom tiny trigger"
          code={`<Dropdown
  fullWidth={false}
  menuMinWidth={220}
  trigger={() => <button className="h-[15px] w-[15px] rounded-sm bg-zinc-800" />}
  options={actionOptions}
/>`}
        />
        <div className="flex items-start gap-4">
          <Dropdown
            value={menuAction}
            onChange={setMenuAction}
            fullWidth={false}
            triggerClassName="inline-flex"
            menuMinWidth={220}
            trigger={() => (
              <button
                type="button"
                aria-label="Open tiny menu"
                className="h-[15px] w-[15px] rounded-sm bg-zinc-800 dark:bg-zinc-200"
              />
            )}
            options={[
              { value: 'edit', label: 'Edit row', icon: EditIcon },
              { value: 'duplicate', label: 'Duplicate row', icon: CopyIcon },
              { value: 'archive', label: 'Archive row', icon: ArchiveIcon },
            ]}
          />
          <p className="text-sm text-gray-600 dark:text-gray-400 night:text-slate-400">
            Trigger keeps 15px width; menu width is independent.
          </p>
        </div>
      </Section>

      <Section>
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 night:text-slate-400">
          Button trigger (table-actions style)
        </h3>
        <CodePreview
          title="Dropdown with button trigger"
          code={`<Dropdown
  fullWidth={false}
  trigger={({ isOpen }) => (
    <Button title={isOpen ? 'Close actions' : 'Actions'} />
  )}
  options={actionOptions}
/>`}
        />
        <div className="flex items-start gap-4">
          <Dropdown
            value={menuAction}
            onChange={setMenuAction}
            fullWidth={false}
            triggerClassName="inline-flex"
            trigger={({ isOpen }) => (
              <Button
                variant={ButtonVariantEnum.COLORED}
                backgroundColor="white"
                darkBackgroundColor="zinc-800"
                size={ComponentSizeEnum.SM}
                title={isOpen ? 'Close actions' : 'Actions'}
                rightIcon={
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={isOpen ? 'rotate-180 transition-transform' : 'transition-transform'}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                }
              />
            )}
            options={[
              { value: 'edit', label: 'Edit row', icon: EditIcon },
              { value: 'duplicate', label: 'Duplicate row', icon: CopyIcon },
              { value: 'archive', label: 'Archive row', icon: ArchiveIcon },
            ]}
          />
          <p className="text-sm text-gray-600 dark:text-gray-400 night:text-slate-400">
            Selected action: <span className="font-semibold capitalize">{menuAction}</span>
          </p>
        </div>
      </Section>

      <Section>
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 night:text-slate-400">
          Icon trigger (three dots, no chevron)
        </h3>
        <CodePreview
          title="Icon-only trigger"
          code={`<Dropdown
  fullWidth={false}
  trigger={() => <Button iconOnly leftIcon={<DotsIcon />} />}
  options={actionOptions}
/>`}
        />
        <div className="flex items-start gap-4">
          <Dropdown
            value={menuAction}
            onChange={setMenuAction}
            fullWidth={false}
            triggerClassName="inline-flex"
            trigger={({ isOpen }) => (
              <Button
                variant={ButtonVariantEnum.GHOST}
                size={ComponentSizeEnum.SM}
                iconOnly
                className={cn(
                  'border bg-transparent',
                  isOpen ? 'border-accent' : 'border-transparent',
                  'hover:bg-transparent dark:hover:bg-transparent night:hover:bg-transparent',
                  'focus:ring-accent/45 night:focus:ring-accent/60 focus:border-accent night:focus:border-accent'
                )}
                aria-label={isOpen ? 'Close actions menu' : 'Open actions menu'}
                leftIcon={
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="5" cy="12" r="1.8" />
                    <circle cx="12" cy="12" r="1.8" />
                    <circle cx="19" cy="12" r="1.8" />
                  </svg>
                }
              />
            )}
            options={[
              { value: 'edit', label: 'Edit row', icon: EditIcon },
              { value: 'duplicate', label: 'Duplicate row', icon: CopyIcon },
              { value: 'archive', label: 'Archive row', icon: ArchiveIcon },
            ]}
          />
          <p className="text-sm text-gray-600 dark:text-gray-400 night:text-slate-400">
            Open state is reflected by accent trigger fill.
          </p>
        </div>
      </Section>
    </>
  );
};
