import { forwardRef, InputHTMLAttributes, useId } from 'react';
import { ComponentSizeEnum, type ComponentSize } from '../../../constants';
import { cn } from '../../../utils/cn';

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  size?: ComponentSize;
}

const boxSizeClasses: Record<ComponentSize, string> = {
  [ComponentSizeEnum.SM]: 'h-3.5 w-3.5',
  [ComponentSizeEnum.MD]: 'h-4 w-4',
  [ComponentSizeEnum.LG]: 'h-5 w-5',
};

const boxRadiusClasses: Record<ComponentSize, string> = {
  [ComponentSizeEnum.SM]: 'rounded-[4px]',
  [ComponentSizeEnum.MD]: 'rounded-[5px]',
  [ComponentSizeEnum.LG]: 'rounded-md',
};

const checkIconSizeClasses: Record<ComponentSize, string> = {
  [ComponentSizeEnum.SM]: 'h-2.5 w-2.5',
  [ComponentSizeEnum.MD]: 'h-3 w-3',
  [ComponentSizeEnum.LG]: 'h-3.5 w-3.5',
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

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
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
    const hasCaption = Boolean(label || helperText || error);

    const inputClassName = cn(
      'peer appearance-none border border-border bg-bg-surface-elevated outline-none transition-all',
      'dark:border-zinc-700 night:border-[#2d4a48]',
      'hover:border-border-strong dark:hover:border-zinc-600 night:hover:border-[#3a5c59]',
      'focus:ring-2 focus:ring-accent/35',
      'checked:border-accent checked:bg-accent',
      'disabled:cursor-not-allowed disabled:border-zinc-300 disabled:bg-zinc-100',
      'dark:disabled:border-zinc-600 dark:disabled:bg-zinc-800',
      'night:disabled:border-[#3d5c58] night:disabled:bg-[#1a2b3a]',
      error &&
        'border-[var(--color-feedback-error)] focus:ring-[color-mix(in_srgb,var(--color-feedback-error)_35%,transparent)]',
      boxSizeClasses[size],
      boxRadiusClasses[size],
      className
    );

    const control = (
      <span
        className={cn(
          'relative inline-flex shrink-0 items-center justify-center',
          boxSizeClasses[size],
          hasCaption && 'mt-0.5'
        )}
      >
        <input
          {...props}
          ref={ref}
          id={inputId}
          type="checkbox"
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={[helperId, errorId].filter(Boolean).join(' ') || undefined}
          className={inputClassName}
        />
        <svg
          viewBox="0 0 16 16"
          className={cn(
            'pointer-events-none absolute scale-75 text-black opacity-0 transition-all duration-150 peer-checked:scale-100 peer-checked:opacity-100',
            checkIconSizeClasses[size]
          )}
          aria-hidden
        >
          <path
            d="M3.25 8.25 6.5 11.5 12.75 5.25"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );

    if (!hasCaption) {
      return (
        <label
          htmlFor={inputId}
          className={cn(
            'inline-flex items-center',
            disabled ? 'cursor-not-allowed' : 'cursor-pointer'
          )}
        >
          {control}
        </label>
      );
    }

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={inputId}
          className={cn(
            'inline-flex items-start gap-2.5',
            disabled ? 'cursor-not-allowed' : 'cursor-pointer'
          )}
        >
          {control}
          {label ? (
            <span
              className={cn(
                'font-medium text-zinc-900 dark:text-zinc-50 night:text-white',
                disabled && 'text-zinc-500 dark:text-zinc-400 night:text-slate-400',
                labelSizeClasses[size]
              )}
            >
              {label}
            </span>
          ) : null}
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

Checkbox.displayName = 'Checkbox';

