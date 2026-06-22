"use client";

import {
  CSSProperties,
  ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "@fieldflow360/org-ui";
import { ChevronRight } from "lucide-react";

import type { DropdownItem } from "./types";

const VIEWPORT_PADDING = 8;

interface MenuPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  items: DropdownItem[];
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  width?: number | "auto" | "full";
  contentClassName?: string;
  itemClassName?: string;
  mode?: "action" | "select";
  selectedValue?: string;
  onValueChange?: (value: string) => void;
  header?: ReactNode;
  footer?: ReactNode;
  customContent?: ReactNode;
  preventCloseOnInteract?: boolean;
}

function MenuItems({
  items,
  itemClassName,
  mode = "action",
  selectedValue,
  onValueChange,
  onClose,
}: {
  items: DropdownItem[];
  itemClassName?: string;
  mode?: "action" | "select";
  selectedValue?: string;
  onValueChange?: (value: string) => void;
  onClose: () => void;
}) {
  const visible = items.filter((item) => !("hidden" in item && item.hidden));

  return (
    <>
      {visible.map((item) => {
        if (item.type === "separator") {
          return (
            <div
              key={item.id}
              className="bg-border-subtle my-1 h-px"
              role="separator"
            />
          );
        }

        if (item.type === "header") {
          return (
            <div
              key={item.id}
              className="text-text-muted px-3 py-1.5 text-xs font-semibold tracking-wide uppercase"
            >
              {item.label}
            </div>
          );
        }

        const isSelected = mode === "select" && selectedValue === item.id;
        const visibleSubmenu = (item.submenu ?? []).filter(
          (sub) => !("hidden" in sub && sub.hidden)
        );

        if (visibleSubmenu.length > 0) {
          return (
            <SubmenuItem
              key={item.id}
              item={item}
              itemClassName={itemClassName}
              mode={mode}
              selectedValue={selectedValue}
              submenu={visibleSubmenu}
              submenuSide={item.submenuSide}
              onClose={onClose}
              onValueChange={onValueChange}
            />
          );
        }

        return (
          <button
            key={item.id}
            className={cn(
              "flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
              "hover:bg-bg-hover focus-visible:ring-accent/40 focus-visible:ring-2 focus-visible:outline-none",
              item.destructive &&
                "text-[var(--color-feedback-error)] hover:bg-[var(--color-feedback-error-soft)]",
              isSelected && "bg-accent/15 font-medium",
              item.disabled && "cursor-not-allowed opacity-50",
              item.className,
              itemClassName
            )}
            disabled={item.disabled}
            type="button"
            onClick={(event) => {
              if (mode === "select" && onValueChange) {
                onValueChange(item.id);
              }
              item.onSelect?.(event.nativeEvent);
              onClose();
            }}
          >
            {item.icon ? (
              <span className="inline-flex shrink-0 [&_svg]:h-4 [&_svg]:w-4">
                {item.icon}
              </span>
            ) : null}
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {item.shortcut ? (
              <span className="text-text-muted text-xs">{item.shortcut}</span>
            ) : null}
          </button>
        );
      })}
    </>
  );
}

function SubmenuItem({
  item,
  submenu,
  submenuSide = "left",
  itemClassName,
  mode,
  selectedValue,
  onValueChange,
  onClose,
}: {
  item: Extract<DropdownItem, { type?: "item" }>;
  submenu: DropdownItem[];
  submenuSide?: "top" | "right" | "bottom" | "left";
  itemClassName?: string;
  mode?: "action" | "select";
  selectedValue?: string;
  onValueChange?: (value: string) => void;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        ref={triggerRef}
        className={cn(
          "flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
          "hover:bg-bg-hover focus-visible:ring-accent/40 focus-visible:ring-2 focus-visible:outline-none",
          item.destructive &&
            "text-[var(--color-feedback-error)] hover:bg-[var(--color-feedback-error-soft)]",
          item.disabled && "cursor-not-allowed opacity-50",
          item.className,
          itemClassName
        )}
        disabled={item.disabled}
        type="button"
      >
        {item.icon ? (
          <span className="inline-flex shrink-0 [&_svg]:h-4 [&_svg]:w-4">
            {item.icon}
          </span>
        ) : null}
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        <ChevronRight className="text-text-muted h-4 w-4 shrink-0" />
      </button>
      <MenuPanel
        align="start"
        anchorRef={triggerRef}
        contentClassName="p-1"
        itemClassName={itemClassName}
        items={submenu}
        mode={mode}
        open={open}
        selectedValue={selectedValue}
        side={submenuSide}
        width={180}
        onNestedClose={onClose}
        onOpenChange={setOpen}
        onValueChange={onValueChange}
      />
    </div>
  );
}

