import { ReactNode } from 'react';
import { useTheme } from '../../../theme';
import { ThemeModeEnum } from '../../../constants';
import { getAccentTextColor } from '../../../utils/accent';
import { SidebarCollapseButton } from '../SidebarCollapseButton';

export interface SidebarHeaderProps {
  title: string;
  logo: ReactNode;
  isCollapsed?: boolean;
  children?: ReactNode;
  /** Render the collapse/expand arrow toggle in the header (top of the sidebar). */
  showCollapseToggle?: boolean;
  onToggleCollapsed?: () => void;
}

export function SidebarHeader({
  title,
  logo,
  isCollapsed = false,
  children,
  showCollapseToggle = false,
  onToggleCollapsed,
}: SidebarHeaderProps) {
  const { accentColor, resolvedMode } = useTheme();
  const resolvedAccent = accentColor || '#D7F27A';
  const isDarkLikeTheme =
    resolvedMode === ThemeModeEnum.DARK || resolvedMode === ThemeModeEnum.NIGHT;
  const logoBackground = isDarkLikeTheme ? resolvedAccent : '#000000';
  const logoForeground = isDarkLikeTheme
    ? getAccentTextColor(resolvedAccent)
    : resolvedAccent;

  return (
    <div className="p-4">
      {!isCollapsed && children ? <div className="mb-2">{children}</div> : null}
      <div className={`flex items-center gap-2 ${isCollapsed ? 'flex-col justify-center' : ''}`}>
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: logoBackground, color: logoForeground }}
        >
          {logo}
        </span>
        {!isCollapsed ? (
          <span className="text-text-primary truncate text-base font-semibold">{title}</span>
        ) : null}
        {showCollapseToggle && onToggleCollapsed ? (
          <SidebarCollapseButton
            className={isCollapsed ? 'mt-1' : 'ml-auto'}
            isCollapsed={isCollapsed}
            onToggle={onToggleCollapsed}
          />
        ) : null}
      </div>
    </div>
  );
}
