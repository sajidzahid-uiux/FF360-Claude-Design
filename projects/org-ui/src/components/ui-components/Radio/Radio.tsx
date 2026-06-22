import { forwardRef, InputHTMLAttributes, useId } from 'react';
import { ComponentSizeEnum, type ComponentSize } from '../../../constants';
import { cn } from '../../../utils/cn';

export interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  size?: ComponentSize;
}

const radioSizeClasses: Record<ComponentSize, string> = {
  [ComponentSizeEnum.SM]: 'h-3.5 w-3.5',
  [ComponentSizeEnum.MD]: 'h-4 w-4',
  [ComponentSizeEnum.LG]: 'h-5 w-5',
};

const dotSizeClasses: Record<ComponentSize, string> = {
  [ComponentSizeEnum.SM]: 'h-1.5 w-1.5',
  [ComponentSizeEnum.MD]: 'h-2 w-2',
  [ComponentSizeEnum.LG]: 'h-2.5 w-2.5',
};

const labelSizeClasses: Record<ComponentSize, string> = {
  [ComponentSizeEnum.SM]: 'text-xs',
  [ComponentSizeEnum.MD]: 'text-sm',
  [ComponentSizeEnum.LG]: 'text-base',
};

const helperIndentClasses: Record<ComponentSize, string> = {
  [ComponentSizeEnum.SM]: 'pl-5',
  [ComponentSizeEnum.MD]: 'pl-6',
  [ComponentSizeEnum.LG]: 'pl-7',
};

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      id,
      label,
      helperText,
      error,
      className,
      disabled,
      size = ComponentSizeEnum.MD,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={inputId}
          className={cn(
            'inline-flex items-start gap-2.5',
            disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
          )}
        >
          <span
            className={cn(
              'relative mt-0.5 inline-flex shrink-0 items-center justify-center',
              radioSizeClasses[size]
            )}
          >
            <input
              {...props}
              ref={ref}
              id={inputId}
              type="radio"
              disabled={disabled}
              aria-invalid={Boolean(error)}
              aria-describedby={[helperId, errorId].filter(Boolean).join(' ') || undefined}
              className={cn(
                'peer appearance-none rounded-full outline-none transition-all',
                'border border-zinc-300/75 bg-zinc-200/65 dark:border-zinc-600/70 dark:bg-zinc-700/70 night:border-[#3f6178]/70 night:bg-[#22394c]/75',
                'hover:border-zinc-400/75 dark:hover:border-zinc-500/80 night:hover:border-[#55758d]/80',
                'focus:ring-2 focus:ring-accent/35',
                'checked:border-accent',
                'disabled:cursor-not-allowed disabled:opacity-60',
                error &&
                  'border-[var(--color-feedback-error)] focus:ring-[color-mix(in_srgb,var(--color-feedback-error)_35%,transparent)]',
                radioSizeClasses[size],
                className
              )}
            />
            <span
              className={cn(
                'pointer-events-none absolute rounded-full bg-accent opacity-0 transition-opacity duration-150 peer-checked:opacity-100',
                dotSizeClasses[size]
              )}
              aria-hidden
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
        </label>

        {error ? (
          <p id={errorId} className="text-xs text-[var(--color-feedback-error)]">
            {error}
          </p>
        ) : helperText ? (
          <p
            id={helperId}
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
);

Radio.displayName = 'Radio';