export function MenuPanel({
  open,
  onOpenChange,
  anchorRef,
  items,
  align = "end",
  side = "bottom",
  width = 180,
  contentClassName,
  itemClassName,
  mode = "action",
  selectedValue,
  onValueChange,
  header,
  footer,
  customContent,
  preventCloseOnInteract = false,
  onNestedClose,
}: MenuPanelProps & { onNestedClose?: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({
    visibility: "hidden",
  });
  const panelId = useId();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const closeAll = useCallback(() => {
    onOpenChange(false);
    onNestedClose?.();
  }, [onNestedClose, onOpenChange]);

  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    const updatePosition = () => {
      const anchorRect = anchorRef.current?.getBoundingClientRect();
      const panelRect = panelRef.current?.getBoundingClientRect();
      if (!anchorRect || !panelRect) {
        return;
      }

      let top = anchorRect.bottom + 4;
      let left = anchorRect.left;
      const panelWidth =
        panelRect.width || (typeof width === "number" ? width : 192);

      if (side === "top") {
        top = anchorRect.top - panelRect.height - 4;
      } else if (side === "left") {
        top = anchorRect.top;
        left = anchorRect.left - panelWidth - 4;
      } else if (side === "right") {
        top = anchorRect.top;
        left = anchorRect.right + 4;
      }

      if (align === "center") {
        if (side === "top" || side === "bottom") {
          left = anchorRect.left + anchorRect.width / 2 - panelWidth / 2;
        } else {
          top = anchorRect.top + anchorRect.height / 2 - panelRect.height / 2;
        }
      } else if (align === "end") {
        if (side === "top" || side === "bottom") {
          left = anchorRect.right - panelWidth;
        } else {
          top = anchorRect.bottom - panelRect.height;
        }
      }

      const maxLeft = window.innerWidth - panelWidth - VIEWPORT_PADDING;
      const maxTop = window.innerHeight - panelRect.height - VIEWPORT_PADDING;

      setPanelStyle({
        position: "fixed",
        top: Math.min(Math.max(VIEWPORT_PADDING, top), maxTop),
        left: Math.min(Math.max(VIEWPORT_PADDING, left), maxLeft),
        minWidth: typeof width === "number" ? width : undefined,
        width: width === "full" ? anchorRect.width : undefined,
        zIndex: 9999,
        visibility: "visible",
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [align, anchorRef, open, side, width]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !panelRef.current?.contains(target) &&
        !anchorRef.current?.contains(target)
      ) {
        if (preventCloseOnInteract) {
          return;
        }
        closeAll();
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeAll();
      }
    };

    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onEscape);

    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onEscape);
    };
  }, [anchorRef, closeAll, open, preventCloseOnInteract]);

  if (!open || !isMounted) {
    return null;
  }

  const hasChrome = Boolean(header || footer || customContent);

  return createPortal(
    <div
      ref={panelRef}
      className={cn(
        "border-border-subtle bg-bg-surface-elevated text-text-primary overflow-hidden rounded-lg border shadow-lg",
        hasChrome ? "p-0" : "p-1",
        contentClassName
      )}
      id={panelId}
      role="menu"
      style={panelStyle}
      onClick={(event) => event.stopPropagation()}
      onWheel={(event) => {
        if (preventCloseOnInteract) {
          event.stopPropagation();
        }
      }}
    >
      {header ? (
        <div className="border-border-subtle border-b">{header}</div>
      ) : null}
      {customContent ? (
        <div
          className={preventCloseOnInteract ? "min-h-0" : undefined}
          onClick={(event) => event.stopPropagation()}
          onWheel={(event) => {
            if (preventCloseOnInteract) {
              event.stopPropagation();
            }
          }}
        >
          {customContent}
        </div>
      ) : (
        <div className={cn(hasChrome && "max-h-[300px] overflow-y-auto p-1")}>
          <MenuItems
            itemClassName={itemClassName}
            items={items}
            mode={mode}
            selectedValue={selectedValue}
            onClose={closeAll}
            onValueChange={onValueChange}
          />
        </div>
      )}
      {footer ? (
        <div className="border-border-subtle border-t p-1">{footer}</div>
      ) : null}
    </div>,
    document.body
  );
}
