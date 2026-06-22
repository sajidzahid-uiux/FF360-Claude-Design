import { MoreHorizontal } from 'lucide-react';
import { ReactNode } from 'react';
import { cn } from '../../../utils/cn';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { Dropdown } from '../../ui-components/Dropdown';
import { TABLE_ACTIONS_TOUCH_LAYOUT_MEDIA_QUERY } from './tableActionsConstants';
import {
  tableItemActionsMenuClass,
  tableItemActionsRevealClass,
} from './tableItemActionsClasses';

export interface TableAction<T> {
  label: string;
  icon?: ReactNode;
  variant?: 'default' | 'danger';
  onClick: (item: T) => void;
}

export interface TableActionsProps<T> {
  item: T;
  actions: TableAction<T>[];
  /**
   * Quick actions shown as icon buttons on row hover (desktop).
   * Additional actions go in the overflow menu. Default 2.
   * Set to 0 to use the menu only.
   */
  maxVisibleActions?: number;
  /**
   * On touch / narrow viewports, use a single overflow menu instead of inline icons.
   * Uses `TABLE_ACTIONS_TOUCH_LAYOUT_MEDIA_QUERY`. Default true.
   */
  collapseOnTouch?: boolean;
  className?: string;
}

function TableActionIconButton({
  label,
  icon,
  variant = 'default',
  onClick,
}: {
  label: string;
  icon?: ReactNode;
  variant?: 'default' | 'danger';
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={cn(
        'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
        'text-text-muted hover:bg-bg-hover hover:text-text-primary',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35',
        variant === 'danger' &&
          'hover:bg-[var(--color-feedback-error-soft)] hover:text-[var(--color-feedback-error)]'
      )}
    >
      {icon ? (
        <span className="inline-flex [&_svg]:h-4 [&_svg]:w-4">{icon}</span>
      ) : (
        <span className="text-xs font-medium">{label.slice(0, 1)}</span>
      )}
    </button>
  );
}

function actionsToMenuOptions<T>(actions: TableAction<T>[]) {
  return actions.map((action, index) => ({
    value: String(index),
    label: action.label,
    icon: action.icon,
    variant: action.variant,
  }));
}

function TableActionsOverflowMenu<T>({
  item,
  actions,
  className,
  ariaLabel = 'Row actions',
}: {
  item: T;
  actions: TableAction<T>[];
  className?: string;
  ariaLabel?: string;
}) {
  const menuOptions = actionsToMenuOptions(actions);

  return (
    <div
      className={cn(tableItemActionsMenuClass, className)}
      data-table-actions-layout="menu"
      onClick={(event) => event.stopPropagation()}
    >
      <Dropdown<string>
        options={menuOptions}
        placeholder=""
        fullWidth={false}
        triggerClassName="inline-flex"
        menuMinWidth={176}
        trigger={() => (
          <span
            className={cn(
              'border-border-subtle/80 bg-bg-surface-elevated/95 inline-flex h-8 w-8 items-center justify-center rounded-lg border shadow-sm',
              'text-text-muted backdrop-blur-sm transition-colors',
              'hover:bg-bg-hover hover:text-text-primary'
            )}
            aria-label={ariaLabel}
          >
            <MoreHorizontal className="h-4 w-4" aria-hidden strokeWidth={2} />
          </span>
        )}
        onChange={(value) => {
          const selectedIndex = Number.parseInt(value, 10);
          const selectedAction = actions[selectedIndex];
          if (selectedAction) {
            selectedAction.onClick(item);
          }
        }}
      />
    </div>
  );
}

export function TableActions<T>({
  item,
  actions,
  maxVisibleActions = 2,
  collapseOnTouch = true,
  className,
}: TableActionsProps<T>) {
  const isTouchLayout = useMediaQuery(TABLE_ACTIONS_TOUCH_LAYOUT_MEDIA_QUERY);
  const useTouchMenu = collapseOnTouch !== false && isTouchLayout;

  if (actions.length === 0) {
    return null;
  }

  if (useTouchMenu) {
    return (
      <TableActionsOverflowMenu item={item} actions={actions} className={className} />
    );
  }

  const quickCount =
    actions.length <= 3
      ? actions.length
      : Math.min(Math.max(0, maxVisibleActions), actions.length);
  const quickActions = actions.slice(0, quickCount);
  const menuActions = actions.slice(quickCount);

  const menuOptions = actionsToMenuOptions(menuActions);

  return (
    <div
      className={cn(
        'flex min-h-8 w-full max-w-full min-w-0 items-center justify-end',
        tableItemActionsRevealClass,
        className
      )}
      data-table-actions-layout="inline"
      onClick={(event) => event.stopPropagation()}
    >
      <div
        className={cn(
          'border-border-subtle/80 bg-bg-surface-elevated/95 inline-flex items-center gap-0.5 rounded-lg border p-0.5 shadow-sm',
          'backdrop-blur-sm'
        )}
      >
        {quickActions.map((action) => (
          <TableActionIconButton
            key={action.label}
            label={action.label}
            icon={action.icon}
            variant={action.variant}
            onClick={() => action.onClick(item)}
          />
        ))}

        {menuActions.length > 0 ? (
          <Dropdown<string>
            options={menuOptions}
            placeholder=""
            fullWidth={false}
            triggerClassName="inline-flex"
            menuMinWidth={176}
            trigger={() => (
              <span
                className={cn(
                  'inline-flex h-8 w-8 items-center justify-center rounded-lg',
                  'text-text-muted transition-colors',
                  'hover:bg-bg-hover hover:text-text-primary'
                )}
              >
                <MoreHorizontal className="h-4 w-4" aria-hidden strokeWidth={2} />
              </span>
            )}
            onChange={(value) => {
              const selectedIndex = Number.parseInt(value, 10);
              const selectedAction = menuActions[selectedIndex];
              if (selectedAction) {
                selectedAction.onClick(item);
              }
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
