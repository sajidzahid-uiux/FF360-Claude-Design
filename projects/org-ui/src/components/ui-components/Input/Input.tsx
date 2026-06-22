import { forwardRef, InputHTMLAttributes, ReactNode, useId } from 'react';
import { ComponentSizeEnum, type ComponentSize } from '../../../constants';
import { cn } from '../../../utils/cn';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string | string[];
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  size?: ComponentSize;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      size = ComponentSizeEnum.MD,
      fullWidth = true,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    const inputSizeClass =
      size === ComponentSizeEnum.SM
        ? 'h-8 text-xs'
        : size === ComponentSizeEnum.LG
          ? 'h-12 text-base'
          : 'h-11 text-sm';

    const leftIconOffsetClass =
      size === ComponentSizeEnum.SM ? 'left-2.5' : 'left-3';
    const rightIconOffsetClass =
      size === ComponentSizeEnum.SM ? 'right-2.5' : 'right-3';

    return (
      <div className={cn('space-y-1.5', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 night:text-white"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <span
              className={cn(
                'pointer-events-none absolute inset-y-0 inline-flex items-center text-zinc-500 dark:text-zinc-400 night:text-slate-400',
                leftIconOffsetClass
              )}
            >
              {leftIcon}
            </span>
          )}

          <input
            {...props}
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={[helperId, errorId].filter(Boolean).join(' ') || undefined}
            className={cn(
              'rounded-lg border border-border bg-white px-3 text-zinc-900 shadow-sm outline-none transition-all',
              'placeholder:text-zinc-400',
              'focus:border-accent focus:ring-2 focus:ring-accent/35',
              'disabled:cursor-not-allowed disabled:opacity-55',
              'dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500',
              'night:border-[#2d4a48] night:bg-[#142433] night:text-white night:placeholder:text-slate-500',
              inputSizeClass,
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error &&
                'border-[var(--color-feedback-error)] focus:border-[var(--color-feedback-error)] focus:ring-[color-mix(in_srgb,var(--color-feedback-error)_35%,transparent)]',
              fullWidth && 'w-full',
              className
            )}
          />

          {rightIcon && (
            <span
              className={cn(
                'pointer-events-none absolute inset-y-0 inline-flex items-center text-zinc-500 dark:text-zinc-400 night:text-slate-400',
                rightIconOffsetClass
              )}
            >
              {rightIcon}
            </span>
          )}
        </div>

        {error ? (
          <p id={errorId} className="text-xs text-[var(--color-feedback-error)]">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-zinc-500 dark:text-zinc-400 night:text-slate-400">
            {Array.isArray(helperText) ? helperText.map((text, index) => (
              <span key={index}>
                {text}
                {index < helperText.length - 1 && <br />}
              </span>
            )) : helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
