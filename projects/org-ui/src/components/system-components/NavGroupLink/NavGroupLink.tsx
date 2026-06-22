import { CSSProperties, MouseEvent, ReactNode, useMemo } from 'react';
import { useTheme } from '../../../theme';
import { getAccentTextColor, toAccentLight } from '../../../utils/accent';

export interface NavGroupLinkProps {
  href: string;
  isActive: boolean;
  isCollapsed?: boolean;
  icon: ReactNode;
  title: ReactNode;
  /** Native browser tooltip (collapsed icon-only links and badge rows). */
  tooltipTitle?: string;
  className?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  linkComponent?: (props: {
    href: string;
    children: ReactNode;
    className?: string;
    onClick?: (event: MouseEvent<HTMLElement>) => void;
    /** Native tooltip when the link is icon-only (string labels only). */
    title?: string;
    style?: CSSProperties;
  }) => ReactNode;
}

function collapsedLinkTooltip(title: ReactNode): string | undefined {
  if (typeof title === 'string') {
    return title;
  }
  if (typeof title === 'number') {
    return String(title);
  }
  return undefined;
}

export function NavGroupLink({
  href,
  isActive,
  isCollapsed = false,
  icon,
  title,
  tooltipTitle,
  className,
  onClick,
  linkComponent,
}: NavGroupLinkProps) {
  const { accentColor } = useTheme();
  const activeBg = useMemo(
    () => toAccentLight(accentColor || '#D9F46E'),
    [accentColor]
  );
  const activeFg = useMemo(() => getAccentTextColor(activeBg), [activeBg]);

  const content = (
    <span className={`flex items-center ${isCollapsed ? '' : 'gap-2'}`}>
      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center leading-none">
        {icon}
      </span>
      {!isCollapsed ? <span className="leading-5">{title}</span> : null}
    </span>
  );

  const resolvedClassName = `relative flex items-center overflow-hidden border-l-2 px-2 py-2 text-sm transition-colors duration-200 ${
    isActive
      ? 'border-l-accent font-semibold'
      : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary border-l-transparent'
  } ${isCollapsed ? 'justify-center' : ''} ${className ?? ''}`;
  const resolvedStyle = isActive
    ? { backgroundColor: activeBg, color: activeFg }
    : undefined;
  const nativeTitle =
    tooltipTitle ??
    (isCollapsed ? collapsedLinkTooltip(title) : undefined);

  if (linkComponent) {
    return linkComponent({
      href,
      onClick,
      className: resolvedClassName,
      title: nativeTitle,
      style: resolvedStyle,
      children: content,
    });
  }

  return (
    <a
      href={href}
      onClick={onClick as ((event: MouseEvent<HTMLAnchorElement>) => void) | undefined}
      className={resolvedClassName}
      title={nativeTitle}
      style={resolvedStyle}
    >
      {content}
    </a>
  );
}
