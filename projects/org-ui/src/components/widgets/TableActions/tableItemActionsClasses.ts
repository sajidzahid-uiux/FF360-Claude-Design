import { cn } from '../../../utils/cn';

/**
 * Hover-reveal for list rows and grid/kanban cards on pointer-fine desktops only.
 * Touch / coarse pointers stay visible via global `.table-row-actions` CSS (mobile-first).
 */
export const tableItemActionsRevealClass = cn(
  'table-row-actions',
  'transition-[opacity,transform] duration-200 ease-out',
  'group-hover/table-row:opacity-100 group-hover/table-row:translate-x-0 group-hover/table-row:pointer-events-auto',
  'group-hover/table-card:opacity-100 group-hover/table-card:translate-x-0 group-hover/table-card:pointer-events-auto',
  'group-focus-within/table-row:opacity-100 group-focus-within/table-row:translate-x-0 group-focus-within/table-row:pointer-events-auto',
  'group-focus-within/table-card:opacity-100 group-focus-within/table-card:translate-x-0 group-focus-within/table-card:pointer-events-auto',
  'focus-within:opacity-100 focus-within:translate-x-0 focus-within:pointer-events-auto'
);

/** Touch / narrow layout: always-visible overflow menu (no hover reveal). */
export const tableItemActionsMenuClass = cn(
  'table-row-actions table-row-actions--menu',
  'flex min-h-8 min-w-8 items-center justify-end'
);
