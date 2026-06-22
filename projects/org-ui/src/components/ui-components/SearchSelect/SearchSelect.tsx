import {
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cn } from '../../../utils/cn';

export interface SearchSelectOption<T extends string> {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface SearchSelectProps<T extends string> {
  options: SearchSelectOption<T>[];
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  label?: string;
  searchPlaceholder?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  emptyStateText?: string;
  maxListHeightClassName?: string;
  /** Close list when clicking outside. */
  closeOnOutsideClick?: boolean;
  /** Optional icon rendered inside the search input. */
  searchIcon?: ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SearchSelect<T extends string>({
  options,
  value,
  defaultValue,
  onChange,
  query,
  defaultQuery = '',
  onQueryChange,
  label,
  searchPlaceholder = 'Search...',
  helperText,
  error,
  disabled = false,
  className,
  emptyStateText = 'No results found',
  maxListHeightClassName = 'max-h-64',
  closeOnOutsideClick = true,
  searchIcon,
  isOpen: controlledIsOpen,
  onOpenChange,
}: SearchSelectProps<T>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const controlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<T | undefined>(
    defaultValue
  );
  const [internalQuery, setInternalQuery] = useState(defaultQuery);
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const currentQuery = query ?? internalQuery;
  const isOpen = controlledIsOpen ?? internalIsOpen;

  const generatedId = useId();
  const labelId = `${generatedId}-label`;
  const helperId = helperText ? `${generatedId}-helper` : undefined;
  const errorId = error ? `${generatedId}-error` : undefined;

  const selectedValue = controlled ? value : internalValue;
  const selectedOption = options.find((option) => option.value === selectedValue);
  const filteredOptions = useMemo(() => {
    const normalized = currentQuery.trim().toLowerCase();
    if (!normalized) return options;
    return options.filter((option) => {
      const labelMatch = option.label.toLowerCase().includes(normalized);
      const descriptionMatch = option.description
        ? option.description.toLowerCase().includes(normalized)
        : false;
      return labelMatch || descriptionMatch;
    });
  }, [options, currentQuery]);

  useEffect(() => {
    if (selectedValue && !options.some((option) => option.value === selectedValue)) {
      if (!controlled) {
        setInternalValue(undefined);
      }
    }
  }, [controlled, options, selectedValue]);

  useEffect(() => {
    if (!isOpen) {
      const next = selectedOption?.label ?? '';
      setInternalQuery(next);
      onQueryChange?.(next);
    }
  }, [isOpen, onQueryChange, selectedOption?.label]);

  useEffect(() => {
    if (!isOpen || !closeOnOutsideClick) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setInternalIsOpen(false);
        onOpenChange?.(false);
      }
    };

    window.addEventListener('mousedown', onPointerDown);
    return () => window.removeEventListener('mousedown', onPointerDown);
  }, [closeOnOutsideClick, isOpen, onOpenChange]);

  const selectValue = (next: T) => {
    const option = options.find((item) => item.value === next);
    if (!controlled) {
      setInternalValue(next);
    }
    const nextQuery = option?.label ?? '';
    setInternalQuery(nextQuery);
    onQueryChange?.(nextQuery);
    onChange?.(next);
    setInternalIsOpen(false);
    onOpenChange?.(false);
  };

  const onInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setInternalIsOpen(false);
      onOpenChange?.(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={rootRef} className={cn('space-y-1.5', className)}>
      {label && (
        <p id={labelId} className="text-sm font-medium text-zinc-900 dark:text-zinc-50 night:text-white">
          {label}
        </p>
      )}

      <div className="relative">
        <div className="p-1">
          {searchIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <span className="text-zinc-500 dark:text-zinc-400 night:text-slate-400">{searchIcon}</span>
            </div>
          )}
          <input
            ref={inputRef}
            type="text"
            value={currentQuery}
            onChange={(event) => {
              const nextQuery = event.target.value;
              setInternalQuery(nextQuery);
              onQueryChange?.(nextQuery);
              setInternalIsOpen(true);
              onOpenChange?.(true);
            }}
            onFocus={() => {
              setInternalIsOpen(true);
              onOpenChange?.(true);
            }}
            onKeyDown={onInputKeyDown}
            placeholder={searchPlaceholder}
            disabled={disabled}
            aria-labelledby={label ? labelId : undefined}
            aria-describedby={[helperId, errorId].filter(Boolean).join(' ') || undefined}
            className={cn(
              'h-9 w-full rounded-md border border-border bg-white px-2.5 text-sm text-zinc-900 outline-none transition-[border-color,box-shadow,background-color,transform] duration-200',
              searchIcon && 'pl-9',
              'focus:border-accent focus:ring-2 focus:ring-accent/30',
              'disabled:cursor-not-allowed disabled:opacity-55',
              'dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50',
              'night:border-[#2d4a48] night:bg-[#13293b] night:text-white',
              error &&
                'border-[var(--color-feedback-error)] focus:border-[var(--color-feedback-error)] focus:ring-[color-mix(in_srgb,var(--color-feedback-error)_30%,transparent)]'
            )}
          />
        </div>
        {isOpen && (currentQuery.trim().length > 0 || filteredOptions.length > 0) && (
          <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-border bg-white shadow-lg transition-[opacity,transform] duration-200 ease-out dark:border-zinc-700 dark:bg-zinc-900 night:border-[#2d4a48] night:bg-[#0f1f2c]">
            <ul className={cn('overflow-auto p-1', maxListHeightClassName)}>
              {filteredOptions.length === 0 ? (
                <li className="px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400 night:text-slate-400">
                  {emptyStateText}
                </li>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = option.value === selectedValue;
                  return (
                    <li key={option.value} role="option" aria-selected={isSelected}>
                      <button
                        type="button"
                        disabled={option.disabled || disabled}
                        onClick={() => selectValue(option.value)}
                        className={cn(
                          'flex w-full cursor-pointer flex-col rounded-md px-3 py-2 text-left transition-colors',
                          'focus:outline-none focus:ring-2 focus:ring-accent/40',
                          isSelected
                            ? 'bg-accent/20 text-zinc-900 dark:bg-accent/25 dark:text-zinc-50 night:bg-accent/30 night:text-white'
                            : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 night:text-slate-300 night:hover:bg-[#1a3044]',
                          (option.disabled || disabled) &&
                            'cursor-not-allowed opacity-45 hover:bg-transparent'
                        )}
                      >
                        <span className="text-sm font-medium">{option.label}</span>
                        {option.description && (
                          <span className="text-xs opacity-75">{option.description}</span>
                        )}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        )}
      </div>

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
