import {
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ComponentSizeEnum,
  CornerRadiusEnum,
  TabsSwitcherViewEnum,
  type ComponentSize,
  type CornerRadius,
  type TabsSwitcherView,
} from '../../../constants';
import { cn } from '../../../utils/cn';

export type TabsSwitcherSize = ComponentSize;
export type TabsSwitcherRadius = CornerRadius;
export type TabsSwitcherViewMode = TabsSwitcherView;

export interface TabsSwitcherItem<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface TabsSwitcherProps<T extends string> {
  items: TabsSwitcherItem<T>[];
  value?: T;
  defaultValue?: T;
  /** Second argument is present when the change came from a tab button click (for theme reveal origin, etc.). */
  onChange?: (value: T, sourceEvent?: MouseEvent<HTMLButtonElement>) => void;
  label?: string;
  fullWidth?: boolean;
  size?: TabsSwitcherSize;
  radius?: TabsSwitcherRadius;
  view?: TabsSwitcherViewMode;
  className?: string;
}

export function TabsSwitcher<T extends string>({
  items,
  value,
  defaultValue,
  onChange,
  label,
  fullWidth = false,
  size = ComponentSizeEnum.MD,
  radius = CornerRadiusEnum.MD,
  view = TabsSwitcherViewEnum.PILL,
  className,
}: TabsSwitcherProps<T>) {
  const generatedId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const controlled = value !== undefined;
  const firstEnabled = useMemo(
    () => items.find((item) => !item.disabled)?.value,
    [items]
  );
  const [internalValue, setInternalValue] = useState<T | undefined>(
    defaultValue ?? firstEnabled
  );

  const currentValue = controlled ? value : internalValue;
  const activeIndex = useMemo(
    () => items.findIndex((item) => item.value === currentValue),
    [items, currentValue]
  );

  const setValue = (next: T, sourceEvent?: MouseEvent<HTMLButtonElement>) => {
    if (!controlled) {
      setInternalValue(next);
    }
    if (sourceEvent !== undefined) {
      onChange?.(next, sourceEvent);
    } else {
      onChange?.(next);
    }
  };

  const moveSelection = (step: 1 | -1) => {
    if (!currentValue) {
      if (firstEnabled) {
        setValue(firstEnabled);
      }
      return;
    }

    const currentIndex = items.findIndex((item) => item.value === currentValue);
    if (currentIndex < 0) {
      return;
    }

    let nextIndex = currentIndex;
    for (let tries = 0; tries < items.length; tries += 1) {
      nextIndex = (nextIndex + step + items.length) % items.length;
      const nextItem = items[nextIndex];
      if (!nextItem.disabled) {
        setValue(nextItem.value);
        return;
      }
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      moveSelection(1);
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      moveSelection(-1);
    }
  };

  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    width: number;
  } | null>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || activeIndex < 0) {
      setIndicatorStyle(null);
      return;
    }

    const activeItem = items[activeIndex];
    if (!activeItem) {
      setIndicatorStyle(null);
      return;
    }

    const activeTabEl = tabRefs.current.get(activeItem.value);
    if (!activeTabEl) {
      setIndicatorStyle(null);
      return;
    }

    const update = () => {
      const containerRect = container.getBoundingClientRect();
      const tabRect = activeTabEl.getBoundingClientRect();
      setIndicatorStyle({
        left: tabRect.left - containerRect.left,
        width: tabRect.width,
      });
    };

    update();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(update);
      observer.observe(container);
      observer.observe(activeTabEl);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
    };
  }, [activeIndex, items]);

  const trackRadiusClass =
    radius === CornerRadiusEnum.SM
      ? 'rounded-md'
      : radius === CornerRadiusEnum.MD
        ? 'rounded-lg'
        : radius === CornerRadiusEnum.LG
          ? 'rounded-xl'
          : 'rounded-full';

  const itemRadiusClass =
    radius === CornerRadiusEnum.SM
      ? 'rounded-[6px]'
      : radius === CornerRadiusEnum.MD
        ? 'rounded-md'
        : radius === CornerRadiusEnum.LG
          ? 'rounded-lg'
          : 'rounded-full';

  const sizeClass =
    size === ComponentSizeEnum.SM
      ? 'px-2.5 py-1 text-xs'
      : size === ComponentSizeEnum.LG
        ? 'px-4 py-2 text-base'
        : 'px-3 py-1.5 text-sm';

  const iconSizeClass =
    size === ComponentSizeEnum.SM
      ? 'h-3.5 w-3.5'
      : size === ComponentSizeEnum.LG
        ? 'h-5 w-5'
        : 'h-4 w-4';
  const isUnderlined = view === TabsSwitcherViewEnum.UNDERLINED;

  return (
    <div className={cn('space-y-1.5 min-w-0', fullWidth && 'w-full', className)}>
      {label && (
        <p
          id={`${generatedId}-label`}
          className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 night:text-slate-400"
        >
          {label}
        </p>
      )}

      <div
        ref={containerRef}
        role="tablist"
        aria-labelledby={label ? `${generatedId}-label` : undefined}
        onKeyDown={onKeyDown}
        className={cn(
          'relative flex min-w-0',
          fullWidth ? 'w-full' : 'inline-flex w-auto',
          isUnderlined
            ? 'bg-transparent p-0'
            : 'bg-accent/12 p-1 dark:bg-accent/14 night:border-border-subtle night:bg-bg-surface',
          trackRadiusClass
        )}
      >
        {indicatorStyle && (
          <span
            aria-hidden
            className={cn(
              'pointer-events-none absolute box-border transition-[left,width] duration-300 ease-out',
              isUnderlined
                ? 'bottom-0 h-1 rounded-full bg-accent'
                : 'inset-y-1 border border-accent/70 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] dark:border-accent dark:bg-accent/28 dark:shadow-none night:border-accent night:bg-bg-surface-elevated night:shadow-none',
              !isUnderlined && itemRadiusClass
            )}
            style={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
            }}
          />
        )}
        {items.map((item) => {
          const isActive = item.value === currentValue;
          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`${generatedId}-${item.value}-panel`}
              ref={(el) => {
                if (el) {
                  tabRefs.current.set(item.value, el);
                } else {
                  tabRefs.current.delete(item.value);
                }
              }}
              disabled={item.disabled}
              onClick={(e) => setValue(item.value, e)}
              className={cn(
                'relative z-10 flex cursor-pointer items-center justify-center border-0 font-medium transition-colors duration-200',
                fullWidth
                  ? cn(
                      'min-w-0 flex-1 gap-1',
                      size === ComponentSizeEnum.SM
                        ? 'px-1.5 py-1 text-xs sm:gap-1.5 sm:px-2.5'
                        : size === ComponentSizeEnum.LG
                          ? 'px-2 py-1.5 text-sm sm:gap-1.5 sm:px-4 sm:py-2 sm:text-base'
                          : 'px-2 py-1.5 text-sm sm:gap-1.5 sm:px-3'
                    )
                  : cn('shrink-0 gap-1.5 whitespace-nowrap', sizeClass),
                isUnderlined && 'pb-3',
                !isUnderlined && itemRadiusClass,
                'focus:outline-none focus:ring-0',
                isActive
                  ? cn(
                      'text-zinc-900 dark:text-zinc-50',
                      isUnderlined ? 'night:text-accent' : 'night:text-text-primary'
                    )
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100 night:text-slate-200 night:hover:text-white',
                item.disabled &&
                  'cursor-not-allowed opacity-45 hover:text-inherit'
              )}
            >
              {item.icon && (
                <span aria-hidden className={cn('shrink-0', iconSizeClass)}>
                  {item.icon}
                </span>
              )}
              <span className={cn(fullWidth && 'truncate')}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
