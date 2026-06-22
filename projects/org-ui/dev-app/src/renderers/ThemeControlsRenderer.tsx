import {
  SurfaceVariantEnum,
  ThemeControls,
  ThemeControlsOrientationEnum,
} from '@fieldflow360/org-ui';
import { CodePreview } from '../ui-app/ui-app-components';
import { Section } from '../ui-app/ui-app-components/Section';

export const ThemeControlsRenderer = () => {
  return (
    <>
      <Section>
        <h2 className="mb-2 text-2xl font-semibold text-black dark:text-white night:text-white">
          ThemeControls
        </h2>
        <p className="mb-8 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-400 night:text-slate-400">
          Unified appearance (light, dark, night) and accent controls from{' '}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs dark:bg-zinc-900 night:bg-[#142433] night:text-slate-200">
            @fieldflow360/org-ui
          </code>
          . Requires{' '}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs dark:bg-zinc-900 night:bg-[#142433] night:text-slate-200">
            ThemeProvider
          </code>{' '}
          — values sync with the header controls above.
        </p>

        <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 night:text-slate-400">
          Elevated panel (default)
        </h3>
        <CodePreview
          title="ThemeControls default"
          code={`<ThemeControls showHexInput />`}
        />
        <ThemeControls showHexInput />
      </Section>

      <Section>
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 night:text-slate-400">
          Plain surface · toolbar style
        </h3>
        <p className="mb-6 max-w-2xl text-sm text-gray-600 dark:text-gray-400 night:text-slate-400">
          Use <code className="font-mono text-xs">surface=&quot;plain&quot;</code> when embedding in an existing card or header.
        </p>
        <CodePreview
          title="ThemeControls plain"
          code={`<ThemeControls
  surface={SurfaceVariantEnum.PLAIN}
  showHexInput
/>`}
        />
        <ThemeControls
          surface={SurfaceVariantEnum.PLAIN}
          showHexInput
          className="max-w-xl border border-dashed border-border/80 p-4 dark:border-zinc-600 night:border-slate-600"
        />
      </Section>

      <Section>
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 night:text-slate-400">
          Vertical layout
        </h3>
        <CodePreview
          title="ThemeControls vertical"
          code={`<ThemeControls
  showHexInput
  orientation={ThemeControlsOrientationEnum.VERTICAL}
/>`}
        />
        <ThemeControls showHexInput orientation={ThemeControlsOrientationEnum.VERTICAL} />
      </Section>
    </>
  );
};
