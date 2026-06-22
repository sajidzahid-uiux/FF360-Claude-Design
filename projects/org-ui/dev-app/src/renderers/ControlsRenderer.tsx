import { Checkbox, ComponentSizeEnum, Radio, Toggle } from '@fieldflow360/org-ui';
import { useState } from 'react';
import { CodePreview } from '../ui-app/ui-app-components';
import { Section } from '../ui-app/ui-app-components/Section';

export const ControlsRenderer = () => {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [mapLabels, setMapLabels] = useState(true);
  const [flowArrows, setFlowArrows] = useState(false);
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [dangerMode, setDangerMode] = useState(false);
  const [radioValue, setRadioValue] = useState<'auto' | 'manual'>('auto');
  const [sizeCheckboxes, setSizeCheckboxes] = useState({
    sm: true,
    md: true,
    lg: true,
  });
  const [sizeToggles, setSizeToggles] = useState({
    sm: true,
    md: true,
    lg: true,
  });
  const [sizeRadioValue, setSizeRadioValue] = useState<'small' | 'medium' | 'large'>('medium');

  return (
    <>
      <Section>
        <h2 className="mb-6 text-2xl font-semibold text-black dark:text-white night:text-white">
          Controls
        </h2>
        <CodePreview
          title="Checkbox + Toggle"
          code={`<Checkbox
  checked={emailAlerts}
  onChange={(e) => setEmailAlerts(e.target.checked)}
  label="Email alerts"
/>

<Toggle
  checked={mapLabels}
  onChange={setMapLabels}
  label="Show map labels"
/>`}
        />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 night:text-slate-400">
              Checkbox
            </h3>
            <Checkbox
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              label="Email alerts"
              helperText="Receive generation status updates by email."
            />
            <Checkbox
              checked={smsAlerts}
              onChange={(e) => setSmsAlerts(e.target.checked)}
              label="SMS alerts"
              helperText="This one is disabled for demo."
              disabled
            />
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 night:text-slate-400">
              Toggle
            </h3>
            <Toggle
              checked={mapLabels}
              onChange={setMapLabels}
              label="Show map labels"
              helperText="Default variant, neutral styling."
              variant="default"
            />
            <Toggle
              checked={flowArrows}
              onChange={setFlowArrows}
              label="Flow arrows"
              helperText="Accent variant for primary interactive controls."
              variant="accent"
            />
          </div>
        </div>
      </Section>

      <Section>
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 night:text-slate-400">
          Sizes
        </h3>
        <CodePreview
          title="Control sizes"
          code={`<Checkbox size={ComponentSizeEnum.SM} />
<Checkbox />
<Checkbox size={ComponentSizeEnum.LG} />

<Toggle size={ComponentSizeEnum.SM} checked onChange={() => {}} />
<Radio size={ComponentSizeEnum.LG} checked onChange={() => {}} />`}
        />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400 night:text-slate-400">
              Checkbox
            </p>
            <Checkbox
              size={ComponentSizeEnum.SM}
              checked={sizeCheckboxes.sm}
              onChange={(event) =>
                setSizeCheckboxes((prev) => ({ ...prev, sm: event.target.checked }))
              }
              label="Small"
            />
            <Checkbox
              size={ComponentSizeEnum.MD}
              checked={sizeCheckboxes.md}
              onChange={(event) =>
                setSizeCheckboxes((prev) => ({ ...prev, md: event.target.checked }))
              }
              label="Medium"
            />
            <Checkbox
              size={ComponentSizeEnum.LG}
              checked={sizeCheckboxes.lg}
              onChange={(event) =>
                setSizeCheckboxes((prev) => ({ ...prev, lg: event.target.checked }))
              }
              label="Large"
            />
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400 night:text-slate-400">
              Toggle
            </p>
            <Toggle
              size={ComponentSizeEnum.SM}
              checked={sizeToggles.sm}
              onChange={(checked) =>
                setSizeToggles((prev) => ({ ...prev, sm: checked }))
              }
              label="Small"
              variant="accent"
            />
            <Toggle
              size={ComponentSizeEnum.MD}
              checked={sizeToggles.md}
              onChange={(checked) =>
                setSizeToggles((prev) => ({ ...prev, md: checked }))
              }
              label="Medium"
              variant="accent"
            />
            <Toggle
              size={ComponentSizeEnum.LG}
              checked={sizeToggles.lg}
              onChange={(checked) =>
                setSizeToggles((prev) => ({ ...prev, lg: checked }))
              }
              label="Large"
              variant="accent"
            />
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400 night:text-slate-400">
              Radio
            </p>
            <Radio
              name="sizes-demo"
              size={ComponentSizeEnum.SM}
              checked={sizeRadioValue === 'small'}
              onChange={() => setSizeRadioValue('small')}
              label="Small"
            />
            <Radio
              name="sizes-demo"
              size={ComponentSizeEnum.MD}
              checked={sizeRadioValue === 'medium'}
              onChange={() => setSizeRadioValue('medium')}
              label="Medium"
            />
            <Radio
              name="sizes-demo"
              size={ComponentSizeEnum.LG}
              checked={sizeRadioValue === 'large'}
              onChange={() => setSizeRadioValue('large')}
              label="Large"
            />
          </div>
        </div>
      </Section>

      <Section>
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 night:text-slate-400">
          Variants
        </h3>
        <CodePreview
          title="Toggle variants"
          code={`<Toggle variant="default" checked onChange={() => {}} />
<Toggle variant="accent" checked onChange={() => {}} />
<Toggle variant="success" checked onChange={() => {}} />
<Toggle variant="danger" checked onChange={() => {}} />`}
        />
        <div className="grid gap-4 md:grid-cols-3">
          <Toggle
            checked={autoGenerate}
            onChange={setAutoGenerate}
            label="Auto generate"
            variant="success"
          />
          <Toggle
            checked={dangerMode}
            onChange={setDangerMode}
            label="Danger mode"
            variant="danger"
          />
          <Toggle
            checked
            onChange={() => undefined}
            label="Disabled toggle"
            variant="accent"
            disabled
          />
        </div>
      </Section>

      <Section>
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 night:text-slate-400">
          Radio
        </h3>
        <CodePreview
          title="Radio group"
          code={`<Radio
  name="mode"
  checked={mode === 'auto'}
  onChange={() => setMode('auto')}
  label="Auto mode"
/>`}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Radio
            name="mode"
            checked={radioValue === 'auto'}
            onChange={() => setRadioValue('auto')}
            label="Auto mode"
            helperText="Automatically run generation pipeline."
          />
          <Radio
            name="mode"
            checked={radioValue === 'manual'}
            onChange={() => setRadioValue('manual')}
            label="Manual mode"
            helperText="Configure each step yourself."
          />
        </div>
      </Section>
    </>
  );
};

