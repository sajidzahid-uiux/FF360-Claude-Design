import { Check } from 'lucide-react';
import {
  CSSProperties,
  Fragment,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../../utils/cn';

export interface SearchableDropdownOption<T extends string> {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
  /** Renders a section heading when the group changes (first option in each group). */
  group?: string;
}

export const searchableDropdownOptionClassName = (
  isSelected: boolean,
  isActive: boolean,
  isDisabled?: boolean
) =>
  cn(
    'flex w-full cursor-pointer flex-col rounded-md px-3 py-2 text-left transition-[background-color,color,box-shadow] duration-150 ease-out',
    'focus:outline-none focus:ring-2 focus:ring-accent/40',
    isSelected
      ? 'bg-accent/20 text-zinc-900 dark:bg-accent/25 dark:text-zinc-50 night:bg-accent/30 night:text-white'
      : isActive
        ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 night:bg-[#1a3044] night:text-white'
        : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 night:text-slate-300 night:hover:bg-[#1a3044]',
    isDisabled && 'cursor-not-allowed opacity-45 hover:bg-transparent'
  );

export interface SearchableDropdownTriggerRenderProps<T extends string> {
  isOpen: boolean;
  selectedOption?: SearchableDropdownOption<T>;
  placeholder: string;
  disabled: boolean;
}

export interface SearchableDropdownProps<T extends string> {
  options: SearchableDropdownOption<T>[];
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  /** When true, keeps the menu open and toggles membership in `values`. */
  multiple?: boolean;
  values?: T[];
  defaultValues?: T[];
  onValuesChange?: (values: T[]) => void;
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  trigger?:
  | ReactNode
  | ((props: SearchableDropdownTriggerRenderProps<T>) => ReactNode);
  triggerClassName?: string;
  emptyStateText?: string;
  /** Minimum width of the floating menu in pixels. Does not affect trigger width. */
  menuMinWidth?: number;
}

export function SearchableDropdown<T extends string>({
  options,
  value,
  defaultValue,
  onChange,
  multiple = false,
  values,
  defaultValues = [],
  onValuesChange,
  label,
  placeholder = 'Select option',
  searchPlaceholder = 'Search...',
  helperText,
  error,
  disabled = false,
  fullWidth = true,
  className,
  trigger,
  triggerClassName,
  emptyStateText = 'No results found',
  menuMinWidth,
}: SearchableDropdownProps<T>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const controlled = value !== undefined;
  const valuesControlled = values !== undefined;
  const [internalValue, setInternalValue] = useState<T | undefined>(
    defaultValue
  );
  const [internalValues, setInternalValues] = useState<T[]>(defaultValues);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isMounted, setIsMounted] = useState(false);
  const [placement, setPlacement] = useState<'top' | 'bottom'>('bottom');
  const [query, setQuery] = useState('');
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({
    top: 0,
    left: 0,
    minWidth: 220,
  });

  const generatedId = useId();
  const labelId = `${generatedId}-label`;
  const helperId = helperText ? `${generatedId}-helper` : undefined;
  const errorId = error ? `${generatedId}-error` : undefined;
  const listId = `${generatedId}-listbox`;

  const selectedValue = controlled ? value : internalValue;
  const selectedValues = valuesControlled ? values : internalValues;
  const selectedOption = options.find((option) => option.value === selectedValue);
  const hasCustomTrigger = trigger !== undefined;

  const isOptionSelected = useMemo(() => (optionValue: T) =>
    multiple ? selectedValues.includes(optionValue) : optionValue === selectedValue,
    [multiple, selectedValues, selectedValue]
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const setValue = (next: T) => {
    if (!controlled) {
      setInternalValue(next);
    }
    onChange?.(next);
  };

  const setValues = (next: T[]) => {
    if (!valuesControlled) {
      setInternalValues(next);
    }
    onValuesChange?.(next);
  };

  const toggleValue = (next: T) => {
    const current = selectedValues;
    const exists = current.includes(next);
    const updated = exists ? current.filter((entry) => entry !== next) : [...current, next];
    setValues(updated);
  };

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return options;
    }

    return options.filter((option) => {
      const matchesLabel = option.label.toLowerCase().includes(normalizedQuery);
      const matchesDescription = option.description
        ? option.description.toLowerCase().includes(normalizedQuery)
        : false;
      return matchesLabel || matchesDescription;
    });
  }, [options, query]);

  const enabledFilteredOptions = useMemo(
    () => filteredOptions.filter((option) => !option.disabled),
    [filteredOptions]
  );

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setActiveIndex(-1);
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedInsideRoot = rootRef.current?.contains(target);
      const clickedInsideMenu = menuRef.current?.contains(target);
      if (!clickedInsideRoot && !clickedInsideMenu) {
        setIsOpen(false);
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onEscape);
    const focusTimer = window.setTimeout(() => searchInputRef.current?.focus(), 0);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const computePlacement = () => {
      const triggerRect = buttonRef.current?.getBoundingClientRect();
      if (!triggerRect) {
        return;
      }

      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;
      const estimatedMenuHeight = 340;
      const shouldOpenTop =
        spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow;

      setPlacement(shouldOpenTop ? 'top' : 'bottom');

      const viewportPadding = 8;
      const minMenuWidth =
        menuMinWidth ?? (hasCustomTrigger ? 220 : triggerRect.width);
      const menuWidth = Math.max(triggerRect.width, minMenuWidth);
      const left = Math.min(
        Math.max(viewportPadding, triggerRect.left),
        window.innerWidth - menuWidth - viewportPadding
      );
      const top = shouldOpenTop
        ? Math.max(viewportPadding, triggerRect.top - 4)
        : Math.min(
          window.innerHeight - estimatedMenuHeight - viewportPadding,
          triggerRect.bottom + 4
        );

      setMenuStyle({
        top,
        left,
        minWidth: minMenuWidth,
      });
    };

    computePlacement();
    window.addEventListener('resize', computePlacement);
    window.addEventListener('scroll', computePlacement, true);

    return () => {
      window.removeEventListener('resize', computePlacement);
      window.removeEventListener('scroll', computePlacement, true);
    };
  }, [isOpen, hasCustomTrigger, menuMinWidth]);

  useEffect(() => {
    if (!isOpen) return;
    const selectedIndex = filteredOptions.findIndex(
      (option) => isOptionSelected(option.value) && !option.disabled
    );
    if (selectedIndex >= 0) {
      setActiveIndex(selectedIndex);
      return;
    }
    const firstIndex = filteredOptions.findIndex((option) => !option.disabled);
    setActiveIndex(firstIndex);
  }, [filteredOptions, isOpen, multiple, selectedValue, selectedValues, isOptionSelected]);

  const openAndFocus = () => {
    if (disabled || options.length === 0 || enabledFilteredOptions.length === 0) {
      return;
    }
    setIsOpen(true);
  };

  const selectAtIndex = (index: number) => {
    const option = filteredOptions[index];
    if (!option || option.disabled) {
      return;
    }
    if (multiple) {
      toggleValue(option.value);
      return;
    }
    setValue(option.value);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const moveActiveIndex = (step: 1 | -1) => {
    if (filteredOptions.length === 0) {
      return;
    }

    let index = activeIndex;
    for (let tries = 0; tries < filteredOptions.length; tries += 1) {
      index = (index + step + filteredOptions.length) % filteredOptions.length;
      if (!filteredOptions[index]?.disabled) {
        setActiveIndex(index);
        return;
      }
    }
  };

  const onButtonKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      openAndFocus();
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!isOpen) {
        openAndFocus();
      }
    }
  };

  const onListKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveActiveIndex(1);
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveActiveIndex(-1);
    }
    if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      selectAtIndex(activeIndex);
    }
  };

  const renderedTrigger =
    typeof trigger === 'function'
      ? trigger({
        isOpen,
        selectedOption,
        placeholder,
        disabled,
      })
      : trigger;

  return (
    <div ref={rootRef} className={cn('space-y-1.5', fullWidth && 'w-full', className)}>
      {label && (
        <p id={labelId} className="text-sm font-medium text-zinc-900 dark:text-zinc-50 night:text-white">
          {label}
        </p>
      )}

      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={label ? `${labelId} ${generatedId}-button` : undefined}
          aria-describedby={[helperId, errorId].filter(Boolean).join(' ') || undefined}
          aria-invalid={Boolean(error)}
          id={`${generatedId}-button`}
          onClick={() => (isOpen ? setIsOpen(false) : openAndFocus())}
          onKeyDown={onButtonKeyDown}
          className={cn(
            hasCustomTrigger
              ? 'outline-none'
              : 'flex h-10 items-center justify-between gap-2 rounded-lg border border-border bg-white px-3 text-left text-sm text-zinc-900 shadow-sm outline-none transition-colors',
            hasCustomTrigger
              ? 'focus:ring-2 focus:ring-accent/35 rounded-md'
              : 'focus:border-accent focus:ring-2 focus:ring-accent/35',
            'disabled:cursor-not-allowed disabled:opacity-55',
            !hasCustomTrigger && 'dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50',
            !hasCustomTrigger && 'night:border-[#2d4a48] night:bg-[#142433] night:text-white',
            error &&
            'border-[var(--color-feedback-error)] focus:border-[var(--color-feedback-error)] focus:ring-[color-mix(in_srgb,var(--color-feedback-error)_35%,transparent)]',
            fullWidth && 'w-full',
            triggerClassName
          )}
        >
          {hasCustomTrigger ? (
            renderedTrigger
          ) : (
            <>
              <span className={cn(!selectedOption && 'text-zinc-400 dark:text-zinc-500 night:text-slate-500')}>
                {selectedOption ? selectedOption.label : placeholder}
              </span>
              <ChevronIcon className={cn('h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200 ease-out', isOpen && 'rotate-180')} />
            </>
          )}
        </button>

        {isMounted &&
          createPortal(
            <div
              ref={menuRef}
              id={listId}
              role="listbox"
              aria-multiselectable={multiple || undefined}
              aria-hidden={!isOpen}
              aria-labelledby={label ? labelId : undefined}
              tabIndex={isOpen ? -1 : undefined}
              onKeyDown={onListKeyDown}
              className={cn(
                'fixed z-[9999] overflow-hidden rounded-lg border bg-white shadow-lg',
                'transition-[max-height,opacity,transform,padding,border-color] duration-200 ease-out',
                isOpen
                  ? 'max-h-[340px] p-1 opacity-100'
                  : 'pointer-events-none max-h-0 border-transparent p-0 opacity-0',
                placement === 'bottom'
                  ? 'origin-top scale-100'
                  : 'origin-bottom -translate-y-full scale-100',
                !isOpen && 'scale-y-95',
                'border-border dark:border-zinc-700 night:border-[#2d4a48]',
                'dark:bg-zinc-900 night:bg-[#0f1f2c]'
              )}
              style={menuStyle}
            >
              <div className="p-1">
                <input
                  ref={searchInputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={searchPlaceholder}
                  className={cn(
                    'h-9 w-full rounded-md border border-border bg-white px-2.5 text-sm text-zinc-900 outline-none transition-[border-color,box-shadow,background-color] duration-200',
                    'focus:border-accent focus:ring-2 focus:ring-accent/30',
                    'dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50',
                    'night:border-[#2d4a48] night:bg-[#13293b] night:text-white'
                  )}
                />
              </div>
              <ul className="max-h-[248px] overflow-auto">
                {filteredOptions.length === 0 ? (
                  <li className="px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400 night:text-slate-400">
                    {emptyStateText}
                  </li>
                ) : (
                  filteredOptions.map((option, index) => {
                    const isSelected = isOptionSelected(option.value);
                    const isActive = index === activeIndex;
                    const previousGroup =
                      index > 0 ? filteredOptions[index - 1]?.group : undefined;
                    const showGroupHeader = Boolean(
                      option.group && option.group !== previousGroup
                    );

                    return (
                      <Fragment key={option.value}>
                        {showGroupHeader ? (
                          <li
                            aria-hidden
                            className="px-3 pt-2 pb-1 text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400 night:text-slate-400"
                          >
                            {option.group}
                          </li>
                        ) : null}
                        <li role="option" aria-selected={isSelected}>
                          <button
                            type="button"
                            tabIndex={isOpen ? 0 : -1}
                            disabled={option.disabled}
                            onMouseEnter={() => setActiveIndex(index)}
                            onClick={() => selectAtIndex(index)}
                            className={searchableDropdownOptionClassName(
                              isSelected,
                              isActive,
                              option.disabled
                            )}
                          >
                            <span className="flex items-start justify-between gap-2">
                              <span className="flex min-w-0 flex-col">
                                <span className="text-sm font-medium">{option.label}</span>
                                {option.description ? (
                                  <span className="text-xs opacity-75">
                                    {option.description}
                                  </span>
                                ) : null}
                              </span>
                              {multiple && isSelected ? (
                                <Check
                                  aria-hidden
                                  className="mt-0.5 h-4 w-4 shrink-0 text-zinc-700 dark:text-zinc-200 night:text-white"
                                  strokeWidth={2.5}
                                />
                              ) : null}
                            </span>
                          </button>
                        </li>
                      </Fragment>
                    );
                  })
                )}
              </ul>
            </div>,
            document.body
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

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  );
}
