import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../../utils/cn';

export type SearchInputVariant = 'default' | 'underlined';

export interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onClear?: () => void;
  variant?: SearchInputVariant;
}

const SearchIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="h-5 w-5"
    aria-hidden
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35m1.35-5.15a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
  </svg>
);

const ClearIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="h-5 w-5"
    aria-hidden
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

const variantClasses: Record<SearchInputVariant, string> = {
  default: cn(
    'rounded-lg border border-border bg-white py-4 pl-10 pr-10',
    'focus:border-accent focus:ring-1 focus:ring-accent/30',
    'dark:border-zinc-700 dark:bg-zinc-900',
    'night:border-[#2d4a48] night:bg-[#142433]'
  ),
  underlined: cn(
    'rounded-none border-0 border-b border-border-subtle bg-transparent py-2 pl-10 pr-10 shadow-none',
    'hover:border-border-strong',
    'focus:border-accent focus:ring-0',
    'dark:bg-transparent dark:border-zinc-600',
    'dark:hover:border-zinc-500 dark:focus:border-accent',
    'night:bg-transparent night:border-[#2d4a48]',
    'night:hover:border-[#3d5c58] night:focus:border-accent'
  ),
};

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onClear, value, variant = 'default', ...props }, ref) => {
    return (
      <div className="relative w-full">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-0.5 text-zinc-500 dark:text-zinc-400 night:text-slate-400">
          {SearchIcon}
        </div>
        <input
          ref={ref}
          type={onClear ? 'text' : 'search'}
          role="searchbox"
          enterKeyHint="search"
          className={cn(
            'block w-full text-sm text-zinc-900 outline-none',
            'placeholder:text-zinc-400',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'dark:text-zinc-50 dark:placeholder:text-zinc-500',
            'night:text-white night:placeholder:text-slate-500',
            variantClasses[variant],
            className
          )}
          value={value}
          {...props}
        />
        {value && onClear ? (
          <button
            type="button"
            onClick={onClear}
            className="absolute inset-y-0 right-0 flex items-center pr-0.5 text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 night:text-slate-400 night:hover:text-slate-200"
            aria-label="Clear search"
          >
            {ClearIcon}
          </button>
        ) : null}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';
