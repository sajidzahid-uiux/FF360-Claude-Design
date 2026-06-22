import { cn } from '../../../utils/cn';

/** Raised card used in grid and kanban — contrasts with recessed canvas/columns. */
export const tableCollectionCardClass = cn(
  'border-border-subtle/90 bg-white',
  'shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.06),0_8px_20px_-4px_rgba(0,0,0,0.14)]',
  'ring-1 ring-inset ring-white/60',
  'dark:border-zinc-600/70 dark:bg-zinc-800',
  'dark:shadow-[0_0_0_1px_rgba(255,255,255,0.07),0_1px_0_rgba(255,255,255,0.05),0_10px_28px_-6px_rgba(0,0,0,0.55)]',
  'dark:ring-white/[0.06]',
  'night:border-[#2d4a48] night:bg-[#1a2f3d]',
  'night:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_12px_28px_-8px_rgba(0,0,0,0.5)]',
  'night:ring-white/[0.05]',
  'transition-[box-shadow,transform,border-color] duration-200 ease-out',
  'hover:border-border-strong/90 hover:-translate-y-px',
  'hover:shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_12px_28px_-6px_rgba(0,0,0,0.18)]',
  'dark:hover:shadow-[0_0_0_1px_rgba(255,255,255,0.09),0_16px_36px_-8px_rgba(0,0,0,0.65)]',
  'night:hover:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_16px_36px_-8px_rgba(0,0,0,0.55)]'
);

export const tableCollectionCardSelectedClass = cn(
  'border-accent/70 bg-accent-light/30 ring-2 ring-accent/25',
  'dark:bg-zinc-800 dark:ring-accent/30',
  'night:bg-[#1e3648] night:ring-accent/35'
);

export const tableCollectionCardHeaderClass = cn(
  'border-border-subtle/60 border-b',
  'bg-bg-surface/70 dark:bg-zinc-900/50 night:bg-[#152a38]/80'
);

/** Recessed area behind grid cards. */
export const tableCollectionCanvasClass = cn(
  'bg-bg-surface/55 dark:bg-zinc-950/40 night:bg-[#0b1623]/70'
);

/** Kanban column well — sits below elevated cards. */
export const tableKanbanColumnClass = cn(
  'border-border-subtle/70 bg-bg-surface/90',
  'shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)]',
  'dark:border-zinc-800/80 dark:bg-zinc-950/55',
  'dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),inset_0_2px_10px_rgba(0,0,0,0.4)]',
  'night:border-[#1e3040] night:bg-[#0f1a26]',
  'night:shadow-[inset_0_2px_12px_rgba(0,0,0,0.35)]'
);

export const tableKanbanColumnHeaderClass = cn(
  'border-border-subtle/60 border-b',
  'bg-bg-surface dark:bg-zinc-900/70 night:bg-[#132331]'
);
