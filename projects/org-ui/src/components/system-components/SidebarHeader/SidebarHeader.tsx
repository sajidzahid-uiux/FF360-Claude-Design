import { ReactNode } from 'react';
import { useTheme } from '../../../theme';
import { ThemeModeEnum } from '../../../constants';
import { getAccentTextColor } from '../../../utils/accent';

export interface SidebarHeaderProps {
  title: string;
  logo: ReactNode;
  isCollapsed?: boolean;
  children?: ReactNode;
}

export function SidebarHeader({
  title,
  logo,
  isCollapsed = false,
  children,
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
      <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}>
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: logoBackground, color: logoForeground }}
        >
          {logo}
        </span>
        {!isCollapsed ? (
          <span className="text-text-primary truncate text-base font-semibold">{title}</span>
        ) : null}
      </div>
    </div>
  );
}
