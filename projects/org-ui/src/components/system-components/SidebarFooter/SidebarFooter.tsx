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
    <div className={`border-border-subtle/60 border-t ${isCollapsed ? 'p-[6px]' : 'p-[12px]'}`}>
      <div className="flex items-center gap-2">
        <Dropdown
          className="min-w-0 flex-1"
          options={options}
          placeholder=""
          fullWidth
          menuMinWidth={232}
          triggerClassName="w-full !rounded-lg bg-transparent p-0 focus:ring-0 focus-visible:ring-2 focus-visible:ring-accent/35"
          onChange={(value) => {
            const action = actions.find((item) => item.id === value);
            if (action) action.onSelect();
          }}
          trigger={({ isOpen }) => (
            <span
              aria-label={isOpen ? 'Close account menu' : 'Open account menu'}
              className={`flex cursor-pointer items-center rounded-lg transition-colors ${
                isCollapsed ? 'justify-center p-1' : 'w-full gap-2 px-2 py-1.5'
              } ${isOpen ? 'bg-bg-surface' : 'hover:bg-bg-surface'}`}
            >
              <Avatar src={user.avatarSrc} fallback={initials} size={isCollapsed ? 'sm' : 'md'} />

              {!isCollapsed ? (
                <>
                  <span className="min-w-0 flex-1 text-left">
                    <span className="text-text-secondary block truncate text-sm">{user.fullName}</span>
                    {user.subtitle ? (
                      <span className="text-text-primary block truncate text-sm">{user.subtitle}</span>
                    ) : null}
                  </span>
                  <ChevronUpDownIcon
                    className={`text-text-muted h-4 w-4 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'opacity-100' : 'opacity-70'
                    }`}
                  />
                </>
              ) : null}
            </span>
          )}
        />

        {showCollapseToggle ? (
          <SidebarCollapseButton isCollapsed={isCollapsed} onToggle={onToggleCollapsed} />
        ) : null}
      </div>
    </div>
  );
}

function ChevronUpDownIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={className}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
    </svg>
  );
}
