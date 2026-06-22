import { forwardRef, TextareaHTMLAttributes, useId } from 'react';
import { ComponentSizeEnum, type ComponentSize } from '../../../constants';
import { cn } from '../../../utils/cn';

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  size?: ComponentSize;
  fullWidth?: boolean;
}

const textareaSizeClasses: Record<ComponentSize, string> = {
  [ComponentSizeEnum.SM]: 'min-h-[72px] px-2.5 py-2 text-xs',
  [ComponentSizeEnum.MD]: 'min-h-[88px] px-3 py-2 text-sm',
  [ComponentSizeEnum.LG]: 'min-h-[104px] px-3.5 py-2.5 text-base',
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      id,
      label,
      helperText,
      error,
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

    return (
      <div className={cn('space-y-1.5', fullWidth && 'w-full')}>
        {label ? (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-zinc-900 dark:text-zinc-50 night:text-white"
          >
            {label}
          </label>
        ) : null}

        <textarea
          {...props}
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={[helperId, errorId].filter(Boolean).join(' ') || undefined}
          className={cn(
            'rounded-lg border border-border bg-white text-zinc-900 shadow-sm outline-none transition-all',
            'placeholder:text-zinc-400',
            'focus:border-accent focus:ring-2 focus:ring-accent/35',
            'disabled:cursor-not-allowed disabled:opacity-55',
            'dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500',
            'night:border-[#2d4a48] night:bg-[#142433] night:text-white night:placeholder:text-slate-500',
            textareaSizeClasses[size],
            error &&
              'border-[var(--color-feedback-error)] focus:border-[var(--color-feedback-error)] focus:ring-[color-mix(in_srgb,var(--color-feedback-error)_35%,transparent)]',
            fullWidth && 'w-full resize-y',
            className
          )}
        />

        {error ? (
          <p id={errorId} className="text-xs text-[var(--color-feedback-error)]">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-zinc-500 dark:text-zinc-400 night:text-slate-400">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
