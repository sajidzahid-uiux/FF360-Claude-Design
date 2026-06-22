import {
  CSSProperties,
  MouseEvent,
  ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
} from 'react';
import { cn } from '../../../utils/cn';
import { getAccentTextColor, toAccentLight } from '../../../utils/accent';
import { useTheme } from '../../../theme';
import { NavGroupLink, type NavGroupLinkProps } from '../NavGroupLink';

export interface NavExpandableMenuChild {
  id: string;
  href: string;
  title: string;
  icon: ReactNode;
  isActive?: boolean;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
}

export interface NavExpandableMenuItemProps {
  id: string;
  title: string;
  icon: ReactNode;
  items: NavExpandableMenuChild[];
  isCollapsed?: boolean;
  isExpanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /** When true (default), expands automatically while a child route is active. */
  expandWhenChildActive?: boolean;
  isActive?: boolean;
  className?: string;
  linkComponent?: NavGroupLinkProps['linkComponent'];
}

const ChevronIcon = ({ expanded }: { expanded: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    className={cn(
      'h-4 w-4 shrink-0 text-text-muted transition-transform duration-200',
      expanded && 'rotate-90'
    )}
    aria-hidden
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
  </svg>
);

export function NavExpandableMenuItem({
  id,
  title,
  icon,
  items,
  isCollapsed = false,
  isExpanded,
  defaultExpanded = false,
  onExpandedChange,
  expandWhenChildActive = true,
  isActive,
  className,
  linkComponent,
}: NavExpandableMenuItemProps) {
  const submenuId = useId();
  const { accentColor } = useTheme();

  const hasActiveChild = useMemo(
    () => items.some((item) => item.isActive),
    [items]
  );

  const resolvedParentActive = isActive ?? hasActiveChild;

  const [uncontrolledExpanded, setUncontrolledExpanded] = useState(
    defaultExpanded || (expandWhenChildActive && hasActiveChild)
  );

  const isControlled = isExpanded !== undefined;
  const expanded = isControlled ? isExpanded : uncontrolledExpanded;

  useEffect(() => {
    if (!expandWhenChildActive || isControlled || !hasActiveChild) return;
    setUncontrolledExpanded(true);
  }, [expandWhenChildActive, hasActiveChild, isControlled]);

  const setExpanded = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setUncontrolledExpanded(next);
      }
      onExpandedChange?.(next);
    },
    [isControlled, onExpandedChange]
  );

  const activeBg = useMemo(
    () => toAccentLight(accentColor || '#D9F46E'),
    [accentColor]
  );
  const activeFg = useMemo(() => getAccentTextColor(activeBg), [activeBg]);

  const triggerClassName = cn(
    'relative flex w-full items-center overflow-hidden border-l-2 px-2 py-2 text-sm transition-colors duration-200',
    resolvedParentActive
      ? 'border-l-accent font-semibold'
      : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary border-l-transparent',
    isCollapsed ? 'justify-center' : 'gap-2',
    className
  );

  const triggerStyle: CSSProperties | undefined = resolvedParentActive
    ? { backgroundColor: activeBg, color: activeFg }
    : undefined;

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  return (
    <div data-nav-expandable-id={id} className="w-full">
      <button
        type="button"
        aria-expanded={isCollapsed ? false : expanded}
        aria-controls={submenuId}
        onClick={handleToggle}
        className={triggerClassName}
        style={triggerStyle}
        title={isCollapsed ? title : undefined}
      >
        <span
          className={cn(
            'flex min-w-0 flex-1 items-center',
            isCollapsed ? 'justify-center' : 'gap-2'
          )}
        >
          <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center leading-none">
            {icon}
          </span>
          {!isCollapsed ? (
            <span className="truncate text-left leading-5">{title}</span>
          ) : null}
        </span>
        {!isCollapsed ? <ChevronIcon expanded={expanded} /> : null}
      </button>

      {!isCollapsed && expanded ? (
        <div
          id={submenuId}
          role="group"
          aria-label={`${title} submenu`}
          className="border-border-subtle mt-1 ml-3 space-y-1 border-l pl-2"
        >
          {items.map((item) => (
            <NavGroupLink
              key={item.id}
              href={item.href}
              isActive={Boolean(item.isActive)}
              isCollapsed={false}
              icon={item.icon}
              title={item.title}
              onClick={item.onClick}
              linkComponent={linkComponent}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
