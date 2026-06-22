import { useEffect, useState } from 'react';
import { cn } from '../../../utils/cn';
import { Input } from '../../ui-components/Input';
import { SwatchIcon } from './ThemeControlsIcons';
import {
  normalizeHexForColorInput,
  parseHexInput,
} from './themeControlsUtils';

export interface ThemeAccentSectionProps {
  headingId: string;
  label: string;
  presets: string[];
  showHexInput: boolean;
  accentColor: string;
  onAccentApply: (color: string) => void;
  sectionClassName?: string;
}

export function ThemeAccentSection({
  headingId,
  label,
  presets,
  showHexInput,
  accentColor,
  onAccentApply,
  sectionClassName,
}: ThemeAccentSectionProps) {
  const [hexDraft, setHexDraft] = useState(accentColor);

  useEffect(() => {
    setHexDraft(accentColor);
  }, [accentColor]);

  const accentHexMatches = (preset: string) =>
    preset.toLowerCase() === accentColor.trim().toLowerCase();

  return (
    <section
      className={cn('flex min-w-0 flex-col gap-4', sectionClassName)}
      aria-labelledby={headingId}
    >
      <header className="flex flex-wrap items-start gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <h3
            id={headingId}
            className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 night:text-white"
          >
            {label}
          </h3>
          <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 night:text-slate-400">
            Brand accent for highlights and accent buttons. Select a color to update live across
            the app.
          </p>
        </div>
        <div className="flex shrink-0 items-center flex-col gap-2">
          <span
            className="relative flex h-10 w-22 shrink-0 items-center justify-center rounded-xl shadow-inner ring-2 ring-white dark:ring-zinc-800 night:ring-[#142433]"
            style={{
              backgroundColor: normalizeHexForColorInput(accentColor),
              boxShadow:
                'inset 0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.06)',
            }}
            aria-hidden
          />
          <label className="group relative cursor-pointer">
            <span className="sr-only">Open color picker</span>
            <span
              className={cn(
                'flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-700',
                'transition-colors hover:border-zinc-300 hover:bg-white',
                'dark:border-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-200 dark:hover:border-zinc-500 dark:hover:bg-zinc-800',
                'night:border-[#2d4a48] night:bg-[#142433]/90 night:text-slate-200 night:hover:border-accent/40 night:hover:bg-[#1a3044]/95'
              )}
            >
              <SwatchIcon className="h-4 w-4 opacity-70" aria-hidden />
              Custom
            </span>
            <input
              type="color"
              aria-label={`${label} picker`}
              value={normalizeHexForColorInput(accentColor)}
              onChange={(e) => onAccentApply(e.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </label>
        </div>
      </header>

      <div
        role="group"
        aria-label={`${label} presets`}
        className="flex flex-col gap-3"
      >
        {presets.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500 night:text-slate-500">
              Presets
            </p>
            <div className="flex flex-wrap gap-2.5">
              {presets.map((hex, index) => (
                <button
                  key={`${hex}-${index}`}
                  type="button"
                  aria-label={`Use accent ${hex}`}
                  aria-pressed={accentHexMatches(hex)}
                  title={hex}
                  className={cn(
                    'relative h-10 w-10 shrink-0 rounded-xl transition-transform duration-200 motion-reduce:transition-none',
                    'ring-2 ring-offset-2 ring-offset-white focus:outline-none focus-visible:ring-black dark:ring-offset-zinc-900 dark:focus-visible:ring-white',
                    'night:ring-offset-[#071018] night:focus-visible:ring-accent',
                    accentHexMatches(hex)
                      ? 'scale-[1.03] ring-black dark:ring-white night:ring-accent night:shadow-[0_0_14px_-4px_rgba(223,255,134,0.45)]'
                      : 'ring-transparent hover:scale-105 hover:ring-black/15 dark:hover:ring-white/20 night:hover:ring-accent/40'
                  )}
                  style={{
                    backgroundColor: hex,
                    boxShadow:
                      'inset 0 -2px 6px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
                  }}
                  onClick={() => onAccentApply(hex)}
                />
              ))}
            </div>
          </div>
        )}

        {showHexInput && (
          <div className="max-w-[13.5rem]">
            <Input
              label="HEX value"
              placeholder="#d9f46e"
              value={hexDraft}
              onChange={(e) => setHexDraft(e.target.value)}
              onBlur={() => {
                const parsed = parseHexInput(hexDraft);
                if (parsed) {
                  onAccentApply(parsed);
                } else {
                  setHexDraft(accentColor);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const parsed = parseHexInput(hexDraft);
                  if (parsed) {
                    onAccentApply(parsed);
                  }
                  (e.target as HTMLInputElement).blur();
                }
              }}
              helperText={['Three- or six-digit HEX value.', 'Press Enter to apply.']}
              className="font-mono"
            />
          </div>
        )}
      </div>
    </section>
  );
}
