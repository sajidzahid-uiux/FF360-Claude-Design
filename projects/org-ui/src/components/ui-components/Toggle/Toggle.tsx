import { ButtonHTMLAttributes } from 'react';
import { ComponentSizeEnum, type ComponentSize } from '../../../constants';
import { cn } from '../../../utils/cn';

export type ToggleVariant = 'default' | 'accent' | 'success' | 'danger';

export interface ToggleProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  helperText?: string;
  variant?: ToggleVariant;
  size?: ComponentSize;
}

const activeTrackClasses: Record<ToggleVariant, string> = {
  default: 'bg-zinc-900 dark:bg-zinc-100 night:bg-slate-100',
  accent: 'bg-accent',
  success: 'bg-[var(--color-feedback-success)]',
  danger: 'bg-[var(--color-feedback-error)]',
};

const thumbClasses: Record<ToggleVariant, string> = {
  default: 'bg-white dark:bg-zinc-900 night:bg-[#0b1520]',
  accent: 'bg-black',
  success: 'bg-white',
  danger: 'bg-white',
};

const trackSizeClasses: Record<ComponentSize, string> = {
  [ComponentSizeEnum.SM]: 'h-4 w-7',
  [ComponentSizeEnum.MD]: 'h-[18px] w-[32px]',
  [ComponentSizeEnum.LG]: 'h-5 w-9',
};

const thumbSizeClasses: Record<ComponentSize, string> = {
  [ComponentSizeEnum.SM]: 'h-3 w-3',
  [ComponentSizeEnum.MD]: 'h-[14px] w-[14px]',
  [ComponentSizeEnum.LG]: 'h-4 w-4',
};

const thumbPositionClasses: Record<ComponentSize, { on: string; off: string }> = {
  [ComponentSizeEnum.SM]: { on: 'left-[14px]', off: 'left-[2px]' },
  [ComponentSizeEnum.MD]: { on: 'left-[16px]', off: 'left-[2px]' },
  [ComponentSizeEnum.LG]: { on: 'left-[18px]', off: 'left-[2px]' },
};

const labelSizeClasses: Record<ComponentSize, string> = {
  [ComponentSizeEnum.SM]: 'text-xs',
  [ComponentSizeEnum.MD]: 'text-sm',
  [ComponentSizeEnum.LG]: 'text-base',
};

const helperIndentClasses: Record<ComponentSize, string> = {
  [ComponentSizeEnum.SM]: 'pl-9',
  [ComponentSizeEnum.MD]: 'pl-[42px]',
  [ComponentSizeEnum.LG]: 'pl-12',
};

export function Toggle({
  checked,
  onChange,
  type = 'button',
  disabled = false,
  label,
  helperText,
  variant = 'default',
  size = ComponentSizeEnum.MD,
  className,
  ...props
}: ToggleProps) {
  return (
    <div className="space-y-1.5">
      <button
        {...props}
        type={type}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => {
          if (!disabled) onChange(!checked);
        }}
        className={cn(
          'inline-flex items-center gap-2.5 rounded focus:outline-none focus:ring-2 focus:ring-accent/35 focus:ring-offset-2 ring-offset-white dark:ring-offset-zinc-900 night:ring-offset-[#071018]',
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
          className
        )}
      >
        <span
          className={cn(
            'relative rounded-full border transition-colors',
            trackSizeClasses[size],
            checked
              ? cn(activeTrackClasses[variant], 'border-transparent')
              : 'border-zinc-300/75 bg-zinc-200/90 dark:border-zinc-600/70 dark:bg-zinc-700/85 night:border-[#3f6178]/70 night:bg-[#22394c]/85'
          )}
        >
          <span
            className={cn(
              'absolute top-1/2 -translate-y-1/2 rounded-full border shadow-sm transition-all',
              thumbSizeClasses[size],
              checked ? thumbPositionClasses[size].on : thumbPositionClasses[size].off,
              checked
                ? cn(thumbClasses[variant], 'border-transparent')
                : 'border-zinc-300/80 bg-white dark:border-zinc-500/70 dark:bg-zinc-200 night:border-[#5f8098]/70 night:bg-slate-100'
            )}
          />
        </span>

        {label && (
          <span
            className={cn(
              'font-medium text-zinc-900 dark:text-zinc-50 night:text-white',
              labelSizeClasses[size]
            )}
          >
            {label}
          </span>
        )}
      </button>

      {helperText ? (
        <p
          className={cn(
            'text-xs text-zinc-500 dark:text-zinc-400 night:text-slate-400',
            helperIndentClasses[size]
          )}
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

