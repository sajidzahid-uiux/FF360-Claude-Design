import { ComponentSizeEnum } from '../../../constants';
import { Radio } from '../../ui-components/Radio';
import { TableVariantEnum, type TableVariant } from './tableVariantTypes';
import { TableColumnEditorPanel } from './TableColumnEditorPanel';
import type { TableSettingsConfig } from './tableSettingsTypes';
import { cn } from '../../../utils/cn';

const VARIANT_OPTIONS: Array<{ value: TableVariant; label: string; description: string }> =
  [
    {
      value: TableVariantEnum.CARD,
      label: 'Card',
      description: 'Bordered table with elevated header.',
    },
    {
      value: TableVariantEnum.PLAIN,
      label: 'Plain',
      description: 'Borderless rows for dense lists.',
    },
  ];

export interface TableSettingsPanelProps {
  settings: TableSettingsConfig;
}

export function TableSettingsPanel({ settings }: TableSettingsPanelProps) {
  const defaultVariant = settings.defaultVariant ?? TableVariantEnum.CARD;

  const handleReset = () => {
    settings.columnEditor.onReset?.();
    if (settings.variant !== defaultVariant) {
      settings.onVariantChange(defaultVariant);
    }
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-text-muted text-xs leading-relaxed">
          Customize how this table looks and which columns are shown.
        </p>
        {settings.columnEditor.onReset || settings.variant !== defaultVariant ? (
          <button
            type="button"
            onClick={handleReset}
            className="text-text-secondary hover:text-text-primary shrink-0 text-xs font-medium underline-offset-2 hover:underline"
          >
            Reset all
          </button>
        ) : null}
      </div>

      <section className="flex flex-col gap-2">
        <h4 className="text-text-primary text-xs font-semibold tracking-wide uppercase">
          Table style
        </h4>
        <div
          className="grid gap-2 sm:grid-cols-2"
          role="radiogroup"
          aria-label="Table style"
        >
          {VARIANT_OPTIONS.map((option) => {
            const selected = settings.variant === option.value;
            return (
              <div
                key={option.value}
                role="presentation"
                onClick={() => settings.onVariantChange(option.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    settings.onVariantChange(option.value);
                  }
                }}
                className={cn(
                  'border-border-subtle hover:border-border-strong flex cursor-pointer rounded-lg border px-3 py-2.5 transition-colors',
                  selected && 'border-accent bg-accent-light/40'
                )}
              >
                <Radio
                  name="table-variant"
                  value={option.value}
                  checked={selected}
                  onChange={() => settings.onVariantChange(option.value)}
                  label={option.label}
                  helperText={option.description}
                  size={ComponentSizeEnum.SM}
                />
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-border-subtle/80 flex flex-col gap-2 border-t pt-3">
        <h4 className="text-text-primary text-xs font-semibold tracking-wide uppercase">
          Columns
        </h4>
        <TableColumnEditorPanel
          definitions={settings.columnEditor.definitions}
          preferences={settings.columnEditor.preferences}
          onPreferencesChange={settings.columnEditor.onPreferencesChange}
          showHeader={false}
        />
      </section>
    </div>
  );
}
