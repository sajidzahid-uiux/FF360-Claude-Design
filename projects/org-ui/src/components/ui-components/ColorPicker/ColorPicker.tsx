import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';

import { useTheme } from '../../../theme';
import { cn } from '../../../utils/cn';

const DEFAULT_SWATCHES = [
  '#DFFF86',
  '#7DD3FC',
  '#C4B5FD',
  '#FCA5A5',
  '#F9A8D4',
  '#FDBA74',
  '#86EFAC',
  '#FDE68A',
];

export interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  /** Preset accent swatch grid. Set false to render only the custom picker. */
  showSwatches?: boolean;
  /** Label + current hex value row. */
  showHeader?: boolean;
  accentColors?: string[];
  /** Custom saturation/lightness panel and hue control. */
  allowCustomColor?: boolean;
  disabled?: boolean;
  className?: string;
}

type Hsl = { h: number; s: number; l: number };

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function hexToHsl(hexColor: string): Hsl {
  const normalized = hexColor.replace('#', '').trim();
  const safeHex =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => `${char}${char}`)
          .join('')
      : normalized.padStart(6, '0').slice(0, 6);

  const r = parseInt(safeHex.slice(0, 2), 16) / 255;
  const g = parseInt(safeHex.slice(2, 4), 16) / 255;
  const b = parseInt(safeHex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const lightness = (max + min) / 2;

  let hue = 0;
  if (delta > 0) {
    if (max === r) hue = ((g - b) / delta) % 6;
    else if (max === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;
  }

  const saturation =
    delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));

  return {
    h: Math.round((hue * 60 + 360) % 360),
    s: Math.round(saturation * 100),
    l: Math.round(lightness * 100),
  };
}

function hslToHex({ h, s, l }: Hsl): string {
  const sat = clamp(s, 0, 100) / 100;
  const light = clamp(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = light - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  const toHex = (channel: number) =>
    Math.round((channel + m) * 255)
      .toString(16)
      .padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function ColorPicker({
  value,
  onChange,
  label = 'Accent color',
  showSwatches = true,
  showHeader = true,
  accentColors = DEFAULT_SWATCHES,
  allowCustomColor = true,
  disabled = false,
  className,
}: ColorPickerProps) {
  const { accentColor } = useTheme();
  const focusAccent = accentColor ?? '#dfff86';
  const normalizedValue = value.toLowerCase();
  const [hue, setHue] = useState(80);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(75);
  const paletteRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const hsl = hexToHsl(value);
    setHue(hsl.h);
    setSaturation(hsl.s);
    setLightness(hsl.l);
  }, [value]);

  const swatches = useMemo(
    () =>
      accentColors.map((color) => ({
        raw: color,
        normalized: color.toLowerCase(),
      })),
    [accentColors]
  );

  const paletteThumbLeft = `${saturation}%`;
  const paletteThumbTop = `${100 - lightness}%`;
  const hueColor = `hsl(${hue} 100% 50%)`;

  const updateFromPalette = (clientX: number, clientY: number) => {
    const palette = paletteRef.current;
    if (!palette) return;
    const rect = palette.getBoundingClientRect();
    const x = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
    const y = clamp(((clientY - rect.top) / rect.height) * 100, 0, 100);
    const nextSaturation = Math.round(x);
    const nextLightness = Math.round(100 - y);

    setSaturation(nextSaturation);
    setLightness(nextLightness);
    onChange(hslToHex({ h: hue, s: nextSaturation, l: nextLightness }));
  };

  const showLabelRow = showHeader && (label || value);

  return (
    <div className={cn('space-y-3', className)}>
      {showLabelRow ? (
        <div className="flex items-center justify-between gap-3">
          {label ? (
            <span className="text-text-secondary text-sm font-medium">{label}</span>
          ) : (
            <span />
          )}
          <span className="text-text-muted rounded-full border border-[var(--color-border-subtle)] px-2 py-0.5 text-xs font-semibold uppercase">
            {value}
          </span>
        </div>
      ) : null}

      {showSwatches ? (
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
        {swatches.map((swatch) => {
          const isActive = swatch.normalized === normalizedValue;
          return (
            <button
              key={swatch.raw}
              type="button"
              disabled={disabled}
              onClick={() => onChange(swatch.raw)}
              aria-label={`Use color ${swatch.raw}`}
              aria-pressed={isActive}
              className={cn(
                'relative h-9 w-9 rounded-full border transition-transform duration-200',
                'focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
                isActive
                  ? 'border-text-primary scale-105 shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-accent)_35%,transparent)]'
                  : 'border-[var(--color-border-subtle)] hover:scale-105'
              )}
              style={{
                backgroundColor: swatch.raw,
                boxShadow: isActive ? `0 0 0 2px ${focusAccent}` : undefined,
              }}
            >
              {isActive ? (
                <span className="absolute inset-0 rounded-full border-2 border-white/80" />
              ) : null}
            </button>
          );
        })}
      </div>
      ) : null}

      {allowCustomColor ? (
        <div className="border-border-subtle bg-bg-surface-elevated space-y-3 rounded-xl border p-3">
          <div
            ref={paletteRef}
            className={cn(
              'relative h-32 w-full overflow-hidden rounded-lg border border-white/25',
              disabled ? 'pointer-events-none opacity-50' : 'cursor-crosshair'
            )}
            style={{ backgroundColor: hueColor }}
            onClick={(event) => updateFromPalette(event.clientX, event.clientY)}
            aria-label="Pick saturation and lightness"
            role="button"
            tabIndex={disabled ? -1 : 0}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
            <span
              className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
              style={{ left: paletteThumbLeft, top: paletteThumbTop }}
            />
          </div>

          <label className="flex items-center gap-3">
            <span className="text-text-muted w-10 text-xs font-semibold">Hue</span>
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={hue}
              disabled={disabled}
              aria-label="Hue"
              onChange={(event) => {
                const nextHue = Number(event.target.value);
                setHue(nextHue);
                onChange(
                  hslToHex({ h: nextHue, s: saturation, l: lightness })
                );
              }}
              className="ff-modern-slider h-2 w-full cursor-pointer appearance-none rounded-full disabled:cursor-not-allowed disabled:opacity-50"
              style={
                {
                  background:
                    'linear-gradient(90deg,#ff0000 0%,#ffff00 17%,#00ff00 33%,#00ffff 50%,#0000ff 67%,#ff00ff 83%,#ff0000 100%)',
                  '--ff-slider-accent': focusAccent,
                } as CSSProperties
              }
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}
