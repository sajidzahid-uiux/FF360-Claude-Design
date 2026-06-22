import { CSSProperties, useMemo } from 'react';

import { cn } from '../../../utils/cn';
import { useTheme } from '../../../theme';

export interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  label?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  ariaLabel?: string;
  className?: string;
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  label,
  showValue = true,
  formatValue,
  ariaLabel,
  className,
}: SliderProps) {
  const { accentColor } = useTheme();
  const accent = accentColor ?? '#dfff86';
  const clamped = Math.min(max, Math.max(min, value));
  const progress = max <= min ? 0 : ((clamped - min) / (max - min)) * 100;
  const valueLabel = formatValue ? formatValue(clamped) : `${Math.round(clamped)}`;

  const trackStyle = useMemo(
    () =>
      ({
        background: `linear-gradient(to right, ${accent} 0%, ${accent} ${progress}%, var(--color-bg-hover, #e5e7eb) ${progress}%, var(--color-bg-hover, #e5e7eb) 100%)`,
        accentColor: accent,
        '--ff-slider-accent': accent,
      }) as CSSProperties,
    [accent, progress]
  );

  return (
    <div className={cn('space-y-2', className)}>
      {label || showValue ? (
        <div className="flex items-center justify-between gap-3">
          {label ? (
            <span className="text-text-secondary text-sm font-medium">{label}</span>
          ) : (
            <span />
          )}
          {showValue ? (
            <span className="text-text-muted text-xs font-semibold tabular-nums">{valueLabel}</span>
          ) : null}
        </div>
      ) : null}

      <div className="relative py-1">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={clamped}
          disabled={disabled}
          onChange={(event) => onChange(Number(event.target.value))}
          aria-label={ariaLabel ?? label ?? 'Slider'}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={clamped}
          style={trackStyle}
          className={cn(
            'ff-modern-slider h-2 w-full cursor-pointer appearance-none rounded-full',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        />
      </div>
    </div>
  );
}
