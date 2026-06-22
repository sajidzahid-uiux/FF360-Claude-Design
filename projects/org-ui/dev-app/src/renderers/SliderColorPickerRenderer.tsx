import { ColorPicker, Slider } from '@fieldflow360/org-ui';
import { useMemo, useState } from 'react';

import { CodePreview } from '../ui-app/ui-app-components';
import { Section } from '../ui-app/ui-app-components/Section';

export const SliderColorPickerRenderer = () => {
  const [opacity, setOpacity] = useState(72);
  const [accent, setAccent] = useState('#DFFF86');

  const panelStyle = useMemo(
    () => ({
      background: `linear-gradient(145deg, color-mix(in srgb, ${accent} 28%, var(--color-bg-surface-elevated)) 0%, var(--color-bg-surface-elevated) 100%)`,
      opacity: Math.max(0.2, opacity / 100),
    }),
    [accent, opacity]
  );

  return (
    <Section>
      <h2 className="mb-6 text-2xl font-semibold text-black dark:text-white night:text-white">
        Slider & Color Picker
      </h2>

      <CodePreview
        title="Modern slider + accent color picker"
        code={`const [opacity, setOpacity] = useState(72);
const [accent, setAccent] = useState('#DFFF86');

<Slider
  label="Layer transparency"
  value={opacity}
  min={0}
  max={100}
  onChange={setOpacity}
  formatValue={(value) => \`\${value}%\`}
/>

<ColorPicker
  label="Accent color"
  value={accent}
  onChange={setAccent}
/>`}
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="border-border-subtle bg-bg-surface rounded-xl border p-5">
          <Slider
            label="Layer transparency"
            value={opacity}
            min={0}
            max={100}
            onChange={setOpacity}
            formatValue={(value) => `${value}%`}
          />
          <div className="mt-6 space-y-8">
            <ColorPicker label="Accent color" value={accent} onChange={setAccent} />
            <div>
              <p className="text-text-secondary mb-3 text-sm font-medium">Picker only</p>
              <ColorPicker
                value={accent}
                onChange={setAccent}
                showSwatches={false}
                showHeader={false}
              />
            </div>
          </div>
        </div>

        <div className="border-border-subtle rounded-xl border p-5">
          <p className="text-text-secondary mb-4 text-sm font-medium">Live preview</p>
          <div
            className="h-40 rounded-xl border border-white/30 transition-[background,opacity] duration-300"
            style={panelStyle}
          />
        </div>
      </div>
    </Section>
  );
};
