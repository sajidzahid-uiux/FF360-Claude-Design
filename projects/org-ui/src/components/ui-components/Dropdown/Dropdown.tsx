import {
  CSSProperties,
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

export interface DropdownOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
  description?: string;
  disabled?: boolean;
  variant?: 'default' | 'danger';
}

export interface DropdownTriggerRenderProps<T extends string> {
  isOpen: boolean;
  selectedOption?: DropdownOption<T>;
  placeholder: string;
  disabled: boolean;
}

export interface DropdownProps<T extends string> {
  options: DropdownOption<T>[];
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  trigger?:
    | ReactNode
    | ((props: DropdownTriggerRenderProps<T>) => ReactNode);
  triggerClassName?: string;
  /** Minimum width of the floating menu in pixels. Does not affect trigger width. */
  menuMinWidth?: number;
}

export function Dropdown<T extends string>({
  options,
  value,
  defaultValue,
  onChange,
  label,
  placeholder = 'Select option',
  helperText,
  error,
  disabled = false,
  fullWidth = true,
  className,
  trigger,
  triggerClassName,
  menuMinWidth,
}: DropdownProps<T>) {
  const hasCustomTrigger = trigger !== undefined;
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const customTriggerRef = useRef<HTMLDivElement>(null);
  const triggerRef = hasCustomTrigger ? customTriggerRef : buttonRef;
  const menuRef = useRef<HTMLDivElement>(null);
  const controlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<T | undefined>(
    defaultValue
  );
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showContent, setShowContent] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [placement, setPlacement] = useState<'top' | 'bottom'>('bottom');
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({
    top: 0,
    left: 0,
    minWidth: 192,
  });

  const generatedId = useId();
  const labelId = `${generatedId}-label`;
  const helperId = helperText ? `${generatedId}-helper` : undefined;
  const errorId = error ? `${generatedId}-error` : undefined;
  const listId = `${generatedId}-listbox`;

  const selectedValue = controlled ? value : internalValue;
  const selectedOption = options.find((option) => option.value === selectedValue);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    const syncPortalTarget = () => {
      setPortalTarget(
        (document.fullscreenElement as HTMLElement | null) ?? document.body
      );
    };

    syncPortalTarget();
    document.addEventListener('fullscreenchange', syncPortalTarget);
    document.addEventListener('webkitfullscreenchange', syncPortalTarget);

    return () => {
      document.removeEventListener('fullscreenchange', syncPortalTarget);
      document.removeEventListener('webkitfullscreenchange', syncPortalTarget);
    };
  }, [isMounted]);

  const setValue = (next: T) => {
    if (!controlled) {
      setInternalValue(next);
    }
    onChange?.(next);
  };

  const enabledOptions = useMemo(
    () => options.filter((option) => !option.disabled),
    [options]
  );

  useEffect(() => {
    if (!isOpen) {
      setShowContent(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setShowContent(true);
    }, 220);

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
        triggerRef.current?.focus();
      }
    };

    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onEscape);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onEscape);
    };
  }, [isOpen,triggerRef]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const computePlacement = () => {
      const triggerRect = triggerRef.current?.getBoundingClientRect();
      if (!triggerRect) {
        return;
      }

      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;
      const estimatedMenuHeight = Math.min(options.length * 52 + 12, 264);
      const shouldOpenTop =
        spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow;

      setPlacement(shouldOpenTop ? 'top' : 'bottom');

      const viewportPadding = 8;
      const minMenuWidth =
        menuMinWidth ?? (hasCustomTrigger ? 192 : triggerRect.width);
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
  }, [hasCustomTrigger, isOpen, menuMinWidth, options.length, triggerRef]);

  const openAndFocus = () => {
    if (disabled || enabledOptions.length === 0) {
      return;
    }
    setIsOpen(true);
    const currentIndex = options.findIndex(
      (option) => option.value === selectedValue && !option.disabled
    );
    setActiveIndex(currentIndex >= 0 ? currentIndex : options.findIndex((option) => !option.disabled));
  };

  const selectAtIndex = (index: number) => {
    const option = options[index];
    if (!option || option.disabled) {
      return;
    }
    setValue(option.value);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const moveActiveIndex = (step: 1 | -1) => {
    if (options.length === 0) {
      return;
    }

    let index = activeIndex;
    for (let tries = 0; tries < options.length; tries += 1) {
      index = (index + step + options.length) % options.length;
      if (!options[index]?.disabled) {
        setActiveIndex(index);
        return;
      }
    }
  };

  const onTriggerKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement | HTMLDivElement>
  ) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!isOpen) {
        openAndFocus();
      } else {
        moveActiveIndex(event.key === 'ArrowDown' ? 1 : -1);
      }
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (isOpen && activeIndex >= 0) {
        selectAtIndex(activeIndex);
      } else {
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
        {hasCustomTrigger ? (
          <div
            ref={customTriggerRef}
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-disabled={disabled || undefined}
            aria-labelledby={label ? `${labelId} ${generatedId}-button` : undefined}
            aria-describedby={[helperId, errorId].filter(Boolean).join(' ') || undefined}
            aria-invalid={Boolean(error)}
            id={`${generatedId}-button`}
            onClick={() => {
              if (disabled) {
                return;
              }
              if (isOpen) {
                setIsOpen(false);
              } else {
                openAndFocus();
              }
            }}
            onKeyDown={onTriggerKeyDown}
            className={cn(
              'inline-block outline-none focus:ring-2 focus:ring-accent/35 rounded-md',
              disabled && 'cursor-not-allowed opacity-55',
              triggerClassName
            )}
          >
            {renderedTrigger}
          </div>
        ) : (
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
            onKeyDown={onTriggerKeyDown}
            className={cn(
              'flex h-10 items-center justify-between gap-2 rounded-lg border border-border bg-white px-3 text-left text-sm text-zinc-900 shadow-sm outline-none transition-colors',
              'focus:border-accent focus:ring-2 focus:ring-accent/35',
              'disabled:cursor-not-allowed disabled:opacity-55',
              'dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50',
              'night:border-[#2d4a48] night:bg-[#142433] night:text-white',
              error &&
                'border-[var(--color-feedback-error)] focus:border-[var(--color-feedback-error)] focus:ring-[color-mix(in_srgb,var(--color-feedback-error)_35%,transparent)]',
              fullWidth && 'w-full',
              triggerClassName
            )}
          >
            <span className={cn(!selectedOption && 'text-zinc-400 dark:text-zinc-500 night:text-slate-500')}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronIcon className={cn('h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200 ease-out', isOpen && 'rotate-180')} />
          </button>
        )}

        {isMounted &&
          portalTarget &&
          createPortal(
            <div
              ref={menuRef}
              id={listId}
              role="listbox"
              aria-hidden={!isOpen}
              aria-labelledby={label ? labelId : undefined}
              tabIndex={isOpen ? -1 : undefined}
              onKeyDown={onListKeyDown}
              className={cn(
                'fixed z-[9999] overflow-hidden rounded-lg border bg-white shadow-lg',
                'transition-[max-height,opacity,transform,padding,border-color] duration-300 ease-out',
                isOpen
                  ? 'max-h-64 p-1 opacity-100'
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
              <ul
                className={cn(
                  'max-h-[248px] transition-opacity duration-180 ease-out',
                  isOpen && 'overflow-auto',
                  showContent ? 'opacity-100' : 'opacity-0'
                )}
              >
                {options.map((option, index) => {
                  const isSelected = option.value === selectedValue;
                  const isActive = index === activeIndex;
                  const isDanger = option.variant === 'danger';

                  return (
                    <li key={option.value} role="option" aria-selected={isSelected}>
                      <button
                        type="button"
                        tabIndex={isOpen ? 0 : -1}
                        disabled={option.disabled}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => selectAtIndex(index)}
                        className={cn(
                          'flex w-full cursor-pointer flex-col rounded-md px-3 py-2 text-left transition-[background-color,color,box-shadow] duration-400 ease-out',
                          'focus:outline-none focus:ring-2 focus:ring-accent/40',
                          isDanger
                            ? isActive || isSelected
                              ? 'bg-[var(--color-feedback-error-soft)] text-[var(--color-feedback-error-strong)]'
                              : 'text-[var(--color-feedback-error)] hover:bg-[var(--color-feedback-error-soft)]'
                            : isSelected
                              ? 'bg-accent/20 text-zinc-900 dark:bg-accent/25 dark:text-zinc-50 night:bg-accent/30 night:text-white'
                              : isActive
                                ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 night:bg-[#1a3044] night:text-white'
                                : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 night:text-slate-300 night:hover:bg-[#1a3044]',
                          option.disabled && 'cursor-not-allowed opacity-45 hover:bg-transparent'
                        )}
                      >
                        <span className="flex items-center gap-2">
                          {option.icon && (
                            <span
                              aria-hidden
                              className="text-current [&_svg]:h-4 [&_svg]:w-4"
                            >
                              {option.icon}
                            </span>
                          )}
                          <span className="text-sm font-medium">{option.label}</span>
                        </span>
                        {option.description && (
                          <span className="text-xs opacity-75">{option.description}</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>,
            portalTarget
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
