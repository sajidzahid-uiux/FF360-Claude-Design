import {
  CSSProperties,
  ReactNode,
  RefObject,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../../utils/cn';

export interface TableToolbarPopoverProps {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  children: ReactNode;
  className?: string;
}

const VIEWPORT_PADDING = 8;
const PANEL_GAP = 8;
const DEFAULT_MAX_WIDTH = 480;
const DEFAULT_MIN_WIDTH = 320;

export function TableToolbarPopover({
  open,
  onClose,
  anchorRef,
  children,
  className,
}: TableToolbarPopoverProps) {
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isPositioned, setIsPositioned] = useState(false);
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({
    visibility: 'hidden',
    minWidth: DEFAULT_MIN_WIDTH,
    maxWidth: DEFAULT_MAX_WIDTH,
    maxHeight: 480,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setIsPositioned(false);
      return;
    }

    const updatePosition = () => {
      const anchorRect = anchorRef.current?.getBoundingClientRect();
      if (!anchorRect) {
        return;
      }

      const minWidth = Math.max(anchorRect.width, DEFAULT_MIN_WIDTH);
      const maxWidth = Math.min(
        DEFAULT_MAX_WIDTH,
        window.innerWidth - VIEWPORT_PADDING * 2
      );
      const width = Math.min(Math.max(minWidth, DEFAULT_MIN_WIDTH), maxWidth);
      const left = Math.min(
        Math.max(VIEWPORT_PADDING, anchorRect.left),
        window.innerWidth - width - VIEWPORT_PADDING
      );
      const spaceBelow = window.innerHeight - anchorRect.bottom - PANEL_GAP;
      const maxHeight = Math.max(
        160,
        Math.min(480, spaceBelow - VIEWPORT_PADDING)
      );

      setPanelStyle({
        position: 'fixed',
        top: anchorRect.bottom + PANEL_GAP,
        left,
        width,
        minWidth,
        maxWidth: width,
        maxHeight,
        zIndex: 60,
        visibility: 'visible',
      });
      setIsPositioned(true);
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [anchorRef, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedPanel = panelRef.current?.contains(target);
      const clickedAnchor = anchorRef.current?.contains(target);
      if (!clickedPanel && !clickedAnchor) {
        onClose();
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onEscape);

    return () => {
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onEscape);
    };
  }, [anchorRef, onClose, open]);

  if (!open || !isMounted || !isPositioned) {
    return null;
  }

  return createPortal(
    <div
      ref={panelRef}
      id={panelId}
      role="dialog"
      aria-modal="false"
      className={cn(
        'ff-table-toolbar-popover border-border-subtle bg-bg-surface-elevated text-text-primary overscroll-contain rounded-xl border p-5 shadow-lg shadow-black/10 dark:shadow-black/30',
        className
      )}
      style={panelStyle}
    >
      {children}
    </div>,
    document.body
  );
}
