import {
  AppBreadcrumbs,
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  SearchInput,
} from '@fieldflow360/org-ui';
import Link from 'next/link';
import { useState } from 'react';
import { CodePreview } from '../ui-app/ui-app-components';
import { Section } from '../ui-app/ui-app-components/Section';

function IconLink({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
      />
    </svg>
  );
}

function IconPencil({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
      />
    </svg>
  );
}

function IconTrash({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" />
    </svg>
  );
}

const sampleItems = [
  { id: 'org', label: 'Organizations', href: '/organizations/1/analytics' },
  { id: 'farm', label: 'North Valley Farm', href: '/organizations/1/farms/2' },
  { id: 'job', label: 'Job #42', isCurrent: true },
] as const;

export const AppBreadcrumbsRenderer = () => {
  const [query, setQuery] = useState('');

  return (
    <Section>
      <h2 className="mb-4 text-2xl font-semibold text-black dark:text-white night:text-white">
        AppBreadcrumbs
      </h2>
      <p className="mb-8 max-w-3xl text-sm leading-relaxed text-gray-600 dark:text-gray-400 night:text-slate-400">
        Trail of links for hierarchy navigation. Optional{' '}
        <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs dark:bg-zinc-900 night:bg-[#142433]">
          toolbar
        </code>{' '}
        renders at the end of the row (right-aligned) for status text, search/filter, or icon-only action buttons
        (use <code className="font-mono text-xs">Button</code> with <code className="font-mono text-xs">iconOnly</code> and{' '}
        <code className="font-mono text-xs">aria-label</code> — do not use the <code className="font-mono text-xs">title</code> prop
        with <code className="font-mono text-xs">iconOnly</code>; in org-ui, <code className="font-mono text-xs">title</code> is reserved for
        visible button text). In apps that use{' '}
        <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs dark:bg-zinc-900 night:bg-[#142433]">
          FieldFlowAppLayout
        </code>{' '}
        without a custom <code className="font-mono text-xs">breadcrumbRenderer</code>, pass{' '}
        <code className="font-mono text-xs">breadcrumbToolbar</code> instead.
      </p>

      <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 night:text-slate-400">
        Basic (items only)
      </h3>
      <CodePreview
        title="Minimal usage"
        code={`import { AppBreadcrumbs } from '@fieldflow360/org-ui';
import Link from 'next/link';

const items = [
  { id: 'a', label: 'Analytics', href: '/organizations/1/analytics' },
  { id: 'b', label: 'Settings', isCurrent: true },
];

<AppBreadcrumbs
  items={items}
  linkComponent={(props) => (
    <Link href={props.href} className={props.className} onClick={props.onClick}>
      {props.children}
    </Link>
  )}
/>`}
      />
      <div className="border-border-subtle bg-bg-surface-elevated mb-10 rounded-xl border px-4 py-3">
        <AppBreadcrumbs
          items={[...sampleItems]}
          leadingIcon={<IconLink className="h-5 w-5" />}
          linkComponent={(props) => (
            <Link
              href={props.href ?? '#'}
              className={props.className}
              onClick={props.onClick}
              aria-current={props['aria-current']}
            >
              {props.children}
            </Link>
          )}
        />
      </div>

      <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 night:text-slate-400">
        With toolbar (icon actions + filter)
      </h3>
      <CodePreview
        title="toolbar prop"
        code={`import { AppBreadcrumbs, Button, ButtonVariantEnum, SearchInput } from '@fieldflow360/org-ui';

<AppBreadcrumbs
  items={breadcrumbItems}
  linkComponent={...}
  toolbar={
    <>
      <span className="text-text-muted text-xs">Generation: idle</span>
      <SearchInput
        className="w-44"
        placeholder="Filter…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onClear={() => setQuery('')}
      />
      <Button
        iconOnly
        aria-label="Edit"
        variant={ButtonVariantEnum.SURFACE}
        size={ComponentSizeEnum.SM}
        leftIcon={<YourEditSvg />}
      />
      <Button
        iconOnly
        aria-label="Delete"
        variant={ButtonVariantEnum.DELETE}
        size={ComponentSizeEnum.SM}
        leftIcon={<YourDeleteSvg />}
      />
    </>
  }
/>`}
      />
      <div className="border-border-subtle bg-bg-surface-elevated rounded-xl border px-4 py-3">
        <AppBreadcrumbs
          items={[...sampleItems]}
          linkComponent={(props) => (
            <Link
              href={props.href ?? '#'}
              className={props.className}
              onClick={props.onClick}
              aria-current={props['aria-current']}
            >
              {props.children}
            </Link>
          )}
          toolbar={
            <>
              <span className="text-text-muted hidden text-xs sm:inline">Generation: idle</span>
              <SearchInput
                className="w-40 min-w-0 sm:w-48"
                placeholder="Filter…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onClear={() => setQuery('')}
                aria-label="Filter demo"
              />
              <Button
                variant={ButtonVariantEnum.SURFACE}
                size={ComponentSizeEnum.SM}
                iconOnly
                aria-label="Edit"
                leftIcon={<IconPencil className="h-4 w-4" />}
              />
              <Button
                variant={ButtonVariantEnum.DELETE}
                size={ComponentSizeEnum.SM}
                iconOnly
                aria-label="Delete"
                leftIcon={<IconTrash className="h-4 w-4" />}
              />
            </>
          }
        />
      </div>

      <h3 className="mb-3 mt-10 text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 night:text-slate-400">
        FieldFlowAppLayout integration
      </h3>
      <CodePreview
        title="breadcrumbToolbar on layout (no custom renderer)"
        code={`import { FieldFlowAppLayout } from '@fieldflow360/org-ui';

<FieldFlowAppLayout
  appTitle="Tile Design"
  logo={...}
  user={...}
  userMenuActions={...}
  breadcrumbs={[
    { id: 'farms', label: 'Farms', href: '/organizations/1/farms' },
    { id: 'field', label: 'Field A', isCurrent: true },
  ]}
  breadcrumbToolbar={
    <div className="flex items-center gap-2">
      <JobGenerationStatus />
      <SearchInput ... />
      <Button iconOnly aria-label="Edit" onClick={onEdit} leftIcon={<EditIcon />} />
      <Button iconOnly aria-label="Delete" onClick={onDelete} leftIcon={<DeleteIcon />} />
    </div>
  }
  breadcrumbLinkComponent={(props) => <Link ... />}
>
  {children}
</FieldFlowAppLayout>`}
      />
      <p className="text-text-muted mt-3 max-w-3xl text-xs leading-relaxed">
        If you pass <code className="font-mono">breadcrumbRenderer</code>, the layout does not inject{' '}
        <code className="font-mono">breadcrumbToolbar</code> — compose{' '}
        <code className="font-mono">{'<AppBreadcrumbs toolbar={...} />'}</code> yourself inside the renderer (same
        pattern as Tile Design header slot).
      </p>
    </Section>
  );
};
