import { ReactNode, useEffect, useState } from 'react';
import { cn } from '../../../utils/cn';

export interface TableRevealProps {
  show: boolean;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  /** Collapse duration in ms — keeps children mounted until finished. */
  durationMs?: number;
}

/**
 * Smooth height + opacity reveal for bulk bar, toolbar panels, etc.
 */
export function TableReveal({
  show,
  children,
  className,
  contentClassName,
  durationMs = 280,
}: TableRevealProps) {
  const [mounted, setMounted] = useState(show);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (show) {
      setMounted(true);
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setOpen(true));
      });
      return () => cancelAnimationFrame(frame);
    }

    setOpen(false);
    const timer = window.setTimeout(() => setMounted(false), durationMs);
    return () => window.clearTimeout(timer);
  }, [show, durationMs]);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={cn(
        'grid w-full min-w-0 transition-[grid-template-rows,opacity] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none',
        open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        className
      )}
      style={{ transitionDuration: `${durationMs}ms` }}
    >
      <div className="min-h-0 min-w-0 overflow-hidden">
        <div
          className={cn(
            'w-full min-w-0',
            open && 'table-reveal-content-in',
            contentClassName
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
