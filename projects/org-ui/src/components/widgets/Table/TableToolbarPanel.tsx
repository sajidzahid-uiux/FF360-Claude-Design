import { ReactNode, RefObject } from 'react';
import { TableToolbarPopover } from './TableToolbarPopover';

export interface TableToolbarPanelProps {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  children: ReactNode;
  className?: string;
}

/** Floating panel for toolbar filter, sort, and settings — does not shift table content. */
export function TableToolbarPanel({
  open,
  onClose,
  anchorRef,
  children,
  className,
}: TableToolbarPanelProps) {
  return (
    <TableToolbarPopover
      open={open}
      onClose={onClose}
      anchorRef={anchorRef}
      className={className}
    >
      {children}
    </TableToolbarPopover>
  );
}
