import { ReactNode, useMemo } from 'react';
import { Avatar } from '../../ui-components/Avatar';
import { type DropdownOption, Dropdown } from '../../ui-components/Dropdown';
import { SidebarCollapseButton } from '../SidebarCollapseButton';

export interface SidebarFooterUser {
  fullName: string;
  subtitle?: string;
  avatarSrc?: string;
  avatarFallback?: string;
}

export interface SidebarFooterAction {
  id: string;
  label: string;
  onSelect: () => void;
  icon?: ReactNode;
  tone?: 'default' | 'danger';
}

export interface SidebarFooterProps {
  isCollapsed: boolean;
  user: SidebarFooterUser;
  actions: SidebarFooterAction[];
  onToggleCollapsed: () => void;
  /** Desktop collapse control; hidden on mobile drawer where the sidebar is always expanded. */
  showCollapseToggle?: boolean;
}

export function SidebarFooter({
  isCollapsed,
  user,
  actions,
  onToggleCollapsed,
  showCollapseToggle = true,
}: SidebarFooterProps) {
  const initials =
    user.avatarFallback ??
    (user.fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') ||
      'U');

  const options = useMemo(
    () =>
      actions.map((action) => ({
        value: action.id,
        label: action.label,
        icon: action.icon,
        variant: (action.tone === 'danger' ? 'danger' : 'default') as NonNullable<
          DropdownOption<string>['variant']
        >,
      })),
    [actions]
  );

  return (
    <div className={`border-border-subtle/60 border-t ${isCollapsed ? 'p-[6px] pr-0' : 'p-[12px]'}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="relative flex min-w-0 flex-1 items-center gap-2">
          <Dropdown
            options={options}
            placeholder=""
            fullWidth={false}
            triggerClassName="inline-flex !rounded-full bg-transparent p-0 focus:ring-0 focus-visible:ring-0"
            onChange={(value) => {
              const action = actions.find((item) => item.id === value);
              if (action) action.onSelect();
            }}
            trigger={({ isOpen }) => (
              <span
                className={`inline-flex rounded-full ${isOpen ? 'ring-2 ring-accent/60 ring-offset-2 ring-offset-[var(--color-bg-surface)]' : 'focus-visible:ring-border-strong focus-visible:ring-2'} focus:outline-none`}
                aria-label={isOpen ? 'Close user menu' : 'Open user menu'}
                role="img"
              >
                <Avatar src={user.avatarSrc} fallback={initials} size={isCollapsed ? 'sm' : 'md'} />
              </span>
            )}
          />

          {!isCollapsed ? (
            <div className="min-w-0 flex-1">
              <p className="text-text-secondary truncate text-sm">{user.fullName}</p>
              {user.subtitle ? <p className="text-text-primary truncate text-sm">{user.subtitle}</p> : null}
            </div>
          ) : null}
        </div>

        {showCollapseToggle ? (
          <SidebarCollapseButton isCollapsed={isCollapsed} onToggle={onToggleCollapsed} />
        ) : null}
      </div>
    </div>
  );
}

